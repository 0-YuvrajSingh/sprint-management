-- Ensure auth-service role constraint supports current RBAC roles.
-- This fixes environments that still have legacy role checks.

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'users_role_check'
          AND conrelid = 'users'::regclass
    ) THEN
        ALTER TABLE users DROP CONSTRAINT users_role_check;
    END IF;
END $$;

UPDATE users
SET role = 'VIEWER'
WHERE role NOT IN ('ADMIN', 'MANAGER', 'DEVELOPER', 'VIEWER');

ALTER TABLE users
ADD CONSTRAINT users_role_check
CHECK (role IN ('ADMIN', 'MANAGER', 'DEVELOPER', 'VIEWER'));
