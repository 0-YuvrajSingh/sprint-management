package com.sprintmanagement.userservice.service;

import com.sprintmanagement.userservice.dto.UpdateUserRequest;
import com.sprintmanagement.userservice.dto.UserRequest;
import com.sprintmanagement.userservice.dto.UserResponse;
import com.sprintmanagement.userservice.entity.User;
import com.sprintmanagement.userservice.entity.UserRole;
import com.sprintmanagement.userservice.exception.ResourceConflictException;
import com.sprintmanagement.userservice.exception.ResourceNotFoundException;
import com.sprintmanagement.userservice.repository.UserRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public Page<UserResponse> findAll(Pageable pageable) {
        return userRepository.findAll(pageable)
                .map(UserResponse::fromEntity);
    }

    @Transactional(readOnly = true)
    public UserResponse findById(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));
        return UserResponse.fromEntity(user);
    }

    public UserResponse createUser(UserRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResourceConflictException("Email already exists");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(
                request.getRole() != null
                        ? request.getRole()
                        : UserRole.DEVELOPER
        );

        try {
            User saved = userRepository.save(user);
            return UserResponse.fromEntity(saved);
        } catch (DataIntegrityViolationException ex) {
            throw new ResourceConflictException("Email already exists");
        }
    }

    public UserResponse updateUser(UUID id, UpdateUserRequest request) {

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        if (request.getName() != null && !request.getName().isBlank()) {
            user.setName(request.getName());
        }

        if (request.getEmail() != null &&
                !request.getEmail().equals(user.getEmail())) {

            if (userRepository.existsByEmail(request.getEmail())) {
                throw new ResourceConflictException("Email already exists");
            }

            user.setEmail(request.getEmail());
        }

        if (request.getPassword() != null &&
                !request.getPassword().isBlank()) {

            user.setPassword(
                    passwordEncoder.encode(request.getPassword())
            );
        }

        return UserResponse.fromEntity(user);
    }

    @PreAuthorize("hasRole('ADMIN') or (hasRole('MANAGER') and #newRole.name() != 'ADMIN')")
    public UserResponse changeRole(UUID id, UserRole newRole) {

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        user.setRole(newRole);

        return UserResponse.fromEntity(user);
    }

    @PreAuthorize("hasRole('ADMIN')")
    public void deleteUser(UUID id) {

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        userRepository.delete(user);
    }
}