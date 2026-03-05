package com.sprintmanagement.activityservice.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.sprintmanagement.activityservice.entity.Activity;
import com.sprintmanagement.activityservice.entity.Activity.TargetType;

@Repository
public interface ActivityRepository extends JpaRepository<Activity, Long> {

    List<Activity> findByUserEmailOrderByTimestampDesc(String userEmail);

    List<Activity> findByTargetTypeAndTargetIdOrderByTimestampDesc(
            TargetType targetType, String targetId);
}
