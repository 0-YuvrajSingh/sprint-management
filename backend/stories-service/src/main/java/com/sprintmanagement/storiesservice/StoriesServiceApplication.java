package com.sprintmanagement.storiesservice;

import java.util.Arrays;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;
import org.springframework.boot.context.event.ApplicationEnvironmentPreparedEvent;

@SpringBootApplication(exclude = {UserDetailsServiceAutoConfiguration.class})
public class StoriesServiceApplication {

    private static final Logger log = LoggerFactory.getLogger(StoriesServiceApplication.class);

    public static void main(String[] args) {
        SpringApplication application = new SpringApplication(StoriesServiceApplication.class);
        application.addListeners((ApplicationEnvironmentPreparedEvent event) -> {
            String[] activeProfiles = event.getEnvironment().getActiveProfiles();
            String datasourceUrl = event.getEnvironment().getProperty("spring.datasource.url");

            log.info("stories-service activeProfiles={}", Arrays.toString(activeProfiles));
            log.info("stories-service effective spring.datasource.url={}", datasourceUrl);
        });
        application.run(args);
    }

}
