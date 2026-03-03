package com.sprintmanagement.sprintservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

// Exclude default UserDetailsService auto-configuration — authentication is handled
// entirely by HeaderAuthenticationFilter (trusted headers forwarded from the API gateway).
@SpringBootApplication(exclude = {UserDetailsServiceAutoConfiguration.class})
@EnableDiscoveryClient
public class SprintServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(SprintServiceApplication.class, args);
    }

}
