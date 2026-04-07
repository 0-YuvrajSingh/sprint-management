package com.sprintmanagement.apigateway.config;

import java.time.Duration;
import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity.HeaderSpec;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.security.web.server.header.XFrameOptionsServerHttpHeadersWriter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsConfigurationSource;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

import com.sprintmanagement.apigateway.security.CanonicalServerAccessDeniedHandler;
import com.sprintmanagement.apigateway.security.CanonicalServerAuthenticationEntryPoint;
import com.fasterxml.jackson.databind.ObjectMapper;

@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    @Bean
    public CanonicalServerAuthenticationEntryPoint canonicalServerAuthenticationEntryPoint(ObjectMapper objectMapper) {
        return new CanonicalServerAuthenticationEntryPoint(objectMapper);
    }

    @Bean
    public CanonicalServerAccessDeniedHandler canonicalServerAccessDeniedHandler(ObjectMapper objectMapper) {
        return new CanonicalServerAccessDeniedHandler(objectMapper);
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of(
                "http://localhost:5173",
                "http://127.0.0.1:5173",
                "http://localhost:5174",
                "http://127.0.0.1:5174"
        ));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setExposedHeaders(List.of(HttpHeaders.AUTHORIZATION));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityWebFilterChain springSecurityFilterChain(
            ServerHttpSecurity http,
            CanonicalServerAuthenticationEntryPoint authenticationEntryPoint,
            CanonicalServerAccessDeniedHandler accessDeniedHandler,
            CorsConfigurationSource corsConfigurationSource
    ) {
        return http
                .csrf(ServerHttpSecurity.CsrfSpec::disable)
                .cors(corsSpec -> corsSpec.configurationSource(corsConfigurationSource))
                .httpBasic(ServerHttpSecurity.HttpBasicSpec::disable)
                .formLogin(ServerHttpSecurity.FormLoginSpec::disable)
                .headers(headersCustomizer())
                .exceptionHandling(exceptionHandlingSpec -> exceptionHandlingSpec
                .authenticationEntryPoint(authenticationEntryPoint)
                .accessDeniedHandler(accessDeniedHandler))
                .authorizeExchange(auth -> auth
                .pathMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .pathMatchers("/auth/login", "/auth/register", "/actuator/**").permitAll()
                .anyExchange().permitAll()
                )
                .build();
    }

    private Customizer<HeaderSpec> headersCustomizer() {
        return headers -> headers
                .hsts(hsts -> hsts
                .includeSubdomains(true)
                .maxAge(Duration.ofDays(365)))
                .contentTypeOptions(contentTypeOptionsSpec -> {
                })
                .frameOptions(frameOptionsSpec
                        -> frameOptionsSpec.mode(XFrameOptionsServerHttpHeadersWriter.Mode.DENY));
    }
}

