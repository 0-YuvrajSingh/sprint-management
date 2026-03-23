package com.example.api_gateway.config;

import java.net.InetSocketAddress;

import org.springframework.cloud.gateway.filter.ratelimit.KeyResolver;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.web.server.ServerWebExchange;

import reactor.core.publisher.Mono;

@Configuration
public class RateLimitConfig {

    @Bean
    public KeyResolver userKeyResolver() {
        // Use authenticated principal first for stable per-user rate limiting; fallback to IP for anonymous traffic.
        return exchange -> ReactiveSecurityContextHolder.getContext()
                .map(SecurityContext::getAuthentication)
                .filter(authentication -> authentication != null
                && authentication.isAuthenticated()
                && authentication.getName() != null
                && !authentication.getName().isBlank()
                && !"anonymousUser".equals(authentication.getName()))
                .map(authentication -> authentication.getName())
                .switchIfEmpty(Mono.fromSupplier(() -> resolveClientKey(exchange)));
    }

    private String resolveClientKey(ServerWebExchange exchange) {
        InetSocketAddress remoteAddress = exchange.getRequest().getRemoteAddress();
        if (remoteAddress == null || remoteAddress.getAddress() == null) {
            return "anonymous";
        }
        return remoteAddress.getAddress().getHostAddress();
    }
}
