package com.sprintmanagement.sprintservice.service;

import com.sprintmanagement.sprintservice.dto.SprintRequest;
import com.sprintmanagement.sprintservice.dto.SprintResponse;
import com.sprintmanagement.sprintservice.entity.Sprint;
import com.sprintmanagement.sprintservice.entity.SprintStatus;
import com.sprintmanagement.sprintservice.exception.ResourceNotFoundException;
import com.sprintmanagement.sprintservice.repository.SprintRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class SprintService {

    private final SprintRepository sprintRepository;

    public SprintService(SprintRepository sprintRepository) {
        this.sprintRepository = sprintRepository;
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

    private SprintStatus parseStatus(String status) {
        try {
            return SprintStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid sprint status: " + status);
        }
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
                .orElseThrow(() ->
                        new ResourceNotFoundException("Sprint not found with id: " + id));
    }

    public SprintResponse createSprint(SprintRequest request) {
        Sprint sprint = new Sprint();
        sprint.setName(request.getName());
        sprint.setProjectId(request.getProjectId());
        sprint.setStartDate(request.getStartDate().atStartOfDay());
        sprint.setEndDate(request.getEndDate().atTime(23, 59, 59));
        sprint.setStatus(parseStatus(request.getStatus()));
        sprint.setVelocity(request.getVelocity());

        return map(sprintRepository.save(sprint));
    }

    @Transactional
    public SprintResponse updateSprint(UUID id, SprintRequest request) {

        Sprint sprint = sprintRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Sprint not found with id: " + id));

        if (request.getName() != null)
            sprint.setName(request.getName());

        if (request.getProjectId() != null)
            sprint.setProjectId(request.getProjectId());

        if (request.getStartDate() != null)
            sprint.setStartDate(request.getStartDate().atStartOfDay());

        if (request.getEndDate() != null)
            sprint.setEndDate(request.getEndDate().atTime(23, 59, 59));

        if (request.getStatus() != null)
            sprint.setStatus(parseStatus(request.getStatus()));

        if (request.getVelocity() != null)
            sprint.setVelocity(request.getVelocity());

        return map(sprint);
    }

    public void deleteSprint(UUID id) {
        if (!sprintRepository.existsById(id)) {
            throw new ResourceNotFoundException("Sprint not found with id: " + id);
        }
        sprintRepository.deleteById(id);
    }
}
