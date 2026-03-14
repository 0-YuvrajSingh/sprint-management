-- ================================================================
-- sprint-service — V1__init.sql
-- DB: sprintdb
-- Entity: Sprint (id UUID, name, startDate, endDate, status,
--                 velocity, projectId, @Version)
-- Note: createdAt + updatedAt missing from entity — NOT added here
--       @Version maps to column 'version' (optimistic locking)
--       Add V2__add_timestamps.sql when entity is updated
-- ================================================================

CREATE TABLE IF NOT EXISTS sprints (
    id          UUID            NOT NULL PRIMARY KEY,
    name        VARCHAR(150)    NOT NULL,
    start_date  TIMESTAMP       NOT NULL,
    end_date    TIMESTAMP       NOT NULL,
    status      VARCHAR(255)    NOT NULL,
    velocity    INTEGER,
    project_id  UUID            NOT NULL,
    version     BIGINT          NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_sprint_project        ON sprints (project_id);
CREATE INDEX IF NOT EXISTS idx_sprint_status         ON sprints (status);
CREATE INDEX IF NOT EXISTS idx_sprint_project_status ON sprints (project_id, status);