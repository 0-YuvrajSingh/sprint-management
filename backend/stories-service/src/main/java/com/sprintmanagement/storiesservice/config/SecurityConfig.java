package com.sprintmanagement.storiesservice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;

import com.sprintmanagement.common.security.InternalServiceAuthorizationCustomizer;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public InternalServiceAuthorizationCustomizer storiesServiceAuthorizationCustomizer() {
        return auth -> auth.anyRequest().authenticated();
    }
}
