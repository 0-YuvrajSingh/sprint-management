package com.sprintmanagement.common.error;

import java.time.Instant;
import java.util.List;

import jakarta.servlet.http.HttpServletRequest;

public final class ErrorResponseBuilder {

    private ErrorResponseBuilder() {
    }

    public static ErrorResponse badRequest(String message, HttpServletRequest request) {
        return build(400, ErrorCode.BAD_REQUEST, message, request, List.of());
    }

    public static ErrorResponse validation(String message, List<FieldErrorDto> fieldErrors,
            HttpServletRequest request) {
        return build(400, ErrorCode.VALIDATION_ERROR, message, request, fieldErrors);
    }

    public static ErrorResponse unauthorized(String message, HttpServletRequest request) {
        return build(401, ErrorCode.UNAUTHORIZED, message, request, List.of());
    }

    public static ErrorResponse forbidden(String message, HttpServletRequest request) {
        return build(403, ErrorCode.FORBIDDEN, message, request, List.of());
    }

    public static ErrorResponse notFound(String message, HttpServletRequest request) {
        return build(404, ErrorCode.NOT_FOUND, message, request, List.of());
    }

    public static ErrorResponse internalError(String message, HttpServletRequest request) {
        return build(500, ErrorCode.INTERNAL_ERROR, message, request, List.of());
    }

    public static ErrorResponse conflict(String message, HttpServletRequest request) {
        return build(409, ErrorCode.CONFLICT, message, request, List.of());
    }

    public static ErrorResponse badRequest(String message, String path, String traceId, ErrorCode code) {
        return build(400, code, message, path, traceId, List.of());
    }

    public static ErrorResponse unauthorized(String message, String path, String traceId) {
        return build(401, ErrorCode.UNAUTHORIZED, message, path, traceId, List.of());
    }

    public static ErrorResponse forbidden(String message, String path, String traceId) {
        return build(403, ErrorCode.FORBIDDEN, message, path, traceId, List.of());
    }

    public static ErrorResponse notFound(String message, String path, String traceId) {
        return build(404, ErrorCode.NOT_FOUND, message, path, traceId, List.of());
    }

    public static ErrorResponse internalError(String message, String path, String traceId) {
        return build(500, ErrorCode.INTERNAL_ERROR, message, path, traceId, List.of());
    }

    public static ErrorResponse validation(String message, List<FieldErrorDto> fieldErrors,
            String path, String traceId) {
        return build(400, ErrorCode.VALIDATION_ERROR, message, path, traceId, fieldErrors);
    }

    public static ErrorResponse fromCode(int status, ErrorCode code, String message,
            HttpServletRequest request) {
        return build(status, code, message, request, List.of());
    }

    public static ErrorResponse fromCode(int status, ErrorCode code, String message,
                                         String path, String traceId) {
        return build(status, code, message, path, traceId, List.of());
    }

    public static ErrorResponse fromCode(int status, ErrorCode code, String message,
                                         HttpServletRequest request, List<FieldErrorDto> fieldErrors) {
        return build(status, code, message, request, fieldErrors);
    }

    public static ErrorResponse fromCode(int status, ErrorCode code, String message,
                                         String path, String traceId, List<FieldErrorDto> fieldErrors) {
        return build(status, code, message, path, traceId, fieldErrors);
    }

    private static ErrorResponse build(int status, ErrorCode code, String message,
            HttpServletRequest request, List<FieldErrorDto> fieldErrors) {
        return build(status, code, message, ErrorUtils.resolvePath(request), ErrorUtils.resolveTraceId(request), fieldErrors);
    }

    private static ErrorResponse build(int status, ErrorCode code, String message,
            String path, String traceId, List<FieldErrorDto> fieldErrors) {
        List<FieldErrorDto> normalizedFieldErrors = fieldErrors == null ? List.of() : List.copyOf(fieldErrors);
        return new ErrorResponse(
                Instant.now(),
                status,
                code.label(),
                message,
                path,
                code.code(),
                normalizedFieldErrors,
                ErrorUtils.resolveTraceId(traceId)
        );
    }
}
