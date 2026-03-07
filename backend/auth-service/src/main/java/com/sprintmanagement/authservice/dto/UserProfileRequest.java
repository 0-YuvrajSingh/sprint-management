package com.sprintmanagement.authservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserProfileRequest {

    private String name;
    private String email;
    private String role;
}
