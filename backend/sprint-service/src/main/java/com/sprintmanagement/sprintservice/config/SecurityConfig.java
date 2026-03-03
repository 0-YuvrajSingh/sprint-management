package com.sprintmanagement.sprintservice.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.sprintmanagement.common.security.HeaderAuthenticationFilter;

/**
 * Security configuration for sprint-service.
 *
 * <p>
 * All inbound requests must pass through the API gateway, which validates the
 * JWT and forwards trusted identity headers (X-User-Email, X-User-Role,
 * X-Gateway-Secret). {@link HeaderAuthenticationFilter} re-authenticates those
 * headers on every request so downstream Spring Security method-level
 * annotations ({@code @PreAuthorize}) work.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    // Injected from application.yaml — must match the gateway's configured secret.
    @Value("${gateway.secret}")
    private String gatewaySecret;

    @Bean
    public HeaderAuthenticationFilter headerAuthenticationFilter() {
        return new HeaderAuthenticationFilter(gatewaySecret);
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> {
                })
                .sessionManagement(s -> s
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .addFilterBefore(headerAuthenticationFilter(),
                        UsernamePasswordAuthenticationFilter.class)
                .authorizeHttpRequests(auth -> auth
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                .anyRequest().authenticated()
                );
        return http.build();
    }
}
