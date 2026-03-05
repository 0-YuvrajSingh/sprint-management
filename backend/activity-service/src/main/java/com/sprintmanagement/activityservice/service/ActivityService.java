package com.sprintmanagement.activityservice.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.sprintmanagement.activityservice.dto.ActivityRequest;
import com.sprintmanagement.activityservice.dto.ActivityResponse;
import com.sprintmanagement.activityservice.entity.Activity;
import com.sprintmanagement.activityservice.entity.Activity.TargetType;
import com.sprintmanagement.activityservice.repository.ActivityRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ActivityService {

    private final ActivityRepository activityRepository;

    public ActivityResponse log(String userEmail, ActivityRequest request) {
        Activity activity = Activity.builder()
                .userEmail(userEmail)
                .actionType(request.getActionType())
                .targetType(request.getTargetType())
                .targetId(request.getTargetId())
                .description(request.getDescription())
                .build();

        return mapToResponse(activityRepository.save(activity));
    }

    public List<ActivityResponse> getByUser(String userEmail) {
        return activityRepository.findByUserEmailOrderByTimestampDesc(userEmail)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<ActivityResponse> getByTarget(TargetType targetType, String targetId) {
        return activityRepository
                .findByTargetTypeAndTargetIdOrderByTimestampDesc(targetType, targetId)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public Page<ActivityResponse> getAll(Pageable pageable) {
        return activityRepository.findAll(pageable).map(this::mapToResponse);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────
    private ActivityResponse mapToResponse(Activity a) {
        return ActivityResponse.builder()
                .id(a.getId())
                .userEmail(a.getUserEmail())
                .actionType(a.getActionType())
                .targetType(a.getTargetType())
                .targetId(a.getTargetId())
                .description(a.getDescription())
                .timestamp(a.getTimestamp())
                .build();
    }
}
