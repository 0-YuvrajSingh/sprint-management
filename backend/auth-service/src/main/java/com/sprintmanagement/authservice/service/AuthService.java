package com.sprintmanagement.authservice.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import com.sprintmanagement.authservice.dto.AuthResponse;
import com.sprintmanagement.authservice.dto.LoginRequest;
import com.sprintmanagement.authservice.dto.LogoutRequest;
import com.sprintmanagement.authservice.dto.RefreshTokenRequest;
import com.sprintmanagement.authservice.dto.RegisterRequest;
import com.sprintmanagement.authservice.dto.UserProfileRequest;
import com.sprintmanagement.authservice.entity.Role;
import com.sprintmanagement.authservice.entity.User;
import com.sprintmanagement.authservice.exception.EmailAlreadyExistsException;
import com.sprintmanagement.authservice.exception.InvalidCredentialsException;
import com.sprintmanagement.authservice.exception.ProfileSyncException;
import com.sprintmanagement.authservice.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);
    private static final String REFRESH_TOKEN_KEY_PREFIX = "auth:refresh:user:";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final StringRedisTemplate redisTemplate;
    private final RestTemplate restTemplate;

    @Value("${gateway.secret}")
    private String gatewaySecret;

    @Value("${jwt.refresh-expiration:1209600000}")
    private long refreshTokenTtlMillis;

    @Transactional
    public void registerUser(RegisterRequest registerRequest) {

        Role role = getDefaultRole();

        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new EmailAlreadyExistsException(registerRequest.getEmail());
        }

        User user = User.builder()
                .email(registerRequest.getEmail())
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .role(role)
                .build();

        userRepository.save(user);

        syncUserProfile(registerRequest, role);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest loginRequest) {

        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(InvalidCredentialsException::new);

        if (!passwordEncoder.matches(
                loginRequest.getPassword(),
                user.getPassword())) {

            throw new InvalidCredentialsException();
        }

        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);
        storeRefreshToken(user.getId(), refreshToken);

        return AuthResponse.of(accessToken, refreshToken);
    }

    @Transactional(readOnly = true)
    public AuthResponse refresh(RefreshTokenRequest request) {
        String refreshToken = request.getRefreshToken();

        if (!jwtService.isRefreshTokenValid(refreshToken)) {
            throw new InvalidCredentialsException("Invalid or expired refresh token");
        }

        Long userId = jwtService.extractUserId(refreshToken);
        if (!isRefreshTokenStored(userId, refreshToken)) {
            throw new InvalidCredentialsException("Refresh token has been revoked");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new InvalidCredentialsException("Invalid refresh token user"));

        String newAccessToken = jwtService.generateAccessToken(user);
        String newRefreshToken = jwtService.generateRefreshToken(user);
        storeRefreshToken(user.getId(), newRefreshToken);

        return AuthResponse.of(newAccessToken, newRefreshToken);
    }

    @Transactional(readOnly = true)
    public void logout(String userIdHeader, LogoutRequest request) {
        Long userId = parseUserId(userIdHeader);

        String refreshToken = request == null ? null : request.getRefreshToken();
        if (refreshToken != null && !refreshToken.isBlank()) {
            if (!jwtService.isRefreshTokenValid(refreshToken)) {
                throw new InvalidCredentialsException("Invalid or expired refresh token");
            }

            Long refreshTokenUserId = jwtService.extractUserId(refreshToken);
            if (!userId.equals(refreshTokenUserId)) {
                throw new InvalidCredentialsException("Refresh token does not belong to authenticated user");
            }
        }

        revokeRefreshToken(userId);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────
    private Role getDefaultRole() {
        return Role.VIEWER;
    }

    private void storeRefreshToken(Long userId, String refreshToken) {
        String key = refreshTokenKey(userId);
        String hashedToken = sha256(refreshToken);
        redisTemplate.opsForValue().set(key, hashedToken, Duration.ofMillis(refreshTokenTtlMillis));
    }

    private boolean isRefreshTokenStored(Long userId, String refreshToken) {
        String storedHash = redisTemplate.opsForValue().get(refreshTokenKey(userId));
        if (storedHash == null || storedHash.isBlank()) {
            return false;
        }

        String incomingHash = sha256(refreshToken);
        return MessageDigest.isEqual(
                incomingHash.getBytes(StandardCharsets.UTF_8),
                storedHash.getBytes(StandardCharsets.UTF_8)
        );
    }

    private void revokeRefreshToken(Long userId) {
        redisTemplate.delete(refreshTokenKey(userId));
    }

    private String refreshTokenKey(Long userId) {
        return REFRESH_TOKEN_KEY_PREFIX + userId;
    }

    private Long parseUserId(String userIdHeader) {
        if (userIdHeader == null || userIdHeader.isBlank()) {
            throw new InvalidCredentialsException("Missing authenticated user id");
        }

        try {
            return Long.valueOf(userIdHeader.trim());
        } catch (NumberFormatException ex) {
            throw new InvalidCredentialsException("Invalid authenticated user id");
        }
    }

    private String sha256(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(value.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder(hash.length * 2);
            for (byte b : hash) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 algorithm unavailable", ex);
        }
    }

    /*
     * Internal service-to-service call.
     * Authenticated using gateway secret.
     * ADMIN role is used only for trusted internal communication.
     * Client cannot trigger this directly.
     */
    private void syncUserProfile(RegisterRequest req, Role role) {

        try {

            HttpHeaders headers = new HttpHeaders();
            headers.set("X-Gateway-Secret", gatewaySecret);
            headers.set("X-User-Id", "system-auth-service");
            headers.set("X-User-Email", "system@auth-service");
            headers.set("X-User-Role", Role.ADMIN.name());
            headers.set("Content-Type", "application/json");

            UserProfileRequest body = new UserProfileRequest(
                    req.getName(),
                    req.getEmail(),
                    role
            );

            restTemplate.exchange(
                    "http://user-service/api/v1/users/register",
                    HttpMethod.POST,
                    new HttpEntity<>(body, headers),
                    Void.class
            );

        } catch (HttpClientErrorException.Conflict ex) {

            log.info(
                    "User profile already exists in user-service for email={}, skipping sync",
                    req.getEmail()
            );
            return;

        } catch (RestClientException ex) {

            log.warn(
                    "Failed to sync user profile for email={}",
                    req.getEmail(),
                    ex
            );

            throw new ProfileSyncException(req.getEmail(), ex);
        }
    }
}
