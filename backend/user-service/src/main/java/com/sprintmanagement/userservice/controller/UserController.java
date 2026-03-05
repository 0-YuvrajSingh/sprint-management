package com.sprintmanagement.userservice.controller;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sprintmanagement.userservice.dto.ChangeRoleRequest;
import com.sprintmanagement.userservice.dto.UpdateUserRequest;
import com.sprintmanagement.userservice.dto.UserRequest;
import com.sprintmanagement.userservice.dto.UserResponse;
import com.sprintmanagement.userservice.service.UserService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','DEVELOPER','VIEWER')")
    @GetMapping
    public ResponseEntity<Page<UserResponse>> findAll(
            @PageableDefault(size = 20, sort = "createdDate") Pageable pageable) {
        return ResponseEntity.ok(userService.findAll(pageable));
    }

    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','DEVELOPER','VIEWER')")
    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(userService.findById(id));
    }

    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @PostMapping
    public ResponseEntity<UserResponse> createUser(@Valid @RequestBody UserRequest request) {
        UserResponse created = userService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @PatchMapping("/{id}")
    public ResponseEntity<UserResponse> updateUser(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateUserRequest request) {
        return ResponseEntity.ok(userService.updateUser(id, request));
    }

    @PatchMapping("/{id}/role")
    public ResponseEntity<UserResponse> changeRole(
            @PathVariable UUID id,
            @Valid @RequestBody ChangeRoleRequest request) {
        return ResponseEntity.ok(userService.changeRole(id, request.getRole()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable UUID id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
