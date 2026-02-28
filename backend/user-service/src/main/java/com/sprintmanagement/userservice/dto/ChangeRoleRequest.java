package com.sprintmanagement.userservice.dto;

import com.sprintmanagement.userservice.entity.UserRole;

public class ChangeRoleRequest {

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
