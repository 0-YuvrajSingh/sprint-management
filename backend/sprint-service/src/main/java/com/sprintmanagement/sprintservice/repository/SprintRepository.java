package com.sprintmanagement.sprintservice.repository;

import com.sprintmanagement.sprintservice.entity.Sprint;
import com.sprintmanagement.sprintservice.entity.SprintStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SprintRepository extends JpaRepository<Sprint, UUID> {
    List<Sprint> findByProjectId(UUID projectId);

    List<Sprint> findByStatus(SprintStatus status);
}
