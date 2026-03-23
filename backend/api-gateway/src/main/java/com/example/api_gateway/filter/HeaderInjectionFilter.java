package com.example.api_gateway.filter;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;

import reactor.core.publisher.Mono;

@Component
public class HeaderInjectionFilter implements GlobalFilter, Ordered {

    @Value("${gateway.secret}")
    private String gatewaySecret;

    @Override
    public int getOrder() {
        return 0;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerWebExchange sanitized = exchange.mutate()
                .request(request -> request.headers(headers -> {
            headers.remove("X-User-Email");
            headers.remove("X-User-Role");
            headers.remove("X-Gateway-Secret");
            headers.remove(HttpHeaders.AUTHORIZATION);
        }))
                .build();

        return ReactiveSecurityContextHolder.getContext()
                .map(SecurityContext::getAuthentication)
                .filter(this::isAuthenticated)
                .flatMap(authentication -> {
                    String role = extractRole(authentication);
                    if (role == null) {
                        return chain.filter(sanitized);
                    }

                    ServerWebExchange mutated = sanitized.mutate()
                            .request(request -> request.headers(headers -> {
                        headers.set("X-User-Email", authentication.getName());
                        headers.set("X-User-Role", role);
                        headers.set("X-Gateway-Secret", gatewaySecret);
                    }))
                            .build();

                    return chain.filter(mutated);
                })
                .switchIfEmpty(chain.filter(sanitized));
    }

    private boolean isAuthenticated(Authentication authentication) {
        return authentication != null
                && authentication.isAuthenticated()
                && authentication.getName() != null
                && !authentication.getName().isBlank()
                && !"anonymousUser".equals(authentication.getName());
    }

    private String extractRole(Authentication authentication) {
        return authentication.getAuthorities().stream()
                .map(grantedAuthority -> grantedAuthority.getAuthority())
                .filter(authority -> authority.startsWith("ROLE_"))
                .map(authority -> authority.substring(5))
                .findFirst()
                .orElse(null);
    }
}
