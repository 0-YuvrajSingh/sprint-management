package com.sprintmanagement.apigateway.filter;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.function.Consumer;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.cloud.gateway.route.Route;
import org.springframework.cloud.gateway.support.ServerWebExchangeUtils;
import org.springframework.core.Ordered;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpRequestDecorator;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.server.ServerWebExchange;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sprintmanagement.common.error.ErrorCode;
import com.sprintmanagement.common.error.ErrorResponse;
import com.sprintmanagement.common.error.ErrorResponseBuilder;
import com.sprintmanagement.common.error.ErrorUtils;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import reactor.core.publisher.Mono;

@Component
public class GatewayIdentityHeadersFilter implements GlobalFilter, Ordered {

    private static final Logger log = LoggerFactory.getLogger(GatewayIdentityHeadersFilter.class);
    private static final AntPathMatcher PATH_MATCHER = new AntPathMatcher();
    private static final Set<String> ALLOWED_ROLES = Set.of("ADMIN", "MANAGER", "DEVELOPER", "VIEWER", "USER");
    private static final String ACCESS_BLACKLIST_KEY_PREFIX = "gateway:blacklist:access:";
    private static final Map<String, Set<String>> ROUTE_ROLE_REQUIREMENTS = new LinkedHashMap<>();

    static {
        ROUTE_ROLE_REQUIREMENTS.put("/api/admin/**", Set.of("ADMIN"));
        ROUTE_ROLE_REQUIREMENTS.put("/api/v1/admin/**", Set.of("ADMIN"));
        ROUTE_ROLE_REQUIREMENTS.put("/api/projects/**", Set.of("ADMIN", "MANAGER", "DEVELOPER", "VIEWER"));
        ROUTE_ROLE_REQUIREMENTS.put("/api/v1/projects/**", Set.of("ADMIN", "MANAGER", "DEVELOPER", "VIEWER"));
    }

    @Value("${gateway.secret}")
    private String gatewaySecret;

    @Value("${jwt.secret}")
    private String jwtSecret;

    private final ObjectMapper objectMapper;
    private final StringRedisTemplate redisTemplate;

    public GatewayIdentityHeadersFilter(ObjectMapper objectMapper, StringRedisTemplate redisTemplate) {
        this.objectMapper = objectMapper;
        this.redisTemplate = redisTemplate;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerWebExchange sanitizedExchange = sanitizeIncomingHeaders(exchange);
        String path = sanitizedExchange.getRequest().getPath().value();
        String method = String.valueOf(sanitizedExchange.getRequest().getMethod());
        String requestId = ErrorUtils.resolveTraceId(
                sanitizedExchange.getRequest().getHeaders().getFirst(ErrorUtils.TRACE_ID_HEADER)
        );
        sanitizedExchange.getResponse().getHeaders().set(ErrorUtils.TRACE_ID_HEADER, requestId);

        if (isPublicRoute(sanitizedExchange)) {
            ServerWebExchange publicForwardedExchange = stripAuthorizationHeader(sanitizedExchange);
            return chain.filter(publicForwardedExchange)
                    .doFinally(signal -> logRequest("anonymous", requestId, method, path, statusCode(sanitizedExchange)));
        }

        String authHeader = sanitizedExchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return unauthorized(sanitizedExchange, requestId, "Missing or invalid Authorization header");
        }

        String token = authHeader.substring(7).trim();
        if (token.isEmpty()) {
            return unauthorized(sanitizedExchange, requestId, "Missing or invalid Authorization header");
        }

        if (!hasValidJwtStructure(token)) {
            return unauthorized(sanitizedExchange, requestId, "Malformed JWT");
        }

        try {
            Claims claims = parseAndValidate(token);
            String userId = resolveUserId(claims);
            String role = resolveRole(claims);
            String tokenType = resolveTokenType(claims);

            if (userId == null || role == null || !"access".equals(tokenType)) {
                return unauthorized(sanitizedExchange, requestId, "Invalid token claims");
            }

            Boolean revoked = isAccessTokenBlacklisted(token);
            if (Boolean.TRUE.equals(revoked)) {
                return unauthorized(sanitizedExchange, requestId, "Token has been revoked");
            }
            if (revoked == null) {
                log.warn("gateway_blacklist_unavailable requestId={} path={}", requestId, path);
            }

            if (isLogoutRoute(path) && !blacklistAccessToken(token, claims.getExpiration())) {
                log.warn("gateway_blacklist_write_unavailable requestId={} path={}", requestId, path);
            }

            if (!isAuthorizedForRoute(sanitizedExchange, path, role)) {
                return forbidden(sanitizedExchange, requestId, userId, role, path, method, "Insufficient role for route");
            }

            ServerWebExchange forwardedExchange = withTransformedHeaders(sanitizedExchange, headers -> {
                headers.remove(HttpHeaders.AUTHORIZATION);
                headers.set("X-User-Id", userId);
                headers.set("X-User-Role", role);
                headers.set("X-Gateway-Secret", gatewaySecret);

                String email = claims.get("email", String.class);
                if (email != null && !email.isBlank()) {
                    headers.set("X-User-Email", email);
                }
            });
            return chain.filter(forwardedExchange)
                    .doFinally(signal -> logRequest(userId, requestId, method, path, statusCode(forwardedExchange)));
        } catch (JwtException | IllegalArgumentException ex) {
            return unauthorized(sanitizedExchange, requestId, "Invalid or expired token");
        }
    }

    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE;
    }

    private Claims parseAndValidate(String token) {
        Key signingKey = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
        return Jwts.parserBuilder()
                .setSigningKey(signingKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private ServerWebExchange sanitizeIncomingHeaders(ServerWebExchange exchange) {
        return withTransformedHeaders(exchange, headers -> {
            headers.remove("X-User-Id");
            headers.remove("X-User-Email");
            headers.remove("X-User-Role");
            headers.remove("X-Gateway-Secret");
        });
    }

    private boolean isPublicRoute(ServerWebExchange exchange) {
        if (HttpMethod.OPTIONS.equals(exchange.getRequest().getMethod())) {
            return true;
        }

        String path = exchange.getRequest().getPath().value();
        return "/auth/login".equals(path)
                || "/api/v1/auth/login".equals(path)
                || "/auth/register".equals(path)
                || "/api/v1/auth/register".equals(path)
                || "/auth/refresh".equals(path)
                || "/api/v1/auth/refresh".equals(path)
                || path.startsWith("/actuator");
    }

    private boolean isLogoutRoute(String path) {
        return "/auth/logout".equals(path)
                || "/api/v1/auth/logout".equals(path);
    }

    private String resolveUserId(Claims claims) {
        String userId = claims.getSubject();
        if (userId != null && !userId.isBlank()) {
            return userId;
        }

        String legacyUserId = claims.get("userId", String.class);
        if (legacyUserId != null && !legacyUserId.isBlank()) {
            return legacyUserId;
        }

        return null;
    }

    private String resolveRole(Claims claims) {
        String rawRole = claims.get("role", String.class);
        if (rawRole == null || rawRole.isBlank()) {
            return null;
        }

        String normalizedRole = rawRole.trim().toUpperCase(Locale.ROOT);
        if (!ALLOWED_ROLES.contains(normalizedRole)) {
            return null;
        }

        if ("USER".equals(normalizedRole)) {
            return "VIEWER";
        }

        return normalizedRole;
    }

    private String resolveTokenType(Claims claims) {
        String tokenType = claims.get("type", String.class);
        if (tokenType == null || tokenType.isBlank()) {
            return null;
        }
        return tokenType.trim().toLowerCase(Locale.ROOT);
    }

    private boolean hasValidJwtStructure(String token) {
        String[] parts = token.split("\\.");
        return parts.length == 3;
    }

    private boolean isAuthorizedForRoute(ServerWebExchange exchange, String path, String role) {
        Set<String> metadataRoles = resolveRolesFromRouteMetadata(exchange);
        if (metadataRoles != null) {
            return metadataRoles.contains(role);
        }

        return isAuthorizedForPath(path, role);
    }

    private boolean isAuthorizedForPath(String path, String role) {
        for (Map.Entry<String, Set<String>> rule : ROUTE_ROLE_REQUIREMENTS.entrySet()) {
            if (PATH_MATCHER.match(rule.getKey(), path)) {
                return rule.getValue().contains(role);
            }
        }
        return true;
    }

    private Set<String> resolveRolesFromRouteMetadata(ServerWebExchange exchange) {
        Object routeAttribute = exchange.getAttribute(ServerWebExchangeUtils.GATEWAY_ROUTE_ATTR);
        if (!(routeAttribute instanceof Route route)) {
            return null;
        }

        Object requiredRolesMetadata = route.getMetadata().get("requiredRoles");
        if (!(requiredRolesMetadata instanceof String rolesValue) || rolesValue.isBlank()) {
            return null;
        }

        Set<String> roles = new java.util.HashSet<>();
        for (String role : rolesValue.split(",")) {
            if (role != null && !role.isBlank()) {
                roles.add(role.trim().toUpperCase(Locale.ROOT));
            }
        }

        return roles.isEmpty() ? null : Set.copyOf(roles);
    }

    private ServerWebExchange stripAuthorizationHeader(ServerWebExchange exchange) {
        return withTransformedHeaders(exchange, headers -> headers.remove(HttpHeaders.AUTHORIZATION));
    }

    private ServerWebExchange withTransformedHeaders(ServerWebExchange exchange, Consumer<HttpHeaders> transformer) {
        HttpHeaders mutableHeaders = new HttpHeaders();
        mutableHeaders.putAll(exchange.getRequest().getHeaders());
        transformer.accept(mutableHeaders);

        ServerHttpRequest decoratedRequest = new ServerHttpRequestDecorator(exchange.getRequest()) {
            @Override
            public HttpHeaders getHeaders() {
                return HttpHeaders.readOnlyHttpHeaders(mutableHeaders);
            }
        };

        return exchange.mutate().request(decoratedRequest).build();
    }

    private Boolean isAccessTokenBlacklisted(String token) {
        try {
            Boolean keyExists = redisTemplate.hasKey(accessBlacklistKey(token));
            return Boolean.TRUE.equals(keyExists);
        } catch (RuntimeException ex) {
            log.error("gateway_blacklist_check_failure", ex);
            return null;
        }
    }

    private boolean blacklistAccessToken(String token, java.util.Date expiration) {
        if (expiration == null) {
            return false;
        }

        long ttlMillis = expiration.toInstant().toEpochMilli() - Instant.now().toEpochMilli();
        if (ttlMillis <= 0) {
            return false;
        }

        try {
            ValueOperations<String, String> valueOperations = redisTemplate.opsForValue();
            valueOperations.set(accessBlacklistKey(token), "revoked", Duration.ofMillis(ttlMillis));
            return true;
        } catch (RuntimeException ex) {
            log.error("gateway_blacklist_write_failure", ex);
            return false;
        }
    }

    private String accessBlacklistKey(String token) {
        return ACCESS_BLACKLIST_KEY_PREFIX + sha256(token);
    }

    private String sha256(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(value.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder(hash.length * 2);
            for (byte b : hash) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 algorithm unavailable", ex);
        }
    }

    private Mono<Void> unauthorized(ServerWebExchange exchange, String requestId, String message) {
        log.warn(
                "gateway_reject status={} requestId={} method={} path={} reason={}",
                HttpStatus.UNAUTHORIZED.value(),
                requestId,
                exchange.getRequest().getMethod(),
                exchange.getRequest().getPath().value(),
                message
        );

        String path = exchange.getRequest().getPath().value();
        ErrorResponse error = ErrorResponseBuilder.unauthorized(message, path, requestId);

        exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
        exchange.getResponse().getHeaders().setContentType(MediaType.APPLICATION_JSON);

        byte[] payload;
        try {
            payload = objectMapper.writeValueAsBytes(error);
        } catch (JsonProcessingException ignored) {
            payload = "{\"status\":401,\"error\":\"UNAUTHORIZED\",\"message\":\"Authentication required\"}"
                    .getBytes(StandardCharsets.UTF_8);
        }

        DataBuffer buffer = exchange.getResponse().bufferFactory().wrap(payload);
        return exchange.getResponse().writeWith(Mono.just(buffer));
    }

    private Mono<Void> forbidden(
            ServerWebExchange exchange,
            String requestId,
            String userId,
            String role,
            String path,
            String method,
            String message
    ) {
        log.warn(
                "gateway_reject status={} requestId={} userId={} role={} method={} path={} reason={}",
                HttpStatus.FORBIDDEN.value(),
                requestId,
                userId,
                role,
                method,
                path,
                message
        );

        ErrorResponse error = ErrorResponseBuilder.forbidden(message, path, requestId);

        exchange.getResponse().setStatusCode(HttpStatus.FORBIDDEN);
        exchange.getResponse().getHeaders().setContentType(MediaType.APPLICATION_JSON);

        byte[] payload;
        try {
            payload = objectMapper.writeValueAsBytes(error);
        } catch (JsonProcessingException ignored) {
            payload = "{\"status\":403,\"error\":\"FORBIDDEN\",\"message\":\"Access denied\"}"
                    .getBytes(StandardCharsets.UTF_8);
        }

        DataBuffer buffer = exchange.getResponse().bufferFactory().wrap(payload);
        return exchange.getResponse().writeWith(Mono.just(buffer));
    }

    private Mono<Void> serviceUnavailable(ServerWebExchange exchange, String requestId, String message) {
        log.error(
                "gateway_reject status={} requestId={} method={} path={} reason={}",
                HttpStatus.SERVICE_UNAVAILABLE.value(),
                requestId,
                exchange.getRequest().getMethod(),
                exchange.getRequest().getPath().value(),
                message
        );

        String path = exchange.getRequest().getPath().value();
        ErrorResponse error = ErrorResponseBuilder.fromCode(
                HttpStatus.SERVICE_UNAVAILABLE.value(),
                ErrorCode.SERVICE_UNAVAILABLE,
                message,
                path,
                requestId
        );

        exchange.getResponse().setStatusCode(HttpStatus.SERVICE_UNAVAILABLE);
        exchange.getResponse().getHeaders().setContentType(MediaType.APPLICATION_JSON);

        byte[] payload;
        try {
            payload = objectMapper.writeValueAsBytes(error);
        } catch (JsonProcessingException ignored) {
            payload = "{\"status\":503,\"error\":\"SERVICE_UNAVAILABLE\",\"message\":\"Service unavailable\"}"
                    .getBytes(StandardCharsets.UTF_8);
        }

        DataBuffer buffer = exchange.getResponse().bufferFactory().wrap(payload);
        return exchange.getResponse().writeWith(Mono.just(buffer));
    }

    private int statusCode(ServerWebExchange exchange) {
        HttpStatusCode status = exchange.getResponse().getStatusCode();
        return status == null ? HttpStatus.OK.value() : status.value();
    }

    private void logRequest(String userId, String requestId, String method, String path, int statusCode) {
        if (statusCode == HttpStatus.UNAUTHORIZED.value()
                || statusCode == HttpStatus.FORBIDDEN.value()
                || statusCode == HttpStatus.TOO_MANY_REQUESTS.value()) {
            log.warn(
                    "gateway_request userId={} requestId={} method={} path={} status={}",
                    userId,
                    requestId,
                    method,
                    path,
                    statusCode
            );
            return;
        }

        log.info(
                "gateway_request userId={} requestId={} method={} path={} status={}",
                userId,
                requestId,
                method,
                path,
                statusCode
        );
    }
}
