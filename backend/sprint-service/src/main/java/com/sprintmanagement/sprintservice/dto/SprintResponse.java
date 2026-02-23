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

    public SprintResponse(UUID id, String name, UUID projectId, LocalDateTime startDate, LocalDateTime endDate, SprintStatus status, Integer velocity) {
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

    public void setId(UUID id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setProjectId(UUID projectId) {
        this.projectId = projectId;
    }

    public void setStartDate(LocalDateTime startDate) {
        this.startDate = startDate;
    }

    public void setEndDate(LocalDateTime endDate) {
        this.endDate = endDate;
    }

    public void setStatus(SprintStatus status) {
        this.status = status;
    }

    public void setVelocity(Integer velocity) {
        this.velocity = velocity;
    }
}