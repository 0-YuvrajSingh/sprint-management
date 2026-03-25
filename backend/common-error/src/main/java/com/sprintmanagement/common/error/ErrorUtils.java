package com.sprintmanagement.common.error;

import java.util.UUID;

import org.slf4j.MDC;

import jakarta.servlet.http.HttpServletRequest;

public final class ErrorUtils {

    public static final String TRACE_ID_KEY = "traceId";
    public static final String TRACE_ID_HEADER = "X-Trace-Id";

    private ErrorUtils() {
    }

    public static String resolveTraceId(HttpServletRequest request) {
        String traceIdFromHeader = request == null ? null : request.getHeader(TRACE_ID_HEADER);
        return resolveTraceId(traceIdFromHeader);
    }

    public static String resolveTraceId(String preferredTraceId) {
        if (preferredTraceId != null && !preferredTraceId.isBlank()) {
            MDC.put(TRACE_ID_KEY, preferredTraceId);
            return preferredTraceId;
        }

        String fromMdc = MDC.get(TRACE_ID_KEY);
        if (fromMdc != null && !fromMdc.isBlank()) {
            return fromMdc;
        }

        String generated = UUID.randomUUID().toString();
        MDC.put(TRACE_ID_KEY, generated);
        return generated;
    }

    public static String resolvePath(HttpServletRequest request) {
        return request == null ? "unknown" : request.getRequestURI();
    }
}
