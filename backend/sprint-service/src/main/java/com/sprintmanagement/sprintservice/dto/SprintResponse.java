package com.sprintmanagement.sprintservice.dto;

import com.sprintmanagement.sprintservice.entity.SprintStatus;

import java.time.LocalDateTime;
import java.util.UUID;

public class SprintResponse {

    private UUID id;
    private String name;
    private UUID projectId;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private SprintStatus status;
    private Integer velocity;

    public SprintResponse(UUID id,
                          String name,
                          UUID projectId,
                          LocalDateTime startDate,
                          LocalDateTime endDate,
                          SprintStatus status,
                          Integer velocity) {
        this.id = id;
        this.name = name;
        this.projectId = projectId;
        this.startDate = startDate;
        this.endDate = endDate;
        this.status = status;
        this.velocity = velocity;
    }

    public UUID getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public UUID getProjectId() {
        return projectId;
    }

    public LocalDateTime getStartDate() {
        return startDate;
    }

    public LocalDateTime getEndDate() {
        return endDate;
    }

    public SprintStatus getStatus() {
        return status;
    }

    public Integer getVelocity() {
        return velocity;
    }
}