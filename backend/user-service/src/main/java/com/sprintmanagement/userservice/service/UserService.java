package com.sprintmanagement.userservice.service;

import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sprintmanagement.userservice.dto.InternalUserProfileRequest;
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

    @Value("${gateway.secret}")
    private String gatewaySecret;

    private static final Logger log = LoggerFactory.getLogger(UserService.class);

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
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
    /**
     * Admin/manager create user endpoint.
     * Role is REQUIRED and strictly validated.
     */
    public UserResponse createUser(UserRequest request, HttpHeaders headers) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResourceConflictException("Email already exists");
        }

        if (request.getRole() == null) {
            throw new IllegalArgumentException("Role is required for admin create");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setRole(request.getRole());

        try {
            User saved = userRepository.save(user);
            log.debug("Created user (admin) id={} email={} role={}", saved.getId(), saved.getEmail(), saved.getRole());
            return UserResponse.fromEntity(saved);
        } catch (DataIntegrityViolationException ex) {
            throw new ResourceConflictException("Email already exists");
        }
    }

    /**
     * Internal-only endpoint for auth-service to sync registered user profile.
     * Role is optional; defaults to VIEWER if not provided.
     * Validates gateway secret.
     */
    public UserResponse createUserProfile(InternalUserProfileRequest request, HttpHeaders headers) {
        if (!isInternalCall(headers)) {
            throw new SecurityException("Unauthorized: invalid gateway secret");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResourceConflictException("Email already exists");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setRole(request.getRole() != null ? request.getRole() : UserRole.VIEWER);

        try {
            User saved = userRepository.save(user);
            log.debug("Created user (internal) id={} email={} role={}", saved.getId(), saved.getEmail(), saved.getRole());
            return UserResponse.fromEntity(saved);
        } catch (DataIntegrityViolationException ex) {
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

        return UserResponse.fromEntity(user);
    }

    public UserResponse changeRole(UUID id, UserRole newRole, Authentication authentication) {
        User user = requireUser(id);
        UserRole callerRole = extractCallerRole(authentication);
        
        // Validate role hierarchy: prevent privilege escalation
        if (!canAssignRole(callerRole, newRole)) {
            throw new SecurityException(
                    String.format("Caller role %s cannot assign role %s", callerRole, newRole)
            );
        }
        
        user.setRole(newRole);
        log.debug("Role changed for user id={} to {} by caller role {}", id, newRole, callerRole);
        return UserResponse.fromEntity(user);
    }

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

    private boolean isInternalCall(HttpHeaders headers) {

        if (headers == null) {
            return false;
        }

        String secret = headers.getFirst("X-Gateway-Secret");

        return gatewaySecret.equals(secret);
    }

    /**
     * Extract the caller's role from the Authentication object.
     * Assumes role is stored in GrantedAuthority with "ROLE_" prefix.
     */
    private UserRole extractCallerRole(Authentication authentication) {
        if (authentication == null || authentication.getAuthorities().isEmpty()) {
            throw new SecurityException("Authentication not found or has no authorities");
        }

        // Extract role from authorities (assuming format: ROLE_ADMIN, ROLE_MANAGER, etc.)
        String roleString = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .filter(auth -> auth.startsWith("ROLE_"))
                .map(auth -> auth.substring(5)) // Remove "ROLE_" prefix
                .findFirst()
                .orElseThrow(() -> new SecurityException("No role found in authentication"));

        return UserRole.valueOf(roleString);
    }

    /**
     * Determine if caller can assign the given role based on hierarchy.
     * Hierarchy (highest to lowest): ADMIN > MANAGER > DEVELOPER > VIEWER
     * Rules:
     * - ADMIN can assign any role
     * - MANAGER can assign DEVELOPER and VIEWER only (not ADMIN or MANAGER)
     * - DEVELOPER and VIEWER cannot assign roles
     */
    private boolean canAssignRole(UserRole callerRole, UserRole targetRole) {
        switch (callerRole) {
            case ADMIN:
                // ADMIN can assign any role
                return true;
            case MANAGER:
                // MANAGER can assign DEVELOPER and VIEWER only
                return targetRole == UserRole.DEVELOPER || targetRole == UserRole.VIEWER;
            case DEVELOPER:
            case VIEWER:
                // DEVELOPER and VIEWER cannot assign any role
                return false;
            default:
                return false;
        }
    }
}
