package com.sprintmanagement.sprintservice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;

import com.sprintmanagement.common.security.InternalServiceAuthorizationCustomizer;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public InternalServiceAuthorizationCustomizer sprintServiceAuthorizationCustomizer() {
        return auth -> auth.anyRequest().authenticated();
    }
}
