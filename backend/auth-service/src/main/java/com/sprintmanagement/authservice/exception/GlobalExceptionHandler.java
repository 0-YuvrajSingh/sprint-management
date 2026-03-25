package com.sprintmanagement.authservice.exception;

import java.util.List;
import java.util.concurrent.TimeoutException;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.client.RestClientException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.server.ResponseStatusException;

import com.sprintmanagement.common.error.ErrorCode;
import com.sprintmanagement.common.error.ErrorResponse;
import com.sprintmanagement.common.error.ErrorResponseBuilder;
import com.sprintmanagement.common.error.FieldErrorDto;

import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(EmailAlreadyExistsException.class)
    public ResponseEntity<ErrorResponse> handleEmailConflict(
            EmailAlreadyExistsException ex, HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ErrorResponseBuilder.fromCode(
                        HttpStatus.CONFLICT.value(),
                        ErrorCode.USER_ALREADY_EXISTS,
                        ex.getMessage(),
                        request));
    }

    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleInvalidCredentials(
            InvalidCredentialsException ex, HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ErrorResponseBuilder.unauthorized(ex.getMessage(), request));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(
            MethodArgumentNotValidException ex, HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ErrorResponseBuilder.validation(
                        "Validation failed",
                        ex.getBindingResult().getFieldErrors().stream()
                                .map(this::toFieldError)
                                .toList(),
                        request));
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErrorResponse> handleConstraintViolation(
            ConstraintViolationException ex, HttpServletRequest request) {
        List<FieldErrorDto> fieldErrors = ex.getConstraintViolations().stream()
                .map(violation -> new FieldErrorDto(
                violation.getPropertyPath().toString(),
                violation.getMessage()))
                .toList();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ErrorResponseBuilder.validation("Constraint violation", fieldErrors, request));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgument(
            IllegalArgumentException ex, HttpServletRequest request) {
        return build(HttpStatus.BAD_REQUEST, ErrorCode.BAD_REQUEST, ex.getMessage(), request);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErrorResponse> handleTypeMismatch(
            MethodArgumentTypeMismatchException ex, HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ErrorResponseBuilder.badRequest(
                        "Invalid value for parameter '%s'".formatted(ex.getName()), request));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleMalformedJson(
            HttpMessageNotReadableException ex, HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ErrorResponseBuilder.badRequest("Malformed JSON request", request));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> handleDataIntegrity(
            DataIntegrityViolationException ex, HttpServletRequest request) {
        return build(HttpStatus.CONFLICT, ErrorCode.DB_CONSTRAINT_VIOLATION, "Data integrity violation", request);
    }

    @ExceptionHandler(DuplicateKeyException.class)
    public ResponseEntity<ErrorResponse> handleDuplicateKey(
            DuplicateKeyException ex, HttpServletRequest request) {
        return build(HttpStatus.CONFLICT, ErrorCode.IDEMPOTENT_DUPLICATE, "Duplicate request", request);
    }

    @ExceptionHandler(TimeoutException.class)
    public ResponseEntity<ErrorResponse> handleTimeout(
            TimeoutException ex, HttpServletRequest request) {
        return build(HttpStatus.GATEWAY_TIMEOUT, ErrorCode.SERVICE_TIMEOUT, "Upstream service timed out", request);
    }

    @ExceptionHandler(RestClientException.class)
    public ResponseEntity<ErrorResponse> handleRestClient(
            RestClientException ex, HttpServletRequest request) {
        return build(HttpStatus.SERVICE_UNAVAILABLE, ErrorCode.SERVICE_UNAVAILABLE, "Downstream service unavailable", request);
    }

    @ExceptionHandler(ProfileSyncException.class)
    public ResponseEntity<ErrorResponse> handleProfileSync(
            ProfileSyncException ex, HttpServletRequest request) {
        return build(HttpStatus.SERVICE_UNAVAILABLE, ErrorCode.PROFILE_SYNC_FAILED, ex.getMessage(), request);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(
            AccessDeniedException ex, HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ErrorResponseBuilder.forbidden("Access denied", request));
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErrorResponse> handleAuthentication(
            AuthenticationException ex, HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ErrorResponseBuilder.unauthorized("Authentication required", request));
    }

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleEntityNotFound(
            EntityNotFoundException ex, HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ErrorResponseBuilder.notFound(ex.getMessage(), request));
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ErrorResponse> handleResponseStatus(
            ResponseStatusException ex, HttpServletRequest request) {
        HttpStatus status = HttpStatus.valueOf(ex.getStatusCode().value());
        String message = ex.getReason() == null ? status.getReasonPhrase() : ex.getReason();
        return build(status, mapResponseStatusCode(status), message, request);
    }

    @ExceptionHandler({NullPointerException.class, IllegalStateException.class})
    public ResponseEntity<ErrorResponse> handleUnhandled(
            RuntimeException ex, HttpServletRequest request) {
        return build(HttpStatus.INTERNAL_SERVER_ERROR, ErrorCode.AUTH_UNEXPECTED, "Internal server error", request);
    }

    private ErrorCode mapResponseStatusCode(HttpStatus status) {
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
                ErrorCode.AUTH_UNEXPECTED;
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
                .body(ErrorResponseBuilder.fromCode(status.value(), code, message, request));
    }
}
