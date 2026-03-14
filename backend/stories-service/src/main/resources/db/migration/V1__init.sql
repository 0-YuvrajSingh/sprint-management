-- ================================================================
-- stories-service — V1__init.sql
-- DB: storiesdb
-- Entities: Story (@Table name="stories") + StoryAssignment (@Table name="story_assignments")
-- ================================================================

CREATE TABLE IF NOT EXISTS stories (
    id             UUID         NOT NULL PRIMARY KEY,
    title          VARCHAR(200) NOT NULL,
    description    TEXT,
    status         VARCHAR(20)  NOT NULL DEFAULT 'BACKLOG',
    priority       VARCHAR(20)  NOT NULL DEFAULT 'MEDIUM',
    story_points   INT,
    project_id     UUID         NOT NULL,
    sprint_id      UUID,
    assignee_email VARCHAR(255),
    created_at     TIMESTAMP    NOT NULL,
    updated_at     TIMESTAMP
);

-- Indexes for stories
CREATE INDEX IF NOT EXISTS idx_story_sprint_id     ON stories (sprint_id);
CREATE INDEX IF NOT EXISTS idx_story_project_id    ON stories (project_id);
CREATE INDEX IF NOT EXISTS idx_story_status        ON stories (status);
CREATE INDEX IF NOT EXISTS idx_story_priority      ON stories (priority);
CREATE INDEX IF NOT EXISTS idx_story_sprint_status ON stories (sprint_id, status);

CREATE TABLE IF NOT EXISTS story_assignments (
    id                UUID         NOT NULL PRIMARY KEY,
    story_id          UUID         NOT NULL,
    user_id           UUID         NOT NULL,
    skill             VARCHAR(100),
    points_assigned   INT          NOT NULL DEFAULT 0,
    points_completed  INT          NOT NULL DEFAULT 0,

    CONSTRAINT uq_assignment_story_user UNIQUE (story_id, user_id),

    CONSTRAINT fk_assignment_story
        FOREIGN KEY (story_id) REFERENCES stories(id)
        ON DELETE CASCADE
);

-- Indexes for story_assignments
CREATE INDEX IF NOT EXISTS idx_assignment_story_id ON story_assignments (story_id);
CREATE INDEX IF NOT EXISTS idx_assignment_user_id  ON story_assignments (user_id);
