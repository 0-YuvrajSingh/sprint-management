package com.sprintmanagement.userservice.dto;

import com.sprintmanagement.userservice.entity.ApiRole;

import java.time.Instant;
import java.util.UUID;

public class UserResponse {

    private UUID id;

    private String name;

    private String email;

    private ApiRole userRole;

    private Instant createdDate;

    public UserResponse() {
    }

    public UserResponse(UUID id, String name, String email, ApiRole userRole, Instant createdDate) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.userRole = userRole;
        this.createdDate = createdDate;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public ApiRole getUserRole() {
        return userRole;
    }

    public void setUserRole(ApiRole userRole) {
        this.userRole = userRole;
    }

    public Instant getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(Instant createdDate) {
        this.createdDate = createdDate;
    }
}