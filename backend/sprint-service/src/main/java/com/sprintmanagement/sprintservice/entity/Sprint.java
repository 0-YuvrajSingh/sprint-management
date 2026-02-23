package com.sprintmanagement.sprintservice.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "sprints")
public class Sprint {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false)
    private LocalDateTime startDate;

    @Column(nullable = false)
    private LocalDateTime endDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SprintStatus status;

    private Integer velocity;

    @Column(nullable = false)
    private UUID projectId;

    public UUID getId() { return id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public LocalDateTime getStartDate() { return startDate; }
    public void setStartDate(LocalDateTime startDate) { this.startDate = startDate; }

    public LocalDateTime getEndDate() { return endDate; }
    public void setEndDate(LocalDateTime endDate) { this.endDate = endDate; }

    public SprintStatus getStatus() { return status; }
    public void setStatus(SprintStatus status) { this.status = status; }

    public Integer getVelocity() { return velocity; }
    public void setVelocity(Integer velocity) { this.velocity = velocity; }

    public UUID getProjectId() { return projectId; }
    public void setProjectId(UUID projectId) { this.projectId = projectId; }

    @PrePersist
    void prePersist() {

        if (this.startDate == null) {
            this.startDate = LocalDateTime.now();
        }

        if (this.endDate == null) {
            this.endDate = this.startDate.plusWeeks(2);
        }

        if (this.status == null) {
            this.status = SprintStatus.PLANNED;
        }
    }
}