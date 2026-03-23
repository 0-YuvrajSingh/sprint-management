# Sprint Management — Codebase Audit
**Date:** March 14, 2026 | **State:** Dirty working tree — 11 modified files, 3 untracked db/ directories, 1 staged file

---

## What Changed Since March 9

Commits since last audit addressed three systemic areas:
- Flyway migration infrastructure (pom.xml + application.yaml + V1 scripts)
- Exception handler gaps (AccessDenied, OptimisticLocking)
- Security fixes (sprint-service Swagger exposure, user-service privilege escalation)

Several fixes introduced **new defects** that must be resolved before merging.

---

## Architecture Overview

```
Browser → API Gateway (8080) → [JWT validation + header injection]
                              ↓
              ┌───────────────┼──────────────────┬──────────────┐
         auth-service    project-service    sprint-service  stories-service
           (8081)           (8082)            (8084)           (8086)
              ↓                                                    ↓
         user-service                               activity-service (8085)
           (8083)                     [receives audit logs — NOT YET CALLED]
              ↑
        eureka-server (8761) — service registry for all 8 services
```

All downstream services authenticate via `common-security` (`HeaderAuthenticationFilter`):
validates `X-Gateway-Secret`, reads `X-User-Email` and `X-User-Role` injected by the gateway.

---

## Formal Code Audit — Per Service Delta

---

```
SERVICE: sprint-service
──────────────────────────────────────────────────
✅ B2   SecurityConfig.java — FIXED: permitAll on Swagger routes removed;
        anyRequest().authenticated() is now the only rule.
        FILE: backend/sprint-service/src/main/java/.../config/SecurityConfig.java

✅ B6   GlobalExceptionHandler — FIXED: AccessDeniedException → 403 added.
        FILE: backend/sprint-service/src/main/java/.../exception/GlobalExceptionHandler.java

✅ B6   GlobalExceptionHandler — FIXED: OptimisticLockingFailureException → 409 added.
        Uses org.springframework.dao.OptimisticLockingFailureException (correct).
        FILE: backend/sprint-service/src/main/java/.../exception/GlobalExceptionHandler.java

✅ B8   Flyway enabled in application.yaml; V1__init.sql present with correct PostgreSQL
        DDL (UUID, TIMESTAMP, proper composite indexes). baseline-version: 0 is correct
        for a fresh database.
        FILE: backend/sprint-service/src/main/resources/db/migration/V1__init.sql

❌ B7   Sprint entity: still missing createdAt and updatedAt fields (V1 migration comment
        acknowledges this and defers to V2 — but V2 does not exist yet).

❌ B9   No ActivityClient — sprint create/update/delete still not logged.

⚠️ B4   PATCH updateSprint(@RequestBody SprintRequest) still missing @Valid.

⚠️ B6   Error shape {status, message, path} unchanged — still inconsistent with
        user-service shape {timestamp, status, error, message, path, fieldErrors}.

⚠️ B11  gateway.secret: ${GATEWAY_SECRET:your-gateway-secret-change-in-production}
        — plaintext fallback unchanged.

⚠️ NEW  application.yaml declares jwt.secret — sprint-service does not use JWT
        (validation is done at the gateway and by HeaderAuthenticationFilter).
        Dead configuration that misleads future maintainers.
        FILE: backend/sprint-service/src/main/resources/application.yaml L58
──────────────────────────────────────────────────
ISSUES: 2 critical   4 warning   7 passing   (was 5/4/3)
```

---

```
SERVICE: user-service
──────────────────────────────────────────────────
✅ B3   PATCH /api/users/{id}/role — FIXED: @PreAuthorize("hasRole('ADMIN')") added.
        Privilege escalation vulnerability closed.
        FILE: backend/user-service/src/main/java/.../controller/UserController.java L66–67

✅ B3   DELETE /api/users/{id} — FIXED: @PreAuthorize("hasRole('ADMIN')") added.
        FILE: backend/user-service/src/main/java/.../controller/UserController.java L74–75

✅ B6   GlobalExceptionHandler — FIXED: OptimisticLockingFailureException → 409 added.
        Also added MethodArgumentTypeMismatchException handler. Error shape is the full
        {timestamp, status, error, message, path, fieldErrors} — gold standard.

✅ B8   pom.xml — FIXED: flyway-core + flyway-database-postgresql added.
        flyway.version: 10.20.1 overrides Spring Boot managed version (correct for PG 18.x).

✅ B3   UserService — Redundant service-layer @PreAuthorize annotations removed.
        Security boundary is now cleanly at the controller layer only.

❌ B8   V1__init.sql uses MySQL syntax — will FAIL on PostgreSQL at startup:
        • DATETIME(6) is MySQL — PostgreSQL requires TIMESTAMP or TIMESTAMPTZ
        • Inline INDEX syntax inside CREATE TABLE is MySQL-only — PostgreSQL requires
          separate CREATE INDEX statements
        FILE: backend/user-service/src/main/resources/db/migration/V1__init.sql L15–19

❌ B8   Table named "user" — reserved keyword in PostgreSQL.
        CREATE TABLE user (...) will throw a syntax error.
        Must be renamed (e.g. "users") or double-quoted in every query/DDL.
        FILE: backend/user-service/src/main/resources/db/migration/V1__init.sql L10

❌ B8   baseline-version: 1 — Flyway will baseline at V1 and mark it as already applied
        on a fresh database, so V1__init.sql NEVER executes. Tables are never created.
        Correct value is 0 (consistent with project-service and sprint-service).
        FILE: backend/user-service/src/main/resources/application.yaml L24

⚠️ B7   User entity: field named createdDate instead of createdAt — naming inconsistency
        with every other entity in the system persists.

⚠️ B7   User entity: missing updatedAt field.

⚠️ B11  gateway.secret: ${GATEWAY_SECRET:your-gateway-secret-change-in-production}
        — plaintext fallback.
──────────────────────────────────────────────────
ISSUES: 3 critical   3 warning   6 passing   (was 3/4/4)
Note: critical count unchanged but nature changed — old B3/B3/B8 replaced by
      3 new B8 migration failures. The old auth holes are fixed; the migration is now broken.
```

---

```
SERVICE: stories-service
──────────────────────────────────────────────────
✅ B3   Service-layer @PreAuthorize redundancy — FIXED: annotations removed from
        StoryService. Security boundary is controller-only.

✅ B8   ddl-auto: update — FIXED: changed to ddl-auto: validate.

✅ B8   Flyway dependency — FIXED: flyway-core + flyway-database-postgresql added.
        flyway.version: 10.21.0.

✅ B8   V1__init.sql — well-formed PostgreSQL DDL. UUID types, TIMESTAMP (not DATETIME),
        FK with ON DELETE CASCADE, composite index on (sprint_id, status). Correct.
        FILE: backend/stories-service/src/main/resources/db/migration/V1__init.sql

❌ NEW  gateway.secret: ${JWT_SECRET:your-gateway-secret-change-in-production}
        — WRONG environment variable. HeaderAuthenticationFilter reads gateway.secret
        to validate X-Gateway-Secret. The gateway injects X-Gateway-Secret from
        GATEWAY_SECRET. If JWT_SECRET ≠ GATEWAY_SECRET (guaranteed in any real deployment),
        ALL requests to stories-service will be rejected with 401/403 at runtime.
        FILE: backend/stories-service/src/main/resources/application.yaml L42

❌ B6   GlobalExceptionHandler missing AccessDeniedException handler
        → role-check failures return 500 instead of 403.

❌ B6   GlobalExceptionHandler missing ObjectOptimisticLockingFailureException handler.

❌ B7   StoryAssignment entity: still missing createdAt and updatedAt fields.

❌ B9   No ActivityClient — story/assignment mutations still not logged.

⚠️ B4   PATCH updateStory(@RequestBody StoryRequest) still missing @Valid.

⚠️ B6   Error shape {status, message, path} — still inconsistent with auth/user-service.
──────────────────────────────────────────────────
ISSUES: 5 critical   2 warning   5 passing   (was 5/4/3)
```

---

```
SERVICE: project-service
──────────────────────────────────────────────────
✅ B8   Flyway dependency — FIXED in prior commit: flyway-core + flyway-database-postgresql
        present in pom.xml.

✅ B8   application.yaml — Flyway enabled, baseline-version: 0 (correct).

✅ B8   V1__init.sql — STAGED (not yet committed). Correct PostgreSQL DDL.
        UUID primary key, UNIQUE on name, no updated_at (consistent with entity).
        FILE: backend/project-service/src/main/resources/db/migration/V1__init.sql

❌ B6   GlobalExceptionHandler missing AccessDeniedException handler — UNCHANGED.

❌ B6   GlobalExceptionHandler missing ObjectOptimisticLockingFailureException handler — UNCHANGED.

❌ B7   Project entity: missing updatedAt field — UNCHANGED.

❌ B9   No ActivityClient — project mutations still not logged — UNCHANGED.

⚠️ B4   PATCH updateProject(@RequestBody ProjectRequest) missing @Valid — UNCHANGED.

⚠️ B6   Error shape {status, message, path} inconsistent — UNCHANGED.

⚠️ B11  gateway.secret: ${GATEWAY_SECRET:your-gateway-secret-change-in-production}
        — plaintext fallback.

⚠️ NEW  application.yaml declares jwt.secret — project-service does not use JWT.
        Dead configuration (same issue as sprint-service).
        FILE: backend/project-service/src/main/resources/application.yaml L55
──────────────────────────────────────────────────
ISSUES: 4 critical   4 warning   5 passing   (was 5/3/4)
```

---

```
SERVICES UNCHANGED FROM MARCH 9 AUDIT:

SERVICE: eureka-server         — 0 critical, 1 warning, 1 passing
SERVICE: api-gateway           — 0 critical, 2 warning, 2 passing
SERVICE: common-security       — 1 critical, 0 warning, 0 passing
SERVICE: auth-service          — 3 critical, 1 warning, 6 passing
SERVICE: activity-service      — 7 critical, 1 warning, 2 passing
Frontend                       — 7 critical, 0 warning, 5 passing

For detailed findings on these services see the March 9, 2026 audit.
```

---

```
╔══════════════════════════════════════════════════════════════════╗
║          SPRINT MANAGEMENT SYSTEM — AUDIT SUMMARY               ║
║                    March 14, 2026                                ║
╠══════════════════════════════════╦═══════════╦═════════╦════════╣
║ Service                          ║ ❌ Critical ║ ⚠️ Warn ║ ✅ Pass ║
╠══════════════════════════════════╬═══════════╬═════════╬════════╣ 
║ eureka-server                    ║     0      ║    1    ║   1    ║
║ api-gateway                      ║     0      ║    2    ║   2    ║
║ common-security                  ║     1      ║    0    ║   0    ║
║ auth-service                     ║     3      ║    1    ║   6    ║
║ project-service                  ║     4      ║    4    ║   5    ║  ← was 5/3/4
║ user-service                     ║     3      ║    3    ║   6    ║  ← was 3/4/4
║ sprint-service                   ║     2      ║    4    ║   7    ║  ← was 5/4/3
║ activity-service                 ║     7      ║    1    ║   2    ║
║ stories-service                  ║     5      ║    2    ║   5    ║  ← was 5/4/3
║ Frontend                         ║     7      ║    0    ║   5    ║
╠══════════════════════════════════╬═══════════╬═════════╬════════╣
║ TOTAL                            ║    32      ║   18    ║  39    ║
║ PREVIOUS (Mar 9)                 ║    36      ║   20    ║  30    ║
║ DELTA                            ║    -4      ║   -2    ║   +9   ║
╚══════════════════════════════════╩═══════════╩═════════╩════════╝

Top systemic issues still open (present in 3+ services):
  ❌ B9   No ActivityClient in project/sprint/stories — activity-service receives zero calls
  ❌ B6   AccessDeniedException unhandled in project/sprint/stories → 500 instead of 403
  ❌ B6   ObjectOptimisticLockingFailureException unhandled in project/stories → 500 instead of 409
  ❌      activity-service: 7 open criticals — entire service needs a hardening pass
  ❌      Frontend: UsersPage.tsx still renders sprint data; types/index.ts still has broken fields
  ⚠️ B11  gateway.secret plaintext fallback in all 5 downstream services
```

---

## New Issues Introduced by This Batch (Must Fix Before Merge)

| # | Service | Issue | Severity |
|---|---|---|---|
| N1 | **user-service** | V1__init.sql: MySQL syntax (`DATETIME(6)`, inline `INDEX`) — migration fails on PostgreSQL | 🔴 Critical |
| N2 | **user-service** | Table named `user` — PostgreSQL reserved keyword — DDL will error | 🔴 Critical |
| N3 | **user-service** | `baseline-version: 1` — V1 migration is skipped on fresh install; tables never created | 🔴 Critical |
| N4 | **stories-service** | `gateway.secret: ${JWT_SECRET:…}` — wrong env var; all requests to stories-service rejected in production | 🔴 Critical |
| N5 | **sprint-service** | `jwt.secret` declared in application.yaml — service doesn't use JWT; dead/confusing config | 🟡 Medium |
| N6 | **project-service** | `jwt.secret` declared in application.yaml — same dead config issue | 🟡 Medium |

---

## Immediate Fix Order

1. **N4 — stories-service `application.yaml`**: Change `${JWT_SECRET:…}` → `${GATEWAY_SECRET:…}` on line 42. Service is currently broken in any environment where JWT_SECRET ≠ GATEWAY_SECRET.
2. **N1/N2/N3 — user-service `V1__init.sql`**: Rewrite using PostgreSQL syntax (`TIMESTAMP`, separate `CREATE INDEX`), rename table to `users`, fix `baseline-version: 0`.
3. **N5/N6 — dead `jwt.secret` config**: Remove from project-service and sprint-service `application.yaml`.
4. **Commit project-service `V1__init.sql`** — it is staged but not committed.
