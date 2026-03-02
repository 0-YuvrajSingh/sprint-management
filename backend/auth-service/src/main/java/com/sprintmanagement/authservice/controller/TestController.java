package com.sprintmanagement.authservice.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestController {

    @GetMapping("/api/v1/user")
    public String userEndpoint() {
        return "Any authenticated user";
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/api/v1/admin")
    public String adminEndpoint() {
        return "Admin only";
    }

    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @GetMapping("/api/v1/manager")
    public String managerEndpoint() {
        return "Admin or Manager only";
    }
}