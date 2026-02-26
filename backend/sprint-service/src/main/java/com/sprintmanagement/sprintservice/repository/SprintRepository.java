package com.sprintmanagement.sprintservice.repository;

import com.sprintmanagement.sprintservice.entity.Sprint;
import com.sprintmanagement.sprintservice.entity.SprintStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface SprintRepository extends JpaRepository<Sprint, UUID> {

    Page<Sprint> findByProjectId(UUID projectId, Pageable pageable);

    Page<Sprint> findByStatus(SprintStatus status, Pageable pageable);

    Page<Sprint> findByProjectIdAndStatus(UUID projectId,
                                          SprintStatus status,
                                          Pageable pageable);
}