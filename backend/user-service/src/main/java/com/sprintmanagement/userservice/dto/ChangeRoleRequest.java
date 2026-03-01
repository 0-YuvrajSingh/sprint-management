package com.sprintmanagement.userservice.dto;

import com.sprintmanagement.userservice.entity.UserRole;
import jakarta.validation.constraints.NotNull;

public class ChangeRoleRequest {

    @NotNull
    private UserRole role;

    public ChangeRoleRequest() {}

    public ChangeRoleRequest(UserRole role) {
        this.role = role;
    }

    public UserRole getRole() {
        return role;
    }

    public void setRole(UserRole role) {
        this.role = role;
    }
}
