package com.sprintmanagement.storiesservice.service;

import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sprintmanagement.storiesservice.dto.ProgressRequest;
import com.sprintmanagement.storiesservice.dto.StoryAssignmentRequest;
import com.sprintmanagement.storiesservice.dto.StoryAssignmentResponse;
import com.sprintmanagement.storiesservice.entity.StoryAssignment;
import com.sprintmanagement.storiesservice.exception.ResourceNotFoundException;
import com.sprintmanagement.storiesservice.repository.StoryAssignmentRepository;
import com.sprintmanagement.storiesservice.repository.StoryRepository;

@Service
public class StoryAssignmentService {

    private final StoryAssignmentRepository assignmentRepository;
    private final StoryRepository storyRepository;

    public StoryAssignmentService(StoryAssignmentRepository assignmentRepository,
            StoryRepository storyRepository) {
        this.assignmentRepository = assignmentRepository;
        this.storyRepository = storyRepository;
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

        return StoryAssignmentResponse.fromEntity(assignmentRepository.save(assignment));
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
        return StoryAssignmentResponse.fromEntity(assignmentRepository.save(assignment));
    }

    private void verifyStoryExists(UUID storyId) {
        if (!storyRepository.existsById(storyId)) {
            throw new ResourceNotFoundException("Story not found with id: " + storyId);
        }
    }
}
