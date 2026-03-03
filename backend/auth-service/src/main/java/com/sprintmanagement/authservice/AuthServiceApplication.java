package com.sprintmanagement.authservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

// NOTE: UserDetailsServiceAutoConfiguration is intentionally NOT excluded here.
// auth-service owns the login/register flow and relies on Spring Security's
// AuthenticationManager infrastructure which expects a UserDetailsService to be resolvable.
@SpringBootApplication
public class AuthServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(AuthServiceApplication.class, args);
    }

}
