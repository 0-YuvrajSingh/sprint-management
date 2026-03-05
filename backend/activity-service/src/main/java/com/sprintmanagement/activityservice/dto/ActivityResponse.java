package com.sprintmanagement.activityservice.dto;

import java.time.LocalDateTime;

import com.sprintmanagement.activityservice.entity.Activity.ActionType;
import com.sprintmanagement.activityservice.entity.Activity.TargetType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActivityResponse {

    private Long id;
    private String userEmail;
    private ActionType actionType;
    private TargetType targetType;
    private String targetId;
    private String description;
    private LocalDateTime timestamp;
}
