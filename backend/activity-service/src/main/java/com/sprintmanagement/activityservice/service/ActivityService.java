package com.sprintmanagement.activityservice.service;

import com.sprintmanagement.activityservice.dto.ActivityRequest;
import com.sprintmanagement.activityservice.entity.Activity;
import com.sprintmanagement.activityservice.entity.Activity.TargetType;
import com.sprintmanagement.activityservice.repository.ActivityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ActivityService {

    private final ActivityRepository activityRepository;

    // Called by other services via POST /api/activities
    public Activity log(String userEmail, String userId, ActivityRequest request) {
        Activity activity = Activity.builder()
                .userEmail(userEmail)
                .userId(userId)
                .actionType(request.getActionType())
                .targetType(request.getTargetType())
                .targetId(request.getTargetId())
                .description(request.getDescription())
                .build();

        return activityRepository.save(activity);
    }

    public List<Activity> getByUser(String userEmail) {
        return activityRepository.findByUserEmailOrderByTimestampDesc(userEmail);
    }

    public List<Activity> getByTarget(TargetType targetType, String targetId) {
        return activityRepository
                .findByTargetTypeAndTargetIdOrderByTimestampDesc(targetType, targetId);
    }

    public List<Activity> getAll() {
        return activityRepository.findAll();
    }
}