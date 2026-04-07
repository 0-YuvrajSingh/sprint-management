package com.sprintmanagement.authservice.dto;

import lombok.Data;

@Data
public class LogoutRequest {

    private String refreshToken;
}
