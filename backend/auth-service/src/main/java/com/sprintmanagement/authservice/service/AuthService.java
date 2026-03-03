package com.sprintmanagement.authservice.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sprintmanagement.authservice.dto.AuthResponse;
import com.sprintmanagement.authservice.dto.LoginRequest;
import com.sprintmanagement.authservice.dto.RegisterRequest;
import com.sprintmanagement.authservice.entity.User;
import com.sprintmanagement.authservice.exception.EmailAlreadyExistsException;
import com.sprintmanagement.authservice.exception.InvalidCredentialsException;
import com.sprintmanagement.authservice.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Transactional
    public void registerUser(RegisterRequest registerRequest) {
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            // WARN: do not change to a generic message — 409 vs 401 distinction is intentional.
            throw new EmailAlreadyExistsException(registerRequest.getEmail());
        }
        User user = User.builder()
                .email(registerRequest.getEmail())
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .role(registerRequest.getRole())
                .build();
        userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest loginRequest) {
        User user = userRepository.findByEmail(loginRequest.getEmail())
                // Use the same exception as wrong-password to avoid email enumeration.
                .orElseThrow(InvalidCredentialsException::new);

        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            throw new InvalidCredentialsException();
        }

        String token = jwtService.generateToken(user);
        return new AuthResponse(token);
    }
}
