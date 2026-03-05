package com.sprintmanagement.storiesservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;

@SpringBootApplication(exclude = {UserDetailsServiceAutoConfiguration.class})
public class StoriesServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(StoriesServiceApplication.class, args);
    }

}
