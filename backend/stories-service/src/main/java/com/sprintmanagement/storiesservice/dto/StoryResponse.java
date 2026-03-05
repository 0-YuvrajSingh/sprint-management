package com.sprintmanagement.storiesservice.dto;

import java.time.LocalDateTime;
import java.util.UUID;

import com.sprintmanagement.storiesservice.entity.Story;
import com.sprintmanagement.storiesservice.entity.StoryPriority;
import com.sprintmanagement.storiesservice.entity.StoryStatus;

public class StoryResponse {

    private UUID id;
    private String title;
    private String description;
    private StoryStatus status;
    private StoryPriority priority;
    private Integer storyPoints;
    private UUID projectId;
    private UUID sprintId;
    private String assigneeEmail;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static StoryResponse fromEntity(Story story) {
        StoryResponse r = new StoryResponse();
        r.id = story.getId();
        r.title = story.getTitle();
        r.description = story.getDescription();
        r.status = story.getStatus();
        r.priority = story.getPriority();
        r.storyPoints = story.getStoryPoints();
        r.projectId = story.getProjectId();
        r.sprintId = story.getSprintId();
        r.assigneeEmail = story.getAssigneeEmail();
        r.createdAt = story.getCreatedAt();
        r.updatedAt = story.getUpdatedAt();
        return r;
    }

    public UUID getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public StoryStatus getStatus() {
        return status;
    }

    public StoryPriority getPriority() {
        return priority;
    }

    public Integer getStoryPoints() {
        return storyPoints;
    }

    public UUID getProjectId() {
        return projectId;
    }

    public UUID getSprintId() {
        return sprintId;
    }

    public String getAssigneeEmail() {
        return assigneeEmail;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
