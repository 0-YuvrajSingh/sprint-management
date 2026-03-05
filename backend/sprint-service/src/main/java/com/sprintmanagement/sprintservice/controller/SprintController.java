package com.sprintmanagement.sprintservice.controller;

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

import com.sprintmanagement.sprintservice.dto.SprintRequest;
import com.sprintmanagement.sprintservice.dto.SprintResponse;
import com.sprintmanagement.sprintservice.entity.SprintStatus;
import com.sprintmanagement.sprintservice.service.SprintService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/sprints")
public class SprintController {

    private final SprintService sprintService;

    public SprintController(SprintService sprintService) {
        this.sprintService = sprintService;
    }

    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','DEVELOPER','VIEWER')")
    @GetMapping
    public Page<SprintResponse> getSprints(
            @RequestParam(required = false) UUID projectId,
            @RequestParam(required = false) SprintStatus status,
            Pageable pageable) {

        return sprintService.getSprints(projectId, status, pageable);
    }

    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','DEVELOPER','VIEWER')")
    @GetMapping("/{id}")
    public SprintResponse getSprintById(@PathVariable UUID id) {
        return sprintService.getSprintById(id);
    }

    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SprintResponse createSprint(@Valid @RequestBody SprintRequest request) {
        return sprintService.createSprint(request);
    }

    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @PatchMapping("/{id}")
    public SprintResponse updateSprint(@PathVariable UUID id,
            @RequestBody SprintRequest request) {
        return sprintService.updateSprint(id, request);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteSprint(@PathVariable UUID id) {
        sprintService.deleteSprint(id);
    }
}
