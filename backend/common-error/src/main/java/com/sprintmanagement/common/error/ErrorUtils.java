package com.sprintmanagement.common.error;

import java.util.UUID;

public final class ErrorUtils {

    public static final String TRACE_ID_HEADER = "X-Trace-Id";

    private ErrorUtils() {
    }

    public static String resolveTraceId(String headerValue) {
        if (headerValue != null && !headerValue.isBlank()) {
            return headerValue;
        }
        return UUID.randomUUID().toString();
    }
}
