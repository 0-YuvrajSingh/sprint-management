package com.sprintmanagement.projectservice.service;

import com.sprintmanagement.projectservice.dto.ProjectRequest;
import com.sprintmanagement.projectservice.dto.ProjectResponse;
import com.sprintmanagement.projectservice.entity.Project;
import com.sprintmanagement.projectservice.exception.ResourceNotFoundException;
import com.sprintmanagement.projectservice.repository.ProjectRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;

    public ProjectService(ProjectRepository projectRepository) {
        this.projectRepository = projectRepository;
    }

    private ProjectResponse map(Project project) {
        return new ProjectResponse(
                project.getId(),
                project.getName(),
                project.getDescription(),
                project.getCreatedAt()
        );
    }

    public List<ProjectResponse> getAllProjects() {
        return projectRepository.findAll()
                .stream()
                .map(this::map)
                .toList();
    }

    public ProjectResponse getProjectById(UUID id) {
        return projectRepository.findById(id)
                .map(this::map)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Project not found with id: " + id));
    }

    public ProjectResponse createProject(ProjectRequest request) {

        if (request.getName() == null || request.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Project name is required");
        }

        Project project = new Project();
        project.setName(request.getName());
        project.setDescription(request.getDescription());
        return map(projectRepository.save(project));
    }

    @Transactional
    public ProjectResponse updateProject(UUID id, ProjectRequest request) {

        Project project = projectRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Project not found with id: " + id));

        if (request.getName() != null) {
            if (request.getName().trim().length() < 3 || request.getName().trim().length() > 100) {
                throw new IllegalArgumentException("Name must be between 3 and 100 characters");
            }
            project.setName(request.getName());
        }

        if (request.getDescription() != null) {
            if (request.getDescription().length() > 500) {
                throw new IllegalArgumentException("Description cannot exceed 500 characters");
            }
            project.setDescription(request.getDescription());
        }

        Project updatedProject = projectRepository.save(project);
        return map(updatedProject);
    }

    @Transactional
    public void deleteProject(UUID id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Project not found with id: " + id));

        projectRepository.delete(project);
    }
}