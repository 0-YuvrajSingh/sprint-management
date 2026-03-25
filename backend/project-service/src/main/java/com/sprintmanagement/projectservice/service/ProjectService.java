package com.sprintmanagement.projectservice.service;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sprintmanagement.projectservice.dto.ProjectRequest;
import com.sprintmanagement.projectservice.dto.ProjectResponse;
import com.sprintmanagement.projectservice.entity.Project;
import com.sprintmanagement.projectservice.exception.ResourceNotFoundException;
import com.sprintmanagement.projectservice.integration.ActivityAuditClient;
import com.sprintmanagement.projectservice.repository.ProjectRepository;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ActivityAuditClient activityAuditClient;

    public ProjectService(ProjectRepository projectRepository, ActivityAuditClient activityAuditClient) {
        this.projectRepository = projectRepository;
        this.activityAuditClient = activityAuditClient;
    }

    private ProjectResponse map(Project project) {
        return new ProjectResponse(
                project.getId(),
                project.getName(),
                project.getDescription(),
                project.getCreatedAt()
        );
    }

    public Page<ProjectResponse> getAllProjects(Pageable pageable) {
        return projectRepository.findAll(pageable)
                .map(this::map);
    }

    public ProjectResponse getProjectById(UUID id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(()
                        -> new ResourceNotFoundException("Project not found with id: " + id));
        return map(project);
    }

    @Transactional
    public ProjectResponse createProject(ProjectRequest request) {

        Project project = new Project();
        project.setName(request.getName().trim());
        project.setDescription(request.getDescription());

        Project saved = projectRepository.save(project);
        activityAuditClient.log("CREATED", "PROJECT", saved.getId().toString(), "Project created");

        return map(saved);
    }

    @Transactional
    public ProjectResponse updateProject(UUID id, ProjectRequest request) {

        Project project = projectRepository.findById(id)
                .orElseThrow(()
                        -> new ResourceNotFoundException("Project not found with id: " + id));

        if (request.getName() != null) {
            project.setName(request.getName().trim());
        }

        if (request.getDescription() != null) {
            project.setDescription(request.getDescription());
        }

        Project saved = projectRepository.save(project);
        activityAuditClient.log("UPDATED", "PROJECT", saved.getId().toString(), "Project updated");

        return map(saved);
    }

    @Transactional
    public void deleteProject(UUID id) {
        if (!projectRepository.existsById(id)) {
            throw new ResourceNotFoundException("Project not found with id: " + id);
        }
        projectRepository.deleteById(id);
        activityAuditClient.log("DELETED", "PROJECT", id.toString(), "Project deleted");
    }
}
