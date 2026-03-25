package com.sprintmanagement.common.security;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.List;

import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public class HeaderAuthenticationFilter extends OncePerRequestFilter {

    private final String gatewaySecret;

    public HeaderAuthenticationFilter(String gatewaySecret) {
        this.gatewaySecret = gatewaySecret;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String incomingSecret = request.getHeader("X-Gateway-Secret");

        if (!isValidGatewaySecret(incomingSecret)) {
            throw new BadCredentialsException("Request did not originate from gateway");
        }

        String email = request.getHeader("X-User-Email");
        String role  = request.getHeader("X-User-Role");

        if (email == null || role == null) {
            throw new BadCredentialsException("Missing identity headers");
        }

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

    private boolean isValidGatewaySecret(String incoming) {
        if (incoming == null || gatewaySecret == null) return false;
        return MessageDigest.isEqual(
                incoming.getBytes(StandardCharsets.UTF_8),
                gatewaySecret.getBytes(StandardCharsets.UTF_8)
        );
    }
}