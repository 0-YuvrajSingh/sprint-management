package com.sprintmanagement.common.error;

import java.util.Arrays;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

public enum ErrorCode {
    VALIDATION_ERROR("APP_400_01", "VALIDATION_ERROR"),
    BAD_REQUEST("APP_400_02", "BAD_REQUEST"),
    UNAUTHORIZED("APP_401_01", "UNAUTHORIZED"),
    AUTH_INVALID_TOKEN("APP_401_02", "AUTH_INVALID_TOKEN"),
    AUTH_TOKEN_EXPIRED("APP_401_03", "AUTH_TOKEN_EXPIRED"),
    FORBIDDEN("APP_403_01", "FORBIDDEN"),
    NOT_FOUND("APP_404_01", "NOT_FOUND"),
    USER_NOT_FOUND("APP_404_02", "USER_NOT_FOUND"),
    PROFILE_NOT_FOUND("APP_404_03", "PROFILE_NOT_FOUND"),
    PROJECT_NOT_FOUND("APP_404_04", "PROJECT_NOT_FOUND"),
    SPRINT_NOT_FOUND("APP_404_05", "SPRINT_NOT_FOUND"),
    STORY_NOT_FOUND("APP_404_06", "STORY_NOT_FOUND"),
    ACTIVITY_NOT_FOUND("APP_404_07", "ACTIVITY_NOT_FOUND"),
    CONFLICT("APP_409_01", "CONFLICT"),
    USER_ALREADY_EXISTS("APP_409_02", "USER_ALREADY_EXISTS"),
    PROFILE_ALREADY_EXISTS("APP_409_03", "PROFILE_ALREADY_EXISTS"),
    DB_CONSTRAINT_VIOLATION("APP_409_04", "DB_CONSTRAINT_VIOLATION"),
    IDEMPOTENT_DUPLICATE("APP_409_05", "IDEMPOTENT_DUPLICATE"),
    INTERNAL_ERROR("APP_500_01", "INTERNAL_ERROR"),
    AUTH_UNEXPECTED("APP_500_11", "AUTH_UNEXPECTED"),
    USER_UNEXPECTED("APP_500_12", "USER_UNEXPECTED"),
    PROJECT_UNEXPECTED("APP_500_13", "PROJECT_UNEXPECTED"),
    SPRINT_UNEXPECTED("APP_500_14", "SPRINT_UNEXPECTED"),
    STORY_UNEXPECTED("APP_500_15", "STORY_UNEXPECTED"),
    ACTIVITY_UNEXPECTED("APP_500_16", "ACTIVITY_UNEXPECTED"),
    GATEWAY_UNEXPECTED("APP_500_17", "GATEWAY_UNEXPECTED"),
    PROFILE_SYNC_FAILED("APP_503_03", "PROFILE_SYNC_FAILED"),
    OUTBOX_SAVE_FAILED("APP_500_03", "OUTBOX_SAVE_FAILED"),
    OUTBOX_PUBLISH_FAILED("APP_500_04", "OUTBOX_PUBLISH_FAILED"),
    EVENT_PROCESSING_FAILED("APP_500_05", "EVENT_PROCESSING_FAILED"),
    SERVICE_UNAVAILABLE("APP_503_01", "SERVICE_UNAVAILABLE"),
    DB_TIMEOUT("APP_503_02", "DB_TIMEOUT"),
    SERVICE_TIMEOUT("APP_504_01", "SERVICE_TIMEOUT");

    private static final Map<String, ErrorCode> BY_CODE = Arrays.stream(values())
            .collect(Collectors.toUnmodifiableMap(ErrorCode::code, Function.identity()));
    private static final Map<String, ErrorCode> BY_LABEL = Arrays.stream(values())
            .collect(Collectors.toUnmodifiableMap(ErrorCode::label, Function.identity()));

    private final String code;
    private final String label;

    ErrorCode(String code, String label) {
        this.code = code;
        this.label = label;
    }

    public String code() {
        return code;
    }

    public String label() {
        return label;
    }

    public static Optional<ErrorCode> fromCodeValue(String code) {
        return Optional.ofNullable(BY_CODE.get(code));
    }

    public static Optional<ErrorCode> fromLabel(String label) {
        return Optional.ofNullable(BY_LABEL.get(label));
    }

    public static ErrorCode defaultForStatus(int status) {
        return switch (status) {
            case 400 ->
                BAD_REQUEST;
            case 401 ->
                UNAUTHORIZED;
            case 403 ->
                FORBIDDEN;
            case 404 ->
                NOT_FOUND;
            case 409 ->
                CONFLICT;
            case 408, 504 ->
                SERVICE_TIMEOUT;
            case 502, 503 ->
                SERVICE_UNAVAILABLE;
            default ->
                INTERNAL_ERROR;
        };
    }
}
