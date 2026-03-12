package com.sprintmanagement.activityservice.dto;

import com.sprintmanagement.activityservice.entity.Activity.ActionType;
import com.sprintmanagement.activityservice.entity.Activity.TargetType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
public class ActivityRequest {

    @NotNull(message = "actionType is required")
    private ActionType actionType;

    @NotNull(message = "targetType is required")
    private TargetType targetType;

    @NotBlank(message = "targetId is required")
    private String targetId;

    private String description;
}
