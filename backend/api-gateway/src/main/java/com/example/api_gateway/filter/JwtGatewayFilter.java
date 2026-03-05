package com.example.api_gateway.filter;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import reactor.core.publisher.Mono;

@Component
public class JwtGatewayFilter implements GlobalFilter, Ordered {

    private static final Logger log = LoggerFactory.getLogger(JwtGatewayFilter.class);

    // ── Public paths (no JWT required) ──────────────────────────────────────
    private static final List<String> PUBLIC_PATHS = List.of(
            "/auth/login",
            "/auth/register"
    );

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${gateway.secret}")
    private String gatewaySecret;

    @Override
    public int getOrder() {
        return -1;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String path = exchange.getRequest().getURI().getPath();

        if (isPublicPath(path)) {
            return chain.filter(exchange);
        }

        String authHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            log.warn("Missing or malformed Authorization header for path: {}", path);
            return unauthorised(exchange, "Missing or malformed Authorization header");
        }

        String token = authHeader.substring(7);

        Claims claims;
        try {
            claims = parseAndValidate(token);
        } catch (JwtException | IllegalArgumentException ex) {
            log.warn("JWT validation failed for path {}: {}", path, ex.getMessage());
            return unauthorised(exchange, "Invalid or expired token");
        }

        String email = claims.getSubject();
        String role = claims.get("role", String.class);

        if (email == null || role == null) {
            log.warn("JWT missing required claims (sub/role) for path: {}", path);
            return unauthorised(exchange, "Token is missing required claims");
        }

        ServerWebExchange mutatedExchange = exchange.mutate()
                .request(r -> r
                .headers(headers -> {
                    headers.remove("X-User-Email");
                    headers.remove("X-User-Role");
                    headers.remove("X-Gateway-Secret");
                    headers.remove(HttpHeaders.AUTHORIZATION);
                })
                .header("X-User-Email", email)
                .header("X-User-Role", role)
                .header("X-Gateway-Secret", gatewaySecret)
                )
                .build();

        return chain.filter(mutatedExchange);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────
    private boolean isPublicPath(String path) {
        return PUBLIC_PATHS.stream().anyMatch(path::startsWith);
    }

    private Claims parseAndValidate(String token) {
        Key signingKey = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
        return Jwts.parserBuilder()
                .setSigningKey(signingKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private Mono<Void> unauthorised(ServerWebExchange exchange, String message) {
        exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
        exchange.getResponse().getHeaders().setContentType(MediaType.APPLICATION_JSON);
        byte[] body = ("{\"error\":\"" + message + "\"}").getBytes(StandardCharsets.UTF_8);
        return exchange.getResponse()
                .writeWith(Mono.just(exchange.getResponse().bufferFactory().wrap(body)));
    }
}
