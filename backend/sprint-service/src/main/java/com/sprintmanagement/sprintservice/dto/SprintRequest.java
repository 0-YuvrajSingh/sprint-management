package com.sprintmanagement.sprintservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.UUID;

public class SprintRequest {

    @NotBlank(message = "Sprint name is required")
    private String name;

    @NotNull(message = "Project ID is required")
    private UUID projectId;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    private LocalDate endDate;

    @NotBlank(message = "Status is required")
    private String status;

    @NotNull(message = "Velocity is required")
    private Integer velocity;

    public SprintRequest() {
    }

    public String getName() {
        return name;
    }

    public UUID getProjectId() {
        return projectId;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public String getStatus() {
        return status;
    }

    public Integer getVelocity() {
        return velocity;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setProjectId(UUID projectId) {
        this.projectId = projectId;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setVelocity(Integer velocity) {
        this.velocity = velocity;
    }
}