package com.sprintmanagement.userservice.dto;

import com.sprintmanagement.userservice.entity.UserRole;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Internal-only DTO for service-to-service user profile sync (auth-service to user-service).
 * Gateway-authenticated calls only.
 * Role is optional here; defaults to VIEWER if not provided.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InternalUserProfileRequest {

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be a valid address")
    private String email;

    private UserRole role;
}
