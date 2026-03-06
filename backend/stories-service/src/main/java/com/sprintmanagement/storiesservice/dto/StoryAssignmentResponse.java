package com.sprintmanagement.storiesservice.dto;

import java.util.UUID;

import com.sprintmanagement.storiesservice.entity.StoryAssignment;

public class StoryAssignmentResponse {

    private UUID id;
    private UUID storyId;
    private UUID userId;
    private String skill;
    private Integer pointsAssigned;
    private Integer pointsCompleted;

    public static StoryAssignmentResponse fromEntity(StoryAssignment a) {
        StoryAssignmentResponse r = new StoryAssignmentResponse();
        r.id = a.getId();
        r.storyId = a.getStoryId();
        r.userId = a.getUserId();
        r.skill = a.getSkill();
        r.pointsAssigned = a.getPointsAssigned();
        r.pointsCompleted = a.getPointsCompleted();
        return r;
    }

    public UUID getId() {
        return id;
    }

    public UUID getStoryId() {
        return storyId;
    }

    public UUID getUserId() {
        return userId;
    }

    public String getSkill() {
        return skill;
    }

    public Integer getPointsAssigned() {
        return pointsAssigned;
    }

    public Integer getPointsCompleted() {
        return pointsCompleted;
    }
}
