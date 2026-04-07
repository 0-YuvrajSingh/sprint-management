package com.sprintmanagement.storiesservice.exception;

import java.util.concurrent.TimeoutException;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import com.sprintmanagement.common.error.ErrorCode;
import com.sprintmanagement.common.error.ErrorResponse;
import com.sprintmanagement.common.error.ServletErrorResponseBuilder;
import com.sprintmanagement.common.error.FieldErrorDto;

import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(
            ResourceNotFoundException ex,
            HttpServletRequest request) {
        return build(HttpStatus.NOT_FOUND, ErrorCode.STORY_NOT_FOUND, ex.getMessage(), request);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgument(
            IllegalArgumentException ex,
            HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ServletErrorResponseBuilder.badRequest(ex.getMessage(), request));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(
            MethodArgumentNotValidException ex,
            HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ServletErrorResponseBuilder.validation(
                        "Validation failed",
                        ex.getBindingResult().getFieldErrors().stream()
                                .map(this::toFieldError)
                                .toList(),
                        request));
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErrorResponse> handleConstraintViolation(
            ConstraintViolationException ex,
            HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ServletErrorResponseBuilder.validation(
                        "Constraint violation",
                        ex.getConstraintViolations().stream()
                                .map(violation -> new FieldErrorDto(
                                violation.getPropertyPath().toString(),
                                violation.getMessage()))
                                .toList(),
                        request));
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErrorResponse> handleAuthentication(
            AuthenticationException ex,
            HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ServletErrorResponseBuilder.unauthorized("Authentication required", request));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(
            AccessDeniedException ex,
            HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ServletErrorResponseBuilder.forbidden("Access denied", request));
    }

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleEntityNotFound(
            EntityNotFoundException ex,
            HttpServletRequest request) {
        return build(HttpStatus.NOT_FOUND, ErrorCode.STORY_NOT_FOUND, ex.getMessage(), request);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> handleDataIntegrity(
            DataIntegrityViolationException ex,
            HttpServletRequest request) {
        return build(HttpStatus.CONFLICT, ErrorCode.DB_CONSTRAINT_VIOLATION, "Data integrity violation", request);
    }

    @ExceptionHandler(DuplicateKeyException.class)
    public ResponseEntity<ErrorResponse> handleDuplicateKey(
            DuplicateKeyException ex,
            HttpServletRequest request) {
        return build(HttpStatus.CONFLICT, ErrorCode.IDEMPOTENT_DUPLICATE, "Duplicate request", request);
    }

    @ExceptionHandler(TimeoutException.class)
    public ResponseEntity<ErrorResponse> handleTimeout(
            TimeoutException ex,
            HttpServletRequest request) {
        return build(HttpStatus.GATEWAY_TIMEOUT, ErrorCode.SERVICE_TIMEOUT, "Upstream service timed out", request);
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ErrorResponse> handleResponseStatus(
            ResponseStatusException ex,
            HttpServletRequest request) {
        HttpStatus status = HttpStatus.valueOf(ex.getStatusCode().value());
        String message = ex.getReason() == null ? status.getReasonPhrase() : ex.getReason();
                return build(status, mapResponseStatusCode(status), message, request);
    }

        @ExceptionHandler({NullPointerException.class, IllegalStateException.class})
    public ResponseEntity<ErrorResponse> handleGeneric(
                        RuntimeException ex,
            HttpServletRequest request) {
                return build(HttpStatus.INTERNAL_SERVER_ERROR, ErrorCode.STORY_UNEXPECTED, "Internal server error", request);
    }

        private ErrorCode mapResponseStatusCode(HttpStatus status) {
                return switch (status) {
                        case BAD_REQUEST -> ErrorCode.BAD_REQUEST;
                        case UNAUTHORIZED -> ErrorCode.UNAUTHORIZED;
                        case FORBIDDEN -> ErrorCode.FORBIDDEN;
                        case NOT_FOUND -> ErrorCode.STORY_NOT_FOUND;
                        case CONFLICT -> ErrorCode.CONFLICT;
                        case SERVICE_UNAVAILABLE -> ErrorCode.SERVICE_UNAVAILABLE;
                        case GATEWAY_TIMEOUT -> ErrorCode.SERVICE_TIMEOUT;
                        default -> ErrorCode.STORY_UNEXPECTED;
                };
        }

    private FieldErrorDto toFieldError(FieldError fieldError) {
        String message = fieldError.getDefaultMessage() == null
                ? "invalid"
                : fieldError.getDefaultMessage();
        return new FieldErrorDto(fieldError.getField(), message);
    }

    private ResponseEntity<ErrorResponse> build(
            HttpStatus status, ErrorCode code, String message, HttpServletRequest request) {
        return ResponseEntity.status(status)
                .body(ServletErrorResponseBuilder.fromCode(status.value(), code, message, request));
    }
}
