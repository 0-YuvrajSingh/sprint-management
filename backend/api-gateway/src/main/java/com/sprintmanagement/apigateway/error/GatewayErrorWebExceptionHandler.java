package com.sprintmanagement.apigateway.error;

import java.util.List;
import org.springframework.lang.NonNull;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.web.reactive.error.ErrorWebExceptionHandler;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.server.ServerWebExchange;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sprintmanagement.common.error.ErrorCode;
import com.sprintmanagement.common.error.ErrorResponse;
import com.sprintmanagement.common.error.ErrorResponseBuilder;
import com.sprintmanagement.common.error.ErrorUtils;
import com.sprintmanagement.common.error.FieldErrorDto;

import reactor.core.publisher.Mono;

@Component
@Order(-2)
public class GatewayErrorWebExceptionHandler implements ErrorWebExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GatewayErrorWebExceptionHandler.class);

    private final ObjectMapper objectMapper;

    public GatewayErrorWebExceptionHandler(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    @NonNull
    public Mono<Void> handle(@NonNull ServerWebExchange exchange, @NonNull Throwable ex) {
        if (exchange.getResponse().isCommitted()) {
            return Mono.error(ex);
        }

        log.error("Gateway request failed: method={}, path={}",
                exchange.getRequest().getMethod(),
                exchange.getRequest().getPath().value(),
                ex);

        HttpStatus status = resolveStatus(ex);
        String path = exchange.getRequest().getPath().value();
        String traceId = ErrorUtils.resolveTraceId(exchange.getRequest().getHeaders().getFirst(ErrorUtils.TRACE_ID_HEADER));
        ErrorResponse body = resolveBody(ex, status, path, traceId);

        exchange.getResponse().setStatusCode(status);
        exchange.getResponse().getHeaders().setContentType(MediaType.APPLICATION_JSON);

        return write(exchange, body);
    }

    private Mono<Void> write(ServerWebExchange exchange, ErrorResponse body) {
        try {
            byte[] payload = objectMapper.writeValueAsBytes(body);
            return exchange.getResponse().writeWith(Mono.just(exchange.getResponse().bufferFactory().wrap(payload)));
        } catch (JsonProcessingException e) {
            return Mono.error(e);
        }
    }

    private HttpStatus resolveStatus(Throwable ex) {
        if (ex instanceof WebClientResponseException webClientResponseException) {
            try {
                return HttpStatus.valueOf(webClientResponseException.getStatusCode().value());
            } catch (IllegalArgumentException e) {
                // Non-standard downstream status code; fallback to 502 Bad Gateway
                return HttpStatus.BAD_GATEWAY;
            }
        }
        if (ex instanceof ResponseStatusException responseStatusException) {
            try {
                return HttpStatus.valueOf(responseStatusException.getStatusCode().value());
            } catch (IllegalArgumentException e) {
                // Non-standard status code; fallback to 500 Internal Server Error
                return HttpStatus.INTERNAL_SERVER_ERROR;
            }
        }
        if (ex instanceof AuthenticationException) {
            return HttpStatus.UNAUTHORIZED;
        }
        if (ex instanceof AccessDeniedException) {
            return HttpStatus.FORBIDDEN;
        }
        return HttpStatus.INTERNAL_SERVER_ERROR;
    }

    private ErrorResponse resolveBody(Throwable ex, HttpStatus status, String path, String traceId) {
        DownstreamError downstreamError = extractDownstreamError(ex);
        ErrorCode code = downstreamError == null ? mapGatewayStatusCode(status) : downstreamError.code();
        String message = downstreamError == null ? resolveMessage(ex, status) : downstreamError.message();
        String resolvedPath = downstreamError == null || downstreamError.path().isBlank() ? path : downstreamError.path();
        List<FieldErrorDto> fieldErrors = downstreamError == null ? List.of() : downstreamError.fieldErrors();

        return ErrorResponseBuilder.fromCode(
                status.value(),
                code,
                message,
                resolvedPath,
                traceId,
                fieldErrors
        );
    }

    private DownstreamError extractDownstreamError(Throwable ex) {
        if (ex instanceof WebClientResponseException webClientResponseException) {
            return extractDownstreamPayload(
                    webClientResponseException.getResponseBodyAsString(),
                    webClientResponseException.getMessage());
        }
        if (!(ex instanceof ResponseStatusException responseStatusException)) {
            return null;
        }

        return extractDownstreamPayload(responseStatusException.getReason(), responseStatusException.getMessage());
    }

    private DownstreamError extractDownstreamPayload(String payload, String fallbackMessage) {
        if (payload == null || payload.isBlank() || !payload.trim().startsWith("{")) {
            return null;
        }

        try {
            JsonNode json = objectMapper.readTree(payload);
            ErrorCode code = resolveDownstreamCode(json);
            String message = json.path("message").asText(fallbackMessage);
            String path = json.path("path").asText("");
            List<FieldErrorDto> fieldErrors = json.has("fieldErrors")
                    ? objectMapper.convertValue(
                            json.path("fieldErrors"),
                            objectMapper.getTypeFactory().constructCollectionType(List.class, FieldErrorDto.class))
                    : List.of();
            return new DownstreamError(code, message, path, fieldErrors);
        } catch (JsonProcessingException ignored) {
            return null;
        }
    }

    private ErrorCode resolveDownstreamCode(JsonNode json) {
        String label = json.path("error").asText(null);
        if (label != null) {
            return ErrorCode.fromLabel(label).orElseGet(() -> resolveCodeValue(json));
        }
        return resolveCodeValue(json);
    }

    private ErrorCode resolveCodeValue(JsonNode json) {
        HttpStatus status = HttpStatus.valueOf(json.path("status").asInt(HttpStatus.INTERNAL_SERVER_ERROR.value()));
        return ErrorCode.fromCodeValue(json.path("code").asText(""))
                .orElse(mapGatewayStatusCode(status));
    }

    private ErrorCode mapGatewayStatusCode(HttpStatus status) {
        return switch (status) {
            case BAD_REQUEST ->
                ErrorCode.BAD_REQUEST;
            case UNAUTHORIZED ->
                ErrorCode.UNAUTHORIZED;
            case FORBIDDEN ->
                ErrorCode.FORBIDDEN;
            case NOT_FOUND ->
                ErrorCode.NOT_FOUND;
            case CONFLICT ->
                ErrorCode.CONFLICT;
            case SERVICE_UNAVAILABLE ->
                ErrorCode.SERVICE_UNAVAILABLE;
            case GATEWAY_TIMEOUT ->
                ErrorCode.SERVICE_TIMEOUT;
            default ->
                ErrorCode.GATEWAY_UNEXPECTED;
        };
    }

    private String resolveMessage(Throwable ex, HttpStatus status) {
        if (ex instanceof ResponseStatusException responseStatusException) {
            String reason = responseStatusException.getReason();
            if (reason != null && !reason.isBlank()) {
                return reason;
            }
        }
        if (status == HttpStatus.INTERNAL_SERVER_ERROR) {
            return "Internal server error";
        }
        String exceptionMessage = ex.getMessage();
        if (exceptionMessage != null && !exceptionMessage.isBlank()) {
            return exceptionMessage;
        }

        if (status == null) {
            return "Unexpected error";
        }
        return status.getReasonPhrase();
    }

    private record DownstreamError(
            ErrorCode code,
            String message,
            String path,
            List<FieldErrorDto> fieldErrors
            ) {

    }
}

