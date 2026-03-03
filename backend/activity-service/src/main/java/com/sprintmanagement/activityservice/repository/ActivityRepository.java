package com.sprintmanagement.activityservice.repository;

import com.sprintmanagement.activityservice.entity.Activity;
import com.sprintmanagement.activityservice.entity.Activity.TargetType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityRepository extends JpaRepository<Activity, Long> {

    List<Activity> findByUserEmailOrderByTimestampDesc(String userEmail);

    List<Activity> findByTargetTypeAndTargetIdOrderByTimestampDesc(
            TargetType targetType, String targetId);

    List<Activity> findByUserIdOrderByTimestampDesc(String userId);
}