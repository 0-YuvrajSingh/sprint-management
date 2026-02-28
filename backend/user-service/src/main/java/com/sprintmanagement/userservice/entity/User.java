package com.sprintmanagement.userservice.entity;

import jakarta.persistence.*;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false, length = 255)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;

    private Instant createdDate;

    @PrePersist
    public void prePersist() {
        createdDate = Instant.now();
        if(this.role == null) {
            this.role = UserRole.DEVELOPER;
        }
    }

    public UUID getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getPassword() {
        return password;
    }

    public UserRole getRole() {
        return role;
    }

    public Instant getCreatedDate() {
        return createdDate;
    }

    public void setId(UUID id) {
        this.id = id;
    }
    public void setName(String name) {
        this.name = name;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public void setRole(UserRole role) {
        this.role = role;
    }

    public void setCreatedDate(Instant createdDate) {
        this.createdDate = createdDate;
    }
}