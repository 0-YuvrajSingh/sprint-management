package com.sprintmanagement.projectservice.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.sprintmanagement.projectservice.entity.Project;

public interface ProjectRepository extends JpaRepository<Project, UUID> {
}
