package com.sprintmanagement.authservice.dto;

import com.sprintmanagement.authservice.entity.Role;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserProfileRequest {

    private String name;
    private String email;
    private Role role;
}
