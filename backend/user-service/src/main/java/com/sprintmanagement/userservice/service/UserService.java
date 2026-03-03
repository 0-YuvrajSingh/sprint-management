package com.sprintmanagement.userservice.service;

import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sprintmanagement.userservice.dto.UpdateUserRequest;
import com.sprintmanagement.userservice.dto.UserRequest;
import com.sprintmanagement.userservice.dto.UserResponse;
import com.sprintmanagement.userservice.entity.User;
import com.sprintmanagement.userservice.entity.UserRole;
import com.sprintmanagement.userservice.exception.ResourceConflictException;
import com.sprintmanagement.userservice.exception.ResourceNotFoundException;
import com.sprintmanagement.userservice.repository.UserRepository;

@Service
@Transactional
public class UserService {

    private static final Logger log = LoggerFactory.getLogger(UserService.class);

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository,
            BCryptPasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // ── Queries ───────────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public Page<UserResponse> findAll(Pageable pageable) {
        return userRepository.findAll(pageable)
                .map(UserResponse::fromEntity);
    }

    @Transactional(readOnly = true)
    public UserResponse findById(UUID id) {
        return UserResponse.fromEntity(requireUser(id));
    }

    // ── Commands ──────────────────────────────────────────────────────────────
    public UserResponse createUser(UserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResourceConflictException("Email already exists");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole() != null ? request.getRole() : UserRole.DEVELOPER);

        try {
            User saved = userRepository.save(user);
            log.debug("Created user id={} email={}", saved.getId(), saved.getEmail());
            return UserResponse.fromEntity(saved);
        } catch (DataIntegrityViolationException ex) {
            // WARN: race-condition guard — unique constraint still catches concurrent inserts.
            throw new ResourceConflictException("Email already exists");
        }
    }

    public UserResponse updateUser(UUID id, UpdateUserRequest request) {
        User user = requireUser(id);

        if (request.getName() != null && !request.getName().isBlank()) {
            user.setName(request.getName());
        }

        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new ResourceConflictException("Email already exists");
            }
            user.setEmail(request.getEmail());
        }

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        return UserResponse.fromEntity(user);
    }

    @PreAuthorize("hasRole('ADMIN') or (hasRole('MANAGER') and #newRole.name() != 'ADMIN')")
    public UserResponse changeRole(UUID id, UserRole newRole) {
        User user = requireUser(id);
        user.setRole(newRole);
        log.debug("Role changed for user id={} to {}", id, newRole);
        return UserResponse.fromEntity(user);
    }

    @PreAuthorize("hasRole('ADMIN')")
    public void deleteUser(UUID id) {
        User user = requireUser(id);
        userRepository.delete(user);
        log.debug("Deleted user id={}", id);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────
    private User requireUser(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }
}
