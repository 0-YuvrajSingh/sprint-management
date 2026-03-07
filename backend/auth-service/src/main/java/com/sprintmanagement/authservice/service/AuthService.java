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
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import com.sprintmanagement.authservice.dto.AuthResponse;
import com.sprintmanagement.authservice.dto.LoginRequest;
import com.sprintmanagement.authservice.dto.RegisterRequest;
import com.sprintmanagement.authservice.dto.UserProfileRequest;
import com.sprintmanagement.authservice.entity.User;
import com.sprintmanagement.authservice.exception.EmailAlreadyExistsException;
import com.sprintmanagement.authservice.exception.InvalidCredentialsException;
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
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new EmailAlreadyExistsException(registerRequest.getEmail());
        }
        User user = User.builder()
                .email(registerRequest.getEmail())
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .role(registerRequest.getRole())
                .build();
        userRepository.save(user);

        syncUserProfile(registerRequest);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest loginRequest) {
        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(InvalidCredentialsException::new);

        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            throw new InvalidCredentialsException();
        }

        String token = jwtService.generateToken(user);
        return new AuthResponse(token);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────
    private void syncUserProfile(RegisterRequest req) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("X-Gateway-Secret", gatewaySecret);
            headers.set("X-User-Email", "system@auth-service");
            headers.set("X-User-Role", "ADMIN");
            headers.set("Content-Type", "application/json");

            UserProfileRequest body = new UserProfileRequest(
                    req.getName(),
                    req.getEmail(),
                    req.getRole().name()
            );

            restTemplate.exchange(
                    "http://user-service/api/users",
                    HttpMethod.POST,
                    new HttpEntity<>(body, headers),
                    Void.class
            );
        } catch (RestClientException ex) {
            log.warn("Failed to sync user profile to user-service for email={}: {}",
                    req.getEmail(), ex.getMessage());
        }
    }
}
