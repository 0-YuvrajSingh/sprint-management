-- ================================================================
-- activity-service — V1__init.sql
-- DB: activity_db
-- Entity: Activity (id Long, userEmail, actionType, targetType,
--                   targetId, description, timestamp)
-- Note: id is Long (append-only audit log — intentional exception)
--       field is named 'timestamp' in entity (not createdAt)
--       no updatedAt — audit log rows are never updated
-- ================================================================

CREATE TABLE IF NOT EXISTS activity (
    id           BIGINT       NOT NULL GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_email   VARCHAR(255) NOT NULL,
    action_type  VARCHAR(30)  NOT NULL,
    target_type  VARCHAR(30)  NOT NULL,
    target_id    VARCHAR(36)  NOT NULL,
    description  TEXT,
    timestamp    TIMESTAMPTZ  NOT NULL
);

-- Query patterns: by user, by target, by time range
CREATE INDEX IF NOT EXISTS idx_activity_user_email  ON activity (user_email);
CREATE INDEX IF NOT EXISTS idx_activity_target      ON activity (target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_activity_timestamp   ON activity (timestamp);
CREATE INDEX IF NOT EXISTS idx_activity_action_type ON activity (action_type);
