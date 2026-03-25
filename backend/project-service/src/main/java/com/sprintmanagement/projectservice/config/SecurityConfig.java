package com.sprintmanagement.projectservice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;

import com.sprintmanagement.common.security.InternalServiceAuthorizationCustomizer;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public InternalServiceAuthorizationCustomizer projectServiceAuthorizationCustomizer() {
        return auth -> auth
                .requestMatchers(
                        "/swagger-ui/**",
                        "/swagger-ui.html",
                        "/v3/api-docs/**",
                        "/v3/api-docs"
                ).permitAll()
                .anyRequest().authenticated();
    }
}
