package com.sprintmanagement.projectservice.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public class ProjectResponse {

    private UUID id;

    private String name;

    private String description;

    private LocalDateTime createdDate;

    public ProjectResponse(UUID id, String name, String description, LocalDateTime createdDate) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.createdDate = createdDate;
    }

    public UUID getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public  LocalDateTime getCreatedDate() {
        return createdDate;
    }
}
