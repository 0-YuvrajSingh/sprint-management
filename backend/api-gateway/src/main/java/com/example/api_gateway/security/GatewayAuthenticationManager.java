package com.example.api_gateway.security;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.ReactiveAuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import reactor.core.publisher.Mono;

@Component
public class GatewayAuthenticationManager implements ReactiveAuthenticationManager {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Override
    public Mono<Authentication> authenticate(Authentication authentication) {
        if (authentication == null || authentication.getCredentials() == null) {
            return Mono.empty();
        }

        String token = authentication.getCredentials().toString();

        try {
            Claims claims = parseAndValidate(token);
            String email = claims.getSubject();
            String role = claims.get("role", String.class);

            if (email == null || email.isBlank() || role == null || role.isBlank()) {
                return Mono.empty();
            }

            Authentication authenticated = UsernamePasswordAuthenticationToken.authenticated(
                    email,
                    token,
                    List.of(new SimpleGrantedAuthority("ROLE_" + role))
            );

            return Mono.just(authenticated);
        } catch (JwtException | IllegalArgumentException ex) {
            return Mono.empty();
        }
    }

    private Claims parseAndValidate(String token) {
        Key signingKey = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
        return Jwts.parserBuilder()
                .setSigningKey(signingKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
