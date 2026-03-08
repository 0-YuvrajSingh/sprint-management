package com.sprintmanagement.storiesservice.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.sprintmanagement.storiesservice.dto.ProgressRequest;
import com.sprintmanagement.storiesservice.dto.StoryAssignmentRequest;
import com.sprintmanagement.storiesservice.dto.StoryAssignmentResponse;
import com.sprintmanagement.storiesservice.service.StoryAssignmentService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/stories/{storyId}")
public class StoryAssignmentController {

    private final StoryAssignmentService assignmentService;

    public StoryAssignmentController(StoryAssignmentService assignmentService) {
        this.assignmentService = assignmentService;
    }

    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','DEVELOPER','VIEWER')")
    @GetMapping("/assignments")
    public List<StoryAssignmentResponse> getAssignments(@PathVariable UUID storyId) {
        return assignmentService.getAssignmentsByStory(storyId);
    }

    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @PostMapping("/assignments")
    @ResponseStatus(HttpStatus.CREATED)
    public StoryAssignmentResponse createAssignment(
            @PathVariable UUID storyId,
            @Valid @RequestBody StoryAssignmentRequest request) {
        return assignmentService.createAssignment(storyId, request);
    }

    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','DEVELOPER')")
    @PatchMapping("/progress")
    public StoryAssignmentResponse updateProgress(
            @PathVariable UUID storyId,
            @Valid @RequestBody ProgressRequest request) {
        return assignmentService.updateProgress(storyId, request);
    }
}
