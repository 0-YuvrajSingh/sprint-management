package com.sprintmanagement.storiesservice.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.sprintmanagement.storiesservice.entity.StoryAssignment;

@Repository
public interface StoryAssignmentRepository extends JpaRepository<StoryAssignment, UUID> {

    List<StoryAssignment> findByStoryId(UUID storyId);

    boolean existsByStoryIdAndUserId(UUID storyId, UUID userId);

    Optional<StoryAssignment> findByStoryIdAndUserId(UUID storyId, UUID userId);

    void deleteByStoryId(UUID storyId);
}
