package com.sprintmanagement.storiesservice.service;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sprintmanagement.storiesservice.dto.StoryRequest;
import com.sprintmanagement.storiesservice.dto.StoryResponse;
import com.sprintmanagement.storiesservice.entity.Story;
import com.sprintmanagement.storiesservice.entity.StoryStatus;
import com.sprintmanagement.storiesservice.exception.ResourceNotFoundException;
import com.sprintmanagement.storiesservice.integration.ActivityAuditClient;
import com.sprintmanagement.storiesservice.repository.StoryRepository;

@Service
public class StoryService {

    private final StoryRepository storyRepository;
    private final ActivityAuditClient activityAuditClient;

    public StoryService(StoryRepository storyRepository, ActivityAuditClient activityAuditClient) {
        this.storyRepository = storyRepository;
        this.activityAuditClient = activityAuditClient;
    }

    @Transactional(readOnly = true)
    public Page<StoryResponse> getStories(UUID projectId, UUID sprintId,
            StoryStatus status, Pageable pageable) {

        if (projectId != null && sprintId != null && status != null) {
            return storyRepository.findByProjectIdAndSprintIdAndStatus(projectId, sprintId, status, pageable)
                    .map(StoryResponse::fromEntity);
        }
        if (projectId != null && sprintId != null) {
            return storyRepository.findByProjectIdAndSprintId(projectId, sprintId, pageable)
                    .map(StoryResponse::fromEntity);
        }
        if (projectId != null && status != null) {
            return storyRepository.findByProjectIdAndStatus(projectId, status, pageable)
                    .map(StoryResponse::fromEntity);
        }
        if (projectId != null) {
            return storyRepository.findByProjectId(projectId, pageable)
                    .map(StoryResponse::fromEntity);
        }
        if (sprintId != null) {
            return storyRepository.findBySprintId(sprintId, pageable)
                    .map(StoryResponse::fromEntity);
        }
        return storyRepository.findAll(pageable).map(StoryResponse::fromEntity);
    }

    @Transactional(readOnly = true)
    public StoryResponse getStoryById(UUID id) {
        return storyRepository.findById(id)
                .map(StoryResponse::fromEntity)
                .orElseThrow(()
                        -> new ResourceNotFoundException("Story not found with id: " + id));
    }

    @Transactional
    public StoryResponse createStory(StoryRequest request) {
        Story story = new Story();
        story.setTitle(request.getTitle());
        story.setDescription(request.getDescription());
        story.setStatus(request.getStatus());
        story.setPriority(request.getPriority());
        story.setStoryPoints(request.getStoryPoints());
        story.setProjectId(request.getProjectId());
        story.setSprintId(request.getSprintId());
        story.setAssigneeEmail(request.getAssigneeEmail());

        Story saved = storyRepository.save(story);
        activityAuditClient.log("CREATED", "STORY", saved.getId().toString(), "Story created");

        return StoryResponse.fromEntity(saved);
    }

    @Transactional
    public StoryResponse updateStory(UUID id, StoryRequest request) {
        Story story = storyRepository.findById(id)
                .orElseThrow(()
                        -> new ResourceNotFoundException("Story not found with id: " + id));

        if (request.getTitle() != null) {
            story.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            story.setDescription(request.getDescription());
        }
        if (request.getStatus() != null) {
            story.setStatus(request.getStatus());
        }
        if (request.getPriority() != null) {
            story.setPriority(request.getPriority());
        }
        if (request.getStoryPoints() != null) {
            story.setStoryPoints(request.getStoryPoints());
        }
        if (request.getSprintId() != null) {
            story.setSprintId(request.getSprintId());
        }
        if (request.getAssigneeEmail() != null) {
            story.setAssigneeEmail(request.getAssigneeEmail());
        }

        Story saved = storyRepository.save(story);
        activityAuditClient.log("UPDATED", "STORY", saved.getId().toString(), "Story updated");

        return StoryResponse.fromEntity(saved);
    }

    @Transactional
    public void deleteStory(UUID id) {

        Story story = storyRepository.findById(id)
                .orElseThrow(()
                        -> new ResourceNotFoundException("Story not found with id: " + id));
        storyRepository.delete(story);
        activityAuditClient.log("DELETED", "STORY", id.toString(), "Story deleted");
    }
}
