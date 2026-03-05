package com.sprintmanagement.storiesservice.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.servers.Server;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI storiesServiceOpenAPI() {
        return new OpenAPI()
                .servers(List.of(
                        new Server().url("http://localhost:8086")
                ))
                .info(new Info()
                        .title("Stories Service API")
                        .version("1.0.0")
                        .description("REST API for managing user stories in the Sprint Management System")
                        .contact(new Contact()
                                .name("Sprint Management Team")));
    }
}
