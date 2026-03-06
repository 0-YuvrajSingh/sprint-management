package com.sprintmanagement.storiesservice.entity;

import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;

@Entity
@Table(
        name = "story_assignments",
        indexes = {
            @Index(name = "idx_assignment_story", columnList = "storyId"),
            @Index(name = "idx_assignment_user", columnList = "userId")
        }
)
public class StoryAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID storyId;

    @Column(nullable = false)
    private UUID userId;

    @Column(length = 100)
    private String skill;

    private Integer pointsAssigned;

    private Integer pointsCompleted;

    public UUID getId() {
        return id;
    }

    public UUID getStoryId() {
        return storyId;
    }

    public void setStoryId(UUID storyId) {
        this.storyId = storyId;
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public String getSkill() {
        return skill;
    }

    public void setSkill(String skill) {
        this.skill = skill;
    }

    public Integer getPointsAssigned() {
        return pointsAssigned;
    }

    public void setPointsAssigned(Integer pointsAssigned) {
        this.pointsAssigned = pointsAssigned;
    }

    public Integer getPointsCompleted() {
        return pointsCompleted;
    }

    public void setPointsCompleted(Integer pointsCompleted) {
        this.pointsCompleted = pointsCompleted;
    }
}
