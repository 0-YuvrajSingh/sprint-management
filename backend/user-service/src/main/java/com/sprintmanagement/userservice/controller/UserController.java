package com.sprintmanagement.userservice.controller;

import com.sprintmanagement.userservice.dto.ChangeRoleRequest;
import com.sprintmanagement.userservice.dto.UpdateUserRequest;
import com.sprintmanagement.userservice.dto.UserRequest;
import com.sprintmanagement.userservice.dto.UserResponse;
import com.sprintmanagement.userservice.service.UserService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public Page<UserResponse> findAll(Pageable pageable) {
        return userService.findAll(pageable);
    }

    @GetMapping("/{id}")
    public UserResponse findById(@PathVariable UUID id) {
        return userService.findById(id);
    }

    @PostMapping
    public UserResponse createUser(@Valid @RequestBody UserRequest userRequest) {
        return userService.createUser(userRequest);
    }

    @PatchMapping("/{id}")
    public UserResponse updateUser(@PathVariable UUID id, @Valid @RequestBody UpdateUserRequest updateUserRequest) {
        return userService.updateUser(id, updateUserRequest);
    }

    @PatchMapping("/{id}/role")
    public UserResponse changeRole(@PathVariable UUID id, @Valid @RequestBody ChangeRoleRequest changeRoleRequest) {
        return userService.changeRole(id, changeRoleRequest.getRole());
    }

    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable UUID id) {
        userService.deleteUser(id);
    }
}
