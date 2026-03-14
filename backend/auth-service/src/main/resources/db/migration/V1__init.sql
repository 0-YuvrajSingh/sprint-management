-- ================================================================
-- auth-service — V1__init.sql
-- DB: authdb
-- Entity: User (id Long, email, password, role)
-- Note: auth-service uses Long id (legacy — not UUID like other services)
-- ================================================================

CREATE TABLE IF NOT EXISTS users (
    id       BIGINT       GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email    VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role     VARCHAR(20)  NOT NULL DEFAULT 'VIEWER',

    CONSTRAINT uq_auth_user_email UNIQUE (email)
);
