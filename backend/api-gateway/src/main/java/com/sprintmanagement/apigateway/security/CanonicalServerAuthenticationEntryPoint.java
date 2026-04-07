package com.sprintmanagement.apigateway.security;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.server.ServerAuthenticationEntryPoint;
import org.springframework.web.server.ServerWebExchange;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sprintmanagement.common.error.ErrorResponse;
import com.sprintmanagement.common.error.ErrorResponseBuilder;
import com.sprintmanagement.common.error.ErrorUtils;

import reactor.core.publisher.Mono;

public class CanonicalServerAuthenticationEntryPoint implements ServerAuthenticationEntryPoint {

    private final ObjectMapper objectMapper;

    public CanonicalServerAuthenticationEntryPoint(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public Mono<Void> commence(ServerWebExchange exchange, AuthenticationException ex) {
        String path = exchange.getRequest().getPath().value();
        String traceId = ErrorUtils.resolveTraceId(exchange.getRequest().getHeaders().getFirst(ErrorUtils.TRACE_ID_HEADER));
        ErrorResponse errorResponse = ErrorResponseBuilder.unauthorized("Authentication required", path, traceId);

        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(HttpStatus.UNAUTHORIZED);
        response.getHeaders().setContentType(MediaType.APPLICATION_JSON);

        return write(response, errorResponse);
    }

    private Mono<Void> write(ServerHttpResponse response, ErrorResponse body) {
        try {
            byte[] payload = objectMapper.writeValueAsBytes(body);
            return response.writeWith(Mono.just(response.bufferFactory().wrap(payload)));
        } catch (JsonProcessingException e) {
            return Mono.error(e);
        }
    }
}
