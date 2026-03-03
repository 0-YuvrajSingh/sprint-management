package com.sprintmanagement.activityservice.dto;

import com.sprintmanagement.activityservice.entity.Activity.ActionType;
import com.sprintmanagement.activityservice.entity.Activity.TargetType;
import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ActivityResponse {
    private Long id;
    private String userEmail;
    private String userId;
    private ActionType actionType;
    private TargetType targetType;
    private String targetId;
    private String description;
    private LocalDateTime timestamp;
}