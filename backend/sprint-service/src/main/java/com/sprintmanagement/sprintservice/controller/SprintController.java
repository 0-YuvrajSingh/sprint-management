package com.sprintmanagement.sprintservice.controller;

import com.sprintmanagement.sprintservice.dto.SprintRequest;
import com.sprintmanagement.sprintservice.dto.SprintResponse;
import com.sprintmanagement.sprintservice.entity.SprintStatus;
import com.sprintmanagement.sprintservice.service.SprintService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/sprints")
public class SprintController {

    private final SprintService sprintService;

    public SprintController(SprintService sprintService) {
        this.sprintService = sprintService;
    }

    @GetMapping
    public Page<SprintResponse> getSprints(
            @RequestParam(required = false) UUID projectId,
            @RequestParam(required = false) SprintStatus status,
            Pageable pageable) {

        return sprintService.getSprints(projectId, status, pageable);
    }

    @GetMapping("/{id}")
    public SprintResponse getSprintById(@PathVariable UUID id) {
        return sprintService.getSprintById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SprintResponse createSprint(@Valid @RequestBody SprintRequest request) {
        return sprintService.createSprint(request);
    }

    @PatchMapping("/{id}")
    public SprintResponse updateSprint(@PathVariable UUID id,
                                       @RequestBody SprintRequest request) {
        return sprintService.updateSprint(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteSprint(@PathVariable UUID id) {
        sprintService.deleteSprint(id);
    }
}
