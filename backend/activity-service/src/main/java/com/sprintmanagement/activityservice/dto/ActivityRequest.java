package com.sprintmanagement.activityservice.dto;

import com.sprintmanagement.activityservice.entity.Activity.ActionType;
import com.sprintmanagement.activityservice.entity.Activity.TargetType;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ActivityRequest {
    private ActionType actionType;
    private TargetType targetType;
    private String targetId;
    private String description;
}