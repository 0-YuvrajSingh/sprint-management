package com.sprintmanagement.common.error;

import jakarta.servlet.http.HttpServletRequest;

public final class ServletErrorUtils {

    private ServletErrorUtils() {
    }

    public static String resolveTraceId(HttpServletRequest request) {
        return ErrorUtils.resolveTraceId(request.getHeader(ErrorUtils.TRACE_ID_HEADER));
    }
}
