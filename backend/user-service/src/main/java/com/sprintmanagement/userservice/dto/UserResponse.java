package com.sprintmanagement.userservice.dto;

import com.sprintmanagement.userservice.entity.User;
import com.sprintmanagement.userservice.entity.UserRole;

import java.time.Instant;
import java.util.UUID;

public class UserResponse {

    private UUID id;
    private String name;
    private String email;
    private UserRole role;
    private Instant createdDate;

    public UserResponse() {
    }

    public UserResponse(UUID id, String name, String email, UserRole role, Instant createdDate) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
        this.createdDate = createdDate;
    }

    public static UserResponse fromEntity(User user) {
        if (user == null) {
            return null;
        }
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getCreatedDate()
        );
    }

    public UUID getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public UserRole getRole() {
        return role;
    }

    public Instant getCreatedDate() {
        return createdDate;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setRole(UserRole role) {
        this.role = role;
    }

    public void setCreatedDate(Instant createdDate) {
        this.createdDate = createdDate;
    }
}
