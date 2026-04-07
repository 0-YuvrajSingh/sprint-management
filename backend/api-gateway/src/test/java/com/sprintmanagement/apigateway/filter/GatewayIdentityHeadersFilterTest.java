package com.sprintmanagement.apigateway.filter;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Date;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.startsWith;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.mock.web.server.MockServerWebExchange;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.server.ServerWebExchange;

import com.fasterxml.jackson.databind.ObjectMapper;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import reactor.core.publisher.Mono;

class GatewayIdentityHeadersFilterTest {

    private static final String JWT_SECRET = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

    private GatewayIdentityHeadersFilter filter;
    private StringRedisTemplate redisTemplate;
    @SuppressWarnings("unchecked")
    private ValueOperations<String, String> valueOperations;

    @BeforeEach
    void setUp() {
        redisTemplate = mock(StringRedisTemplate.class);
        valueOperations = mock(ValueOperations.class);
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(redisTemplate.hasKey(anyString())).thenReturn(false);

        filter = new GatewayIdentityHeadersFilter(new ObjectMapper(), redisTemplate);
        ReflectionTestUtils.setField(filter, "jwtSecret", JWT_SECRET);
        ReflectionTestUtils.setField(filter, "gatewaySecret", "gateway-secret-value");
    }

    @Test
    void shouldReturn401WhenTokenIsMissing() {
        MockServerHttpRequest request = MockServerHttpRequest.get("/api/v1/projects/42").build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);
        CapturingChain chain = new CapturingChain();

        filter.filter(exchange, chain).block();

        assertEquals(HttpStatus.UNAUTHORIZED, exchange.getResponse().getStatusCode());
        assertNull(chain.forwardedExchange);
    }

    @Test
    void shouldReturn401WhenTokenIsInvalid() {
        MockServerHttpRequest request = MockServerHttpRequest.get("/api/v1/projects/42")
                .header(HttpHeaders.AUTHORIZATION, "Bearer not-a-valid-jwt")
                .build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);
        CapturingChain chain = new CapturingChain();

        filter.filter(exchange, chain).block();

        assertEquals(HttpStatus.UNAUTHORIZED, exchange.getResponse().getStatusCode());
        assertNull(chain.forwardedExchange);
    }

    @Test
    void shouldReturn401WhenTokenIsExpired() {
        String expiredToken = buildAccessToken("101", "ADMIN", -60_000L);

        MockServerHttpRequest request = MockServerHttpRequest.get("/api/v1/projects/42")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + expiredToken)
                .build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);
        CapturingChain chain = new CapturingChain();

        filter.filter(exchange, chain).block();

        assertEquals(HttpStatus.UNAUTHORIZED, exchange.getResponse().getStatusCode());
        assertNull(chain.forwardedExchange);
    }

    @Test
    void shouldForwardRequestWhenTokenIsValid() {
        String validToken = buildAccessToken("101", "ADMIN", 900_000L);

        MockServerHttpRequest request = MockServerHttpRequest.get("/api/v1/projects/42")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + validToken)
                .build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);
        CapturingChain chain = new CapturingChain();

        filter.filter(exchange, chain).block();

        assertEquals(HttpStatus.OK, exchange.getResponse().getStatusCode());
        assertNotNull(chain.forwardedExchange);

        ServerHttpRequest forwardedRequest = chain.forwardedExchange.getRequest();
        assertEquals("101", forwardedRequest.getHeaders().getFirst("X-User-Id"));
        assertEquals("ADMIN", forwardedRequest.getHeaders().getFirst("X-User-Role"));
        assertEquals("gateway-secret-value", forwardedRequest.getHeaders().getFirst("X-Gateway-Secret"));
        assertNull(forwardedRequest.getHeaders().getFirst(HttpHeaders.AUTHORIZATION));
    }

    @Test
    void shouldReturn403WhenRoleDoesNotMatchProtectedRoute() {
        String validToken = buildAccessToken("101", "VIEWER", 900_000L);

        MockServerHttpRequest request = MockServerHttpRequest.get("/api/v1/admin/users")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + validToken)
                .build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);
        CapturingChain chain = new CapturingChain();

        filter.filter(exchange, chain).block();

        assertEquals(HttpStatus.FORBIDDEN, exchange.getResponse().getStatusCode());
        assertNull(chain.forwardedExchange);
    }

    @Test
    void shouldReturn401WhenTokenIsBlacklisted() {
        String validToken = buildAccessToken("101", "ADMIN", 900_000L);
        when(redisTemplate.hasKey(anyString())).thenReturn(true);

        MockServerHttpRequest request = MockServerHttpRequest.get("/api/v1/projects/42")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + validToken)
                .build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);
        CapturingChain chain = new CapturingChain();

        filter.filter(exchange, chain).block();

        assertEquals(HttpStatus.UNAUTHORIZED, exchange.getResponse().getStatusCode());
        assertNull(chain.forwardedExchange);
    }

    @Test
    void shouldBlacklistTokenOnLogout() {
        String validToken = buildAccessToken("101", "ADMIN", 900_000L);

        MockServerHttpRequest request = MockServerHttpRequest.post("/api/v1/auth/logout")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + validToken)
                .build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);
        CapturingChain chain = new CapturingChain();

        filter.filter(exchange, chain).block();

        assertEquals(HttpStatus.OK, exchange.getResponse().getStatusCode());
        assertNotNull(chain.forwardedExchange);
        verify(valueOperations).set(startsWith("gateway:blacklist:access:"), eq("revoked"), any(Duration.class));
    }

    @Test
    void shouldLogAndPassThrough429FromRateLimiterOnLoginRoute() {
        MockServerHttpRequest request = MockServerHttpRequest.post("/api/v1/auth/login").build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);
        CapturingChain chain = new CapturingChain(HttpStatus.TOO_MANY_REQUESTS);

        filter.filter(exchange, chain).block();

        assertEquals(HttpStatus.TOO_MANY_REQUESTS, exchange.getResponse().getStatusCode());
        assertNotNull(chain.forwardedExchange);
    }

    private String buildAccessToken(String userId, String role, long expiryOffsetMillis) {
        long now = System.currentTimeMillis();

        return Jwts.builder()
                .setSubject(userId)
                .claim("role", role)
                .claim("type", "access")
                .setIssuedAt(new Date(now - 1_000L))
                .setExpiration(new Date(now + expiryOffsetMillis))
                .signWith(Keys.hmacShaKeyFor(JWT_SECRET.getBytes(StandardCharsets.UTF_8)), SignatureAlgorithm.HS256)
                .compact();
    }

    private static final class CapturingChain implements GatewayFilterChain {

        private ServerWebExchange forwardedExchange;
        private final HttpStatus responseStatus;

        private CapturingChain() {
            this(HttpStatus.OK);
        }

        private CapturingChain(HttpStatus responseStatus) {
            this.responseStatus = responseStatus;
        }

        @Override
        public Mono<Void> filter(ServerWebExchange exchange) {
            this.forwardedExchange = exchange;
            exchange.getResponse().setStatusCode(responseStatus);
            return exchange.getResponse().setComplete();
        }
    }
}

