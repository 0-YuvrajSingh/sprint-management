package com.sprintmanagement.sprintservice.service;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sprintmanagement.sprintservice.dto.SprintRequest;
import com.sprintmanagement.sprintservice.dto.SprintResponse;
import com.sprintmanagement.sprintservice.entity.Sprint;
import com.sprintmanagement.sprintservice.entity.SprintStatus;
import com.sprintmanagement.sprintservice.exception.ResourceNotFoundException;
import com.sprintmanagement.sprintservice.integration.ActivityAuditClient;
import com.sprintmanagement.sprintservice.repository.SprintRepository;

@Service
public class SprintService {

    private final SprintRepository sprintRepository;
    private final ActivityAuditClient activityAuditClient;

    public SprintService(SprintRepository sprintRepository, ActivityAuditClient activityAuditClient) {
        this.sprintRepository = sprintRepository;
        this.activityAuditClient = activityAuditClient;
    }

    private SprintResponse map(Sprint sprint) {
        return new SprintResponse(
                sprint.getId(),
                sprint.getName(),
                sprint.getProjectId(),
                sprint.getStartDate(),
                sprint.getEndDate(),
                sprint.getStatus(),
                sprint.getVelocity()
        );
    }

    public Page<SprintResponse> getSprints(UUID projectId,
            SprintStatus status,
            Pageable pageable) {

        Page<Sprint> page;

        if (projectId != null && status != null) {
            page = sprintRepository.findByProjectIdAndStatus(projectId, status, pageable);
        } else if (projectId != null) {
            page = sprintRepository.findByProjectId(projectId, pageable);
        } else if (status != null) {
            page = sprintRepository.findByStatus(status, pageable);
        } else {
            page = sprintRepository.findAll(pageable);
        }

        return page.map(this::map);
    }

    public SprintResponse getSprintById(UUID id) {
        return sprintRepository.findById(id)
                .map(this::map)
                .orElseThrow(()
                        -> new ResourceNotFoundException("Sprint not found with id: " + id));
    }

    @Transactional
    public SprintResponse createSprint(SprintRequest request) {
        if (request.getName() == null || request.getName().isBlank()) {
            throw new IllegalArgumentException("Sprint name is required");
        }
        if (request.getProjectId() == null) {
            throw new IllegalArgumentException("Project ID is required");
        }
        if (request.getStartDate() == null) {
            throw new IllegalArgumentException("Start date is required");
        }
        if (request.getEndDate() == null) {
            throw new IllegalArgumentException("End date is required");
        }

        Sprint sprint = new Sprint();
        sprint.setName(request.getName().trim());
        sprint.setProjectId(request.getProjectId());
        sprint.setStartDate(request.getStartDate().atStartOfDay());
        sprint.setEndDate(request.getEndDate().atTime(23, 59, 59));
        sprint.setStatus(request.getStatus());
        sprint.setVelocity(request.getVelocity());

        Sprint saved = sprintRepository.save(sprint);
        activityAuditClient.log("CREATED", "SPRINT", saved.getId().toString(), "Sprint created");

        return map(saved);
    }

    @Transactional
    public SprintResponse updateSprint(UUID id, SprintRequest request) {

        Sprint sprint = sprintRepository.findById(id)
                .orElseThrow(()
                        -> new ResourceNotFoundException("Sprint not found with id: " + id));

        if (request.getName() != null) {
            if (request.getName().isBlank()) {
                throw new IllegalArgumentException("Sprint name cannot be blank");
            }
            sprint.setName(request.getName().trim());
        }

        if (request.getProjectId() != null) {
            sprint.setProjectId(request.getProjectId());
        }

        if (request.getStartDate() != null) {
            sprint.setStartDate(request.getStartDate().atStartOfDay());
        }

        if (request.getEndDate() != null) {
            sprint.setEndDate(request.getEndDate().atTime(23, 59, 59));
        }

        if (request.getStatus() != null) {
            sprint.setStatus(request.getStatus());
        }

        if (request.getVelocity() != null) {
            sprint.setVelocity(request.getVelocity());
        }

        Sprint saved = sprintRepository.save(sprint);
        activityAuditClient.log("UPDATED", "SPRINT", saved.getId().toString(), "Sprint updated");

        return map(saved);
    }

    @Transactional
    public void deleteSprint(UUID id) {
        if (!sprintRepository.existsById(id)) {
            throw new ResourceNotFoundException("Sprint not found with id: " + id);
        }
        sprintRepository.deleteById(id);
        activityAuditClient.log("DELETED", "SPRINT", id.toString(), "Sprint deleted");
    }
}
