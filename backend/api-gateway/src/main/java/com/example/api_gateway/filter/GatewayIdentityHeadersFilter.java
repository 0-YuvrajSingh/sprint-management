package com.example.api_gateway.filter;

import java.nio.charset.StandardCharsets;
import java.security.Key;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.headers.HttpHeadersFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Component
public class GatewayIdentityHeadersFilter implements HttpHeadersFilter, Ordered {

    @Value("${gateway.secret}")
    private String gatewaySecret;

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Override
    public HttpHeaders filter(HttpHeaders input, ServerWebExchange exchange) {
        HttpHeaders filtered = new HttpHeaders();
        filtered.putAll(input);

        // Never trust client-supplied internal identity headers.
        filtered.remove("X-User-Email");
        filtered.remove("X-User-Role");
        filtered.remove("X-Gateway-Secret");

        String authHeader = input.getFirst(HttpHeaders.AUTHORIZATION);
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return filtered;
        }

        String token = authHeader.substring(7).trim();
        if (token.isEmpty()) {
            return filtered;
        }

        try {
            Claims claims = parseAndValidate(token);
            String email = claims.getSubject();
            String role = claims.get("role", String.class);

            if (email == null || email.isBlank() || role == null || role.isBlank()) {
                return filtered;
            }

            filtered.set("X-User-Email", email);
            filtered.set("X-User-Role", role);
            filtered.set("X-Gateway-Secret", gatewaySecret);
        } catch (JwtException | IllegalArgumentException ignored) {
            // Leave headers sanitized and let downstream auth fail naturally.
        }

        return filtered;
    }

    @Override
    public boolean supports(Type type) {
        return type == Type.REQUEST;
    }

    @Override
    public int getOrder() {
        return Ordered.LOWEST_PRECEDENCE;
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
