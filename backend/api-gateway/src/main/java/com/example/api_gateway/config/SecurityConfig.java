package com.example.api_gateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.ReactiveAuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.SecurityWebFiltersOrder;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.security.web.server.authentication.AuthenticationWebFilter;
import org.springframework.security.web.server.authentication.ServerAuthenticationConverter;

import reactor.core.publisher.Mono;

/**
 * WebFlux security configuration for the API gateway.
 */
@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    @Bean
    public AuthenticationWebFilter authenticationWebFilter(ReactiveAuthenticationManager authenticationManager) {
        AuthenticationWebFilter filter = new AuthenticationWebFilter(authenticationManager);
        filter.setServerAuthenticationConverter(bearerTokenAuthenticationConverter());
        return filter;
    }

    @Bean
    public ServerAuthenticationConverter bearerTokenAuthenticationConverter() {
        return exchange -> {
            String authHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return Mono.empty();
            }

            String token = authHeader.substring(7).trim();
            if (token.isEmpty()) {
                return Mono.empty();
            }

            return Mono.just(UsernamePasswordAuthenticationToken.unauthenticated("jwt", token));
        };
    }

    @Bean
    public SecurityWebFilterChain springSecurityFilterChain(
            ServerHttpSecurity http,
            AuthenticationWebFilter authenticationWebFilter
    ) {
        return http
                .csrf(ServerHttpSecurity.CsrfSpec::disable)
                .httpBasic(ServerHttpSecurity.HttpBasicSpec::disable)
                .formLogin(ServerHttpSecurity.FormLoginSpec::disable)
                .addFilterAt(authenticationWebFilter, SecurityWebFiltersOrder.AUTHENTICATION)
                .authorizeExchange(auth -> auth
                .pathMatchers("/auth/login", "/auth/register", "/actuator/**").permitAll()
                .anyExchange().authenticated()
                )
                .build();
    }
}
