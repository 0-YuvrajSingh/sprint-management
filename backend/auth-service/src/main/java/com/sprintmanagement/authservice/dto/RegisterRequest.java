package com.sprintmanagement.authservice.dto;

import com.sprintmanagement.authservice.entity.Role;
import lombok.Data;

@Data
public class RegisterRequest {

    private String email;
    private String password;
    private Role role;
}