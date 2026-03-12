package com.sprintmanagement.activityservice.controller;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.sprintmanagement.activityservice.dto.ActivityRequest;
import com.sprintmanagement.activityservice.dto.ActivityResponse;
import com.sprintmanagement.activityservice.entity.Activity.TargetType;
import com.sprintmanagement.activityservice.service.ActivityService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/activities")
@RequiredArgsConstructor
public class ActivityController {

    private final ActivityService activityService;

    // ── Log an activity (called by other services) ────────────────────────────
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','DEVELOPER','VIEWER')")
    @PostMapping
    public ResponseEntity<ActivityResponse> log(
            @Valid @RequestBody ActivityRequest request,
            Authentication authentication) {

        String userEmail = authentication.getName();
        ActivityResponse saved = activityService.log(userEmail, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // ── Get activities by user email ──────────────────────────────────────────
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','DEVELOPER','VIEWER')")
    @GetMapping
    public ResponseEntity<?> getActivities(
            @RequestParam(required = false) String userEmail,
            @RequestParam(required = false) TargetType targetType,
            @RequestParam(required = false) String targetId,
            Pageable pageable) {

        if (userEmail != null) {
            List<ActivityResponse> results = activityService.getByUser(userEmail);
            return ResponseEntity.ok(results);
        }

        if (targetType != null && targetId != null) {
            List<ActivityResponse> results = activityService.getByTarget(targetType, targetId);
            return ResponseEntity.ok(results);
        }

        Page<ActivityResponse> page = activityService.getAll(pageable);
        return ResponseEntity.ok(page);
    }
}
