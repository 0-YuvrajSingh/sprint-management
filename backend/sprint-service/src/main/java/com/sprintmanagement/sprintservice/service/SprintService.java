package com.sprintmanagement.sprintservice.service;

import com.sprintmanagement.sprintservice.dto.SprintRequest;
import com.sprintmanagement.sprintservice.dto.SprintResponse;
import com.sprintmanagement.sprintservice.dto.SprintUpdateRequest;
import com.sprintmanagement.sprintservice.entity.Sprint;
import com.sprintmanagement.sprintservice.entity.SprintStatus;
import com.sprintmanagement.sprintservice.exception.ResourceNotFoundException;
import com.sprintmanagement.sprintservice.repository.SprintRepository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;
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

    public List<SprintResponse> getAllSprints() {
        return sprintRepository.findAll()
                .stream()
                .map(this::map)
                .toList();
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

        return map(sprintRepository.save(sprint));
    }

    public List<SprintResponse> getSprintsByProjectId(UUID projectId) {
        return sprintRepository.findByProjectId(projectId)
                .stream()
                .map(this::map)
                .toList();
    }

    public List<SprintResponse> getSprintsByStatus(SprintStatus status) {
        return sprintRepository.findByStatus(status)
                .stream()
                .map(this::map)
                .toList();
    }

    @Transactional
    public SprintResponse updateSprint(UUID id, SprintUpdateRequest request) {

        Sprint sprint = sprintRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Sprint not found with id: " + id));

        if (request.getName() != null)
            sprint.setName(request.getName());

        if (request.getStartDate() != null)
            sprint.setStartDate(request.getStartDate());

        if (request.getEndDate() != null)
            sprint.setEndDate(request.getEndDate());

        if (request.getStatus() != null)
            sprint.setStatus(request.getStatus());

        if (request.getVelocity() != null)
            sprint.setVelocity(request.getVelocity());

        return map(sprint);
    }

    public void deleteSprint(UUID id) {
        Sprint sprint = sprintRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Sprint not found with id: " + id));

        sprintRepository.delete(sprint);
    }
}