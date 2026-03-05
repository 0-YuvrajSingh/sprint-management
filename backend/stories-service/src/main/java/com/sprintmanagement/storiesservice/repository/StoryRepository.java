package com.sprintmanagement.storiesservice.repository;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.sprintmanagement.storiesservice.entity.Story;
import com.sprintmanagement.storiesservice.entity.StoryStatus;

@Repository
public interface StoryRepository extends JpaRepository<Story, UUID> {

    Page<Story> findByProjectId(UUID projectId, Pageable pageable);

    Page<Story> findBySprintId(UUID sprintId, Pageable pageable);

    Page<Story> findByProjectIdAndStatus(UUID projectId, StoryStatus status, Pageable pageable);
}
