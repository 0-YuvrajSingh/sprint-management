-- ================================================================
-- project-service — V1__init.sql
-- DB: projectdb  (PostgreSQL)
-- Entity: Project (id UUID, name, description, createdAt)
-- ================================================================

CREATE TABLE IF NOT EXISTS projects (
    id          UUID         NOT NULL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    created_at  TIMESTAMP    NOT NULL,

    CONSTRAINT uq_projects_name UNIQUE (name)
);