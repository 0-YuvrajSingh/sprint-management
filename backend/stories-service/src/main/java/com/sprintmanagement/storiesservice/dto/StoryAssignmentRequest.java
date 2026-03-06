package com.sprintmanagement.storiesservice.dto;

import java.util.UUID;

import jakarta.validation.constraints.NotNull;

public class StoryAssignmentRequest {

    @NotNull(message = "User ID is required")
    private UUID userId;

    private String skill;

    private Integer pointsAssigned;

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public String getSkill() {
        return skill;
    }

    public void setSkill(String skill) {
        this.skill = skill;
    }

    public Integer getPointsAssigned() {
        return pointsAssigned;
    }

    public void setPointsAssigned(Integer pointsAssigned) {
        this.pointsAssigned = pointsAssigned;
    }
}
