-- ================================================================
-- user-service — V1__init.sql
-- DB: usersdb
-- Entity: User (id UUID, name, email, role, createdDate)
-- Note: field is named createdDate in entity (not createdAt)
--       column name must match what Hibernate maps to
--       updatedAt missing from entity — NOT added here
-- ================================================================

CREATE TABLE IF NOT EXISTS users (
    id           UUID         NOT NULL PRIMARY KEY,
    name         VARCHAR(50)  NOT NULL,
    email        VARCHAR(255) NOT NULL,
    role         VARCHAR(20)  NOT NULL DEFAULT 'DEVELOPER',
    created_date TIMESTAMP    NOT NULL,

    CONSTRAINT uq_user_email UNIQUE (email)
);

CREATE INDEX IF NOT EXISTS idx_user_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_user_role  ON users (role);
