package com.sprintmanagement.authservice.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
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

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RestTemplate restTemplate;

    @Value("${gateway.secret}")
    private String gatewaySecret;

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

        String token = jwtService.generateToken(user);

        return new AuthResponse(token);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────
    private Role getDefaultRole() {
        return Role.VIEWER;
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
