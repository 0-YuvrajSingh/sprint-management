package com.sprintmanagement.sprintservice.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI sprintServiceOpenAPI() {
        return new OpenAPI()
                .servers(List.of(
                        new Server().url("http://localhost:8082")
                ))
                .info(new Info()
                        .title("Sprint Service API")
                        .version("1.0.0")
                        .description("REST API for managing sprints in the Sprint Management System")
                        .contact(new Contact()
                                .name("Sprint Management Team")));
    }
}