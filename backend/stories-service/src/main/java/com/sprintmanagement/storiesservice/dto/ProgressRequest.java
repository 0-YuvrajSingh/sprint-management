package com.sprintmanagement.storiesservice.dto;

import java.util.UUID;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class ProgressRequest {

    @NotNull(message = "User ID is required")
    private UUID userId;

    @NotNull(message = "Points completed is required")
    @Min(value = 0, message = "Points completed cannot be negative")
    private Integer pointsCompleted;

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public Integer getPointsCompleted() {
        return pointsCompleted;
    }

    public void setPointsCompleted(Integer pointsCompleted) {
        this.pointsCompleted = pointsCompleted;
    }
}
