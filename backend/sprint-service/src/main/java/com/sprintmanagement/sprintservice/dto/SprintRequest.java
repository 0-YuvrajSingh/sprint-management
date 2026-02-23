package com.sprintmanagement.sprintservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public class SprintRequest {

    @NotBlank(message = "Sprint name is required")
    private String name;

    @NotNull(message = "Project ID is required")
    private UUID projectId;

    public SprintRequest() {
    }

    public String getName() {
        return name;
    }

    public UUID getProjectId() {
        return projectId;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setProjectId(UUID projectId) {
        this.projectId = projectId;
    }
}