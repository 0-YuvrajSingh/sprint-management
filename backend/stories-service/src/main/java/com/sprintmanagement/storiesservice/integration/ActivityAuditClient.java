package com.sprintmanagement.storiesservice.integration;

import java.util.Collection;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

@Component
public class ActivityAuditClient {

    private static final Logger log = LoggerFactory.getLogger(ActivityAuditClient.class);

    private final RestTemplate restTemplate;
    private final String gatewaySecret;
    private final String activityServiceUrl;

    public ActivityAuditClient(
            RestTemplate restTemplate,
            @Value("${gateway.secret}") String gatewaySecret,
            @Value("${audit.activity-service-url:http://activity-service}") String activityServiceUrl) {
        this.restTemplate = restTemplate;
        this.gatewaySecret = gatewaySecret;
        this.activityServiceUrl = activityServiceUrl;
    }

    public void log(String actionType, String targetType, String targetId, String description) {
        Actor actor = resolveActor();

        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Gateway-Secret", gatewaySecret);
        headers.set("X-User-Email", actor.email());
        headers.set("X-User-Role", actor.role());
        headers.set("Content-Type", "application/json");

        ActivityLogRequest body = new ActivityLogRequest(actionType, targetType, targetId, description);

        try {
            restTemplate.exchange(
                    activityServiceUrl + "/api/v1/activities",
                    HttpMethod.POST,
                    new HttpEntity<>(body, headers),
                    Void.class);
        } catch (RestClientException ex) {
            log.warn("Failed to publish audit event action={} target={} id={}", actionType, targetType, targetId, ex);
        }
    }

    private Actor resolveActor() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            return new Actor("system@stories-service", "ADMIN");
        }

        String email = authentication.getName() == null || authentication.getName().isBlank()
                ? "system@stories-service"
                : authentication.getName();

        return new Actor(email, resolveRole(authentication.getAuthorities()));
    }

    private String resolveRole(Collection<? extends GrantedAuthority> authorities) {
        if (authorities != null) {
            for (GrantedAuthority authority : authorities) {
                String value = authority.getAuthority();
                if (value != null && value.startsWith("ROLE_")) {
                    return value.substring("ROLE_".length());
                }
            }
        }
        return "ADMIN";
    }

    private record Actor(String email, String role) {

    }

    private record ActivityLogRequest(
            String actionType,
            String targetType,
            String targetId,
            String description) {

    }
}
