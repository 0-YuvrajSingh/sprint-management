package com.sprintmanagement.common.security;

import static org.junit.jupiter.api.Assertions.assertThrows;

import java.io.IOException;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.authentication.BadCredentialsException;

import jakarta.servlet.ServletException;

class HeaderAuthenticationFilterTest {

    @Test
    void shouldBlockDirectAccessWithoutGatewaySecret() throws ServletException, IOException {
        HeaderAuthenticationFilter filter = new HeaderAuthenticationFilter("expected-gateway-secret");

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setMethod("GET");
        request.setRequestURI("/api/v1/projects");
        request.addHeader("X-User-Id", "101");
        request.addHeader("X-User-Role", "ADMIN");

        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain filterChain = new MockFilterChain();

        assertThrows(BadCredentialsException.class, () -> filter.doFilter(request, response, filterChain));
    }
}
