package com.sprintmanagement.common.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.List;

public class HeaderAuthenticationFilter extends OncePerRequestFilter {

    private final String gatewaySecret;

    // Injected via constructor — each service passes its own @Value
    public HeaderAuthenticationFilter(String gatewaySecret) {
        this.gatewaySecret = gatewaySecret;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        // ── Step 1: Verify request came from our gateway ──────────────────────
        String incomingSecret = request.getHeader("X-Gateway-Secret");

        if (!isValidGatewaySecret(incomingSecret)) {
            sendError(response, HttpServletResponse.SC_UNAUTHORIZED,
                    "Request did not originate from gateway");
            return;
        }

        // ── Step 2: Extract identity headers (already trusted at this point) ──
        String email = request.getHeader("X-User-Email");
        String role  = request.getHeader("X-User-Role");

        if (email == null || role == null) {
            sendError(response, HttpServletResponse.SC_UNAUTHORIZED,
                    "Missing identity headers");
            return;
        }

        // ── Step 3: Set authentication in SecurityContext ─────────────────────
        if (SecurityContextHolder.getContext().getAuthentication() == null) {
            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            email,
                            null,
                            List.of(new SimpleGrantedAuthority("ROLE_" + role))
                    );
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        filterChain.doFilter(request, response);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    /**
     * Constant-time comparison to prevent timing attacks.
     * Never use .equals() for secret comparison.
     */
    private boolean isValidGatewaySecret(String incoming) {
        if (incoming == null || gatewaySecret == null) return false;
        return MessageDigest.isEqual(
                incoming.getBytes(StandardCharsets.UTF_8),
                gatewaySecret.getBytes(StandardCharsets.UTF_8)
        );
    }

    private void sendError(HttpServletResponse response, int status, String message)
            throws IOException {
        response.setStatus(status);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getWriter().write("{\"error\": \"" + message + "\"}");
    }
}