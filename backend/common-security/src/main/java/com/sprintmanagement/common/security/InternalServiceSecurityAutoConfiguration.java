package com.sprintmanagement.common.security;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sprintmanagement.common.error.security.CanonicalAccessDeniedHandler;
import com.sprintmanagement.common.error.security.CanonicalAuthenticationEntryPoint;

@AutoConfiguration
@ConditionalOnClass({HttpSecurity.class, SecurityFilterChain.class})
public class InternalServiceSecurityAutoConfiguration {

    @Bean
    @ConditionalOnMissingBean
    public HeaderAuthenticationFilter headerAuthenticationFilter(
            @Value("${gateway.secret}") String gatewaySecret) {
        return new HeaderAuthenticationFilter(gatewaySecret);
    }

    @Bean
    @ConditionalOnMissingBean
    public CanonicalAuthenticationEntryPoint canonicalAuthenticationEntryPoint(ObjectMapper objectMapper) {
        return new CanonicalAuthenticationEntryPoint(objectMapper);
    }

    @Bean
    @ConditionalOnMissingBean
    public CanonicalAccessDeniedHandler canonicalAccessDeniedHandler(ObjectMapper objectMapper) {
        return new CanonicalAccessDeniedHandler(objectMapper);
    }

    @Bean
    @ConditionalOnMissingBean(SecurityFilterChain.class)
    public SecurityFilterChain internalServiceSecurityFilterChain(
            HttpSecurity http,
            HeaderAuthenticationFilter headerAuthenticationFilter,
            CanonicalAuthenticationEntryPoint authenticationEntryPoint,
            CanonicalAccessDeniedHandler accessDeniedHandler,
            ObjectProvider<InternalServiceAuthorizationCustomizer> authorizationCustomizerProvider) throws Exception {

        http
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint(authenticationEntryPoint)
                        .accessDeniedHandler(accessDeniedHandler))
                .addFilterBefore(headerAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .authorizeHttpRequests(auth -> {
                    InternalServiceAuthorizationCustomizer customizer = authorizationCustomizerProvider.getIfAvailable();
                    if (customizer != null) {
                        customizer.customize(auth);
                    } else {
                        auth.anyRequest().authenticated();
                    }
                });

        return http.build();
    }
}
