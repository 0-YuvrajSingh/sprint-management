-- ================================================================
-- user-service — V1__init.sql
-- DB: usersdb
-- Entity: User (id UUID, name, email, role, createdDate)
-- Note: field is named createdDate in entity (not createdAt)
--       column name must match what Hibernate maps to
--       updatedAt missing from entity — NOT added here
-- ================================================================

CREATE TABLE IF NOT EXISTS user (
    id           VARCHAR(36)  NOT NULL PRIMARY KEY,
    name         VARCHAR(255) NOT NULL,
    email        VARCHAR(255) NOT NULL,
    role         VARCHAR(20)  NOT NULL DEFAULT 'VIEWER',
    created_date DATETIME(6)  NOT NULL,

    CONSTRAINT uq_user_email UNIQUE (email),
    INDEX idx_user_email (email),
    INDEX idx_user_role  (role)
);
