package com.sprintmanagement.sprintservice.dto;

import com.sprintmanagement.sprintservice.entity.SprintStatus;

import java.time.LocalDateTime;

public class SprintUpdateRequest {

    private String name;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private SprintStatus status;
    private Integer velocity;

    public SprintUpdateRequest() {
    }

    public String getName() {
        return name;
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

    public void setName(String name) {
        this.name = name;
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