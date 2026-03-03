package com.example.api_gateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.ReactiveAuthenticationManager;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;

import reactor.core.publisher.Mono;

/**
 * WebFlux security configuration for the API gateway.
 *
 * <p>JWT validation is handled by {@link com.example.api_gateway.filter.JwtGatewayFilter}
 * (a {@code GlobalFilter}), which runs before requests reach downstream services.
 * Spring Security here is intentionally minimal — it suppresses the default
 * UserDetailsService auto-configuration and disables form login / HTTP Basic,
 * neither of which are meaningful at the gateway layer.
 */
@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    /**
     * Providing a {@code ReactiveAuthenticationManager} bean causes
     * {@code ReactiveUserDetailsServiceAutoConfiguration} to back off,
     * which prevents the "Using generated security password" noise at startup.
     * Actual authentication is done by {@code JwtGatewayFilter}.
     */
    @Bean
    public ReactiveAuthenticationManager authenticationManager() {
        // WHY: All auth is JWT-based, handled in JwtGatewayFilter.
        // The manager here intentionally returns empty — no credentials to process.
        return authentication -> Mono.empty();
    }

    @Bean
    public SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http) {
        return http
                .csrf(ServerHttpSecurity.CsrfSpec::disable)
                .httpBasic(ServerHttpSecurity.HttpBasicSpec::disable)
                .formLogin(ServerHttpSecurity.FormLoginSpec::disable)
                // WHY: JWT validation + 401 responses are handled by JwtGatewayFilter.
                // Permitting all here so that filter has full control of the response.
                .authorizeExchange(auth -> auth.anyExchange().permitAll())
                .build();
    }
}
