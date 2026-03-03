package com.sprintmanagement.activityservice.controller;

import com.sprintmanagement.activityservice.dto.ActivityRequest;
import com.sprintmanagement.activityservice.entity.Activity;
import com.sprintmanagement.activityservice.entity.Activity.TargetType;
import com.sprintmanagement.activityservice.service.ActivityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/activities")
@RequiredArgsConstructor
public class ActivityController {

    private final ActivityService activityService;

    // ── Log an activity (called by other services) ────────────────────────────
    @PostMapping
    public ResponseEntity<Activity> log(
            @RequestBody ActivityRequest request,
            Authentication authentication) {

        // Email and userId come from HeaderAuthenticationFilter via SecurityContext
        String userEmail = authentication.getName();
        String userId    = userEmail; // or store separately if needed

        Activity saved = activityService.log(userEmail, userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // ── Get activities by user email ──────────────────────────────────────────
    @GetMapping
    public ResponseEntity<List<Activity>> getByUser(
            @RequestParam(required = false) String userEmail,
            @RequestParam(required = false) TargetType targetType,
            @RequestParam(required = false) String targetId) {

        if (userEmail != null) {
            return ResponseEntity.ok(activityService.getByUser(userEmail));
        }

        if (targetType != null && targetId != null) {
            return ResponseEntity.ok(activityService.getByTarget(targetType, targetId));
        }

        return ResponseEntity.ok(activityService.getAll());
    }
}