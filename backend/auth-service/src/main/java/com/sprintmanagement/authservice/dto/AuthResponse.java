package com.sprintmanagement.authservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    private String token;

    private String accessToken;

    private String refreshToken;

    public static AuthResponse of(String accessToken, String refreshToken) {
        return new AuthResponse(accessToken, accessToken, refreshToken);
    }
}
