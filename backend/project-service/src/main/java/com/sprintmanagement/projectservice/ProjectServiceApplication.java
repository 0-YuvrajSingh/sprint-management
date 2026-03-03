package com.sprintmanagement.projectservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;

// Exclude default UserDetailsService auto-configuration — authentication is handled
// entirely by HeaderAuthenticationFilter (trusted headers forwarded from the API gateway).
@SpringBootApplication(exclude = {UserDetailsServiceAutoConfiguration.class})
public class ProjectServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(ProjectServiceApplication.class, args);
    }

}
