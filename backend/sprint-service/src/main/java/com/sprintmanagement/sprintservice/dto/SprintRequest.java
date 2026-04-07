package com.sprintmanagement.sprintservice.dto;

import java.time.LocalDate;
import java.util.UUID;

import com.sprintmanagement.sprintservice.entity.SprintStatus;

public class SprintRequest {

    private String name;

    private UUID projectId;

    private LocalDate startDate;

    private LocalDate endDate;

    private SprintStatus status;

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

    public SprintStatus getStatus() {
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

    public void setStatus(SprintStatus status) {
        this.status = status;
    }

    public void setVelocity(Integer velocity) {
        this.velocity = velocity;
    }
}
