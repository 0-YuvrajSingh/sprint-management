package com.sprintmanagement.userservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;

// Exclude default UserDetailsService auto-configuration — authentication is handled
// entirely by HeaderAuthenticationFilter (trusted headers forwarded from the API gateway).
@SpringBootApplication(exclude = {UserDetailsServiceAutoConfiguration.class})
public class UserServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(UserServiceApplication.class, args);
    }
}
