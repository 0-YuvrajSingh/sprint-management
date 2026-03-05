package com.sprintmanagement.storiesservice.dto;

import java.util.UUID;

import com.sprintmanagement.storiesservice.entity.StoryPriority;
import com.sprintmanagement.storiesservice.entity.StoryStatus;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class StoryRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotNull(message = "Status is required")
    private StoryStatus status;

    @NotNull(message = "Priority is required")
    private StoryPriority priority;

    private Integer storyPoints;

    @NotNull(message = "Project ID is required")
    private UUID projectId;

    private UUID sprintId;

    private String assigneeEmail;

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public StoryStatus getStatus() {
        return status;
    }

    public void setStatus(StoryStatus status) {
        this.status = status;
    }

    public StoryPriority getPriority() {
        return priority;
    }

    public void setPriority(StoryPriority priority) {
        this.priority = priority;
    }

    public Integer getStoryPoints() {
        return storyPoints;
    }

    public void setStoryPoints(Integer storyPoints) {
        this.storyPoints = storyPoints;
    }

    public UUID getProjectId() {
        return projectId;
    }

    public void setProjectId(UUID projectId) {
        this.projectId = projectId;
    }

    public UUID getSprintId() {
        return sprintId;
    }

    public void setSprintId(UUID sprintId) {
        this.sprintId = sprintId;
    }

    public String getAssigneeEmail() {
        return assigneeEmail;
    }

    public void setAssigneeEmail(String assigneeEmail) {
        this.assigneeEmail = assigneeEmail;
    }
}
