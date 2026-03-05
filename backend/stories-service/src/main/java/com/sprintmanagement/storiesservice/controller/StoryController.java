package com.sprintmanagement.storiesservice.controller;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.sprintmanagement.storiesservice.dto.StoryRequest;
import com.sprintmanagement.storiesservice.dto.StoryResponse;
import com.sprintmanagement.storiesservice.entity.StoryStatus;
import com.sprintmanagement.storiesservice.service.StoryService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/stories")
public class StoryController {

    private final StoryService storyService;

    public StoryController(StoryService storyService) {
        this.storyService = storyService;
    }

    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','DEVELOPER','VIEWER')")
    @GetMapping
    public Page<StoryResponse> getStories(
            @RequestParam(required = false) UUID projectId,
            @RequestParam(required = false) UUID sprintId,
            @RequestParam(required = false) StoryStatus status,
            Pageable pageable) {

        return storyService.getStories(projectId, sprintId, status, pageable);
    }

    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','DEVELOPER','VIEWER')")
    @GetMapping("/{id}")
    public StoryResponse getStoryById(@PathVariable UUID id) {
        return storyService.getStoryById(id);
    }

    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public StoryResponse createStory(@Valid @RequestBody StoryRequest request) {
        return storyService.createStory(request);
    }

    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @PatchMapping("/{id}")
    public StoryResponse updateStory(@PathVariable UUID id,
            @RequestBody StoryRequest request) {
        return storyService.updateStory(id, request);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteStory(@PathVariable UUID id) {
        storyService.deleteStory(id);
    }
}
