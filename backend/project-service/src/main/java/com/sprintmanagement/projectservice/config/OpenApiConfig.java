package com.sprintmanagement.projectservice.config;

import java.util.List;

import org.springdoc.core.customizers.OpenApiCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.media.ArraySchema;
import io.swagger.v3.oas.models.media.Content;
import io.swagger.v3.oas.models.media.IntegerSchema;
import io.swagger.v3.oas.models.media.MediaType;
import io.swagger.v3.oas.models.media.ObjectSchema;
import io.swagger.v3.oas.models.media.Schema;
import io.swagger.v3.oas.models.media.StringSchema;
import io.swagger.v3.oas.models.responses.ApiResponse;
import io.swagger.v3.oas.models.responses.ApiResponses;

@Configuration
public class OpenApiConfig {

    private static final String FIELD_ERROR_SCHEMA_REF = "#/components/schemas/FieldErrorDto";
    private static final String ERROR_RESPONSE_SCHEMA_REF = "#/components/schemas/ErrorResponse";
    private static final String BAD_REQUEST_ERROR = "BadRequestError";
    private static final String UNAUTHORIZED_ERROR = "UnauthorizedError";
    private static final String FORBIDDEN_ERROR = "ForbiddenError";
    private static final String NOT_FOUND_ERROR = "NotFoundError";
    private static final String INTERNAL_SERVER_ERROR = "InternalServerError";

    @Bean
    public OpenAPI projectServiceOpenAPI() {
        return new OpenAPI()
                .components(openApiComponents())
                .info(new Info()
                        .title("Project Service API")
                        .description("RESTful API for managing projects in Sprint Management System")
                        .version("1.0.0"));
    }

    @Bean
    public OpenApiCustomizer globalErrorResponsesCustomizer() {
        return openApi -> {
            if (openApi.getPaths() == null) {
                return;
            }

            openApi.getPaths().values().forEach(pathItem ->
                    pathItem.readOperations().forEach(operation -> {
                        ApiResponses responses = operation.getResponses();
                        if (responses == null) {
                            responses = new ApiResponses();
                            operation.setResponses(responses);
                        }

                        addResponseIfMissing(responses, "400", BAD_REQUEST_ERROR);
                        addResponseIfMissing(responses, "401", UNAUTHORIZED_ERROR);
                        addResponseIfMissing(responses, "403", FORBIDDEN_ERROR);
                        addResponseIfMissing(responses, "404", NOT_FOUND_ERROR);
                        addResponseIfMissing(responses, "500", INTERNAL_SERVER_ERROR);
                    }));
        };
    }

    private Components openApiComponents() {
        return new Components()
                .addSchemas("FieldErrorDto", new ObjectSchema()
                        .name("FieldErrorDto")
                        .description("Field-level validation error")
                        .addProperty("field", new StringSchema())
                        .addProperty("message", new StringSchema())
                        .required(List.of("field", "message")))
                .addSchemas("ErrorResponse", new ObjectSchema()
                        .name("ErrorResponse")
                        .description("Canonical error response envelope")
                        .addProperty("timestamp", new StringSchema().format("date-time"))
                        .addProperty("status", new IntegerSchema().format("int32"))
                        .addProperty("error", new StringSchema())
                        .addProperty("message", new StringSchema())
                        .addProperty("path", new StringSchema())
                        .addProperty("code", new StringSchema())
                        .addProperty("traceId", new StringSchema())
                        .addProperty("fieldErrors", new ArraySchema().items(new Schema<>().$ref(FIELD_ERROR_SCHEMA_REF)))
                        .required(List.of("timestamp", "status", "error", "message", "path", "code", "traceId")))
                .addResponses(BAD_REQUEST_ERROR, errorApiResponse("Bad request"))
                .addResponses(UNAUTHORIZED_ERROR, errorApiResponse("Unauthorized"))
                .addResponses(FORBIDDEN_ERROR, errorApiResponse("Forbidden"))
                .addResponses(NOT_FOUND_ERROR, errorApiResponse("Not found"))
                .addResponses(INTERNAL_SERVER_ERROR, errorApiResponse("Internal server error"));
    }

    private ApiResponse errorApiResponse(String description) {
        return new ApiResponse()
                .description(description)
                .content(new Content()
                        .addMediaType("application/json", new MediaType()
                                .schema(new Schema<>().$ref(ERROR_RESPONSE_SCHEMA_REF))));
    }

    private void addResponseIfMissing(ApiResponses responses, String statusCode, String componentName) {
        if (!responses.containsKey(statusCode)) {
            responses.addApiResponse(statusCode, new ApiResponse().$ref("#/components/responses/" + componentName));
        }
    }
}
