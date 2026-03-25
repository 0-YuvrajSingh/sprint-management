package com.sprintmanagement.storiesservice.service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sprintmanagement.storiesservice.dto.ProgressRequest;
import com.sprintmanagement.storiesservice.dto.StoryAssignmentRequest;
import com.sprintmanagement.storiesservice.dto.StoryAssignmentResponse;
import com.sprintmanagement.storiesservice.entity.StoryAssignment;
import com.sprintmanagement.storiesservice.exception.ResourceNotFoundException;
import com.sprintmanagement.storiesservice.integration.ActivityAuditClient;
import com.sprintmanagement.storiesservice.repository.StoryAssignmentRepository;
import com.sprintmanagement.storiesservice.repository.StoryRepository;

@Service
public class StoryAssignmentService {

    private final StoryAssignmentRepository assignmentRepository;
    private final StoryRepository storyRepository;
    private final ActivityAuditClient activityAuditClient;

    public StoryAssignmentService(StoryAssignmentRepository assignmentRepository,
            StoryRepository storyRepository,
            ActivityAuditClient activityAuditClient) {
        this.assignmentRepository = assignmentRepository;
        this.storyRepository = storyRepository;
        this.activityAuditClient = activityAuditClient;
    }

    @Transactional(readOnly = true)
    public List<StoryAssignmentResponse> getAssignmentsByStory(UUID storyId) {
        verifyStoryExists(storyId);
        return assignmentRepository.findByStoryId(storyId).stream()
                .map(StoryAssignmentResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public StoryAssignmentResponse createAssignment(UUID storyId, StoryAssignmentRequest request) {
        verifyStoryExists(storyId);

        if (assignmentRepository.existsByStoryIdAndUserId(storyId, request.getUserId())) {
            throw new IllegalArgumentException(
                    "User " + request.getUserId() + " is already assigned to story " + storyId);
        }

        StoryAssignment assignment = new StoryAssignment();
        assignment.setStoryId(storyId);
        assignment.setUserId(request.getUserId());
        assignment.setSkill(request.getSkill());
        assignment.setPointsAssigned(request.getPointsAssigned());

        StoryAssignment saved = assignmentRepository.save(assignment);
        activityAuditClient.log("ASSIGNED", "ASSIGNMENT", saved.getId().toString(), "Story assignment created");

        return StoryAssignmentResponse.fromEntity(saved);
    }

    @Transactional
    public StoryAssignmentResponse updateProgress(UUID storyId, ProgressRequest request) {
        verifyStoryExists(storyId);

        StoryAssignment assignment = assignmentRepository
                .findByStoryIdAndUserId(storyId, request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException(
                "No assignment found for user " + request.getUserId()
                + " on story " + storyId));

        assignment.setPointsCompleted(request.getPointsCompleted());
        StoryAssignment saved = assignmentRepository.save(assignment);
        activityAuditClient.log("UPDATED", "ASSIGNMENT", saved.getId().toString(), "Story assignment progress updated");
        return StoryAssignmentResponse.fromEntity(saved);
    }

    private void verifyStoryExists(UUID storyId) {
        if (!storyRepository.existsById(storyId)) {
            throw new ResourceNotFoundException("Story not found with id: " + storyId);
        }
    }
}
