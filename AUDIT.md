# Sprint Management — Codebase Audit
**Date:** March 9, 2026 | **State:** Clean working tree (matches last git commit)

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

## Service Inventory

### 1. eureka-server — Port 8761
- Spring Cloud Netflix `@EnableEurekaServer`
- No DB. Pure service registry.
- `register-with-eureka: false`, `fetch-registry: false`

### 2. api-gateway — Port 8080
- Spring Cloud Gateway (WebFlux/reactive)
- `JwtGatewayFilter` (GlobalFilter, Order -1):
  - Public paths: `/auth/login`, `/auth/register` — pass through without token check
  - All others: validates HS256 JWT (`jwt.secret` env var) → extracts `sub` (email) + `role` claim
    → adds `X-User-Email`, `X-User-Role`, `X-Gateway-Secret` headers → strips `Authorization`
- Routes (`lb://` via Eureka):

| Incoming path | Rewrites to | Target service |
|---|---|---|
| `/auth/login` | `/api/v1/auth/login` | auth-service |
| `/auth/register` | `/api/v1/auth/register` | auth-service |
| `/api/projects/**` | `/api/v1/projects/**` | project-service |
| `/api/sprints/**` | `/api/v1/sprints/**` | sprint-service |
| `/api/stories/**` | `/api/v1/stories/**` | stories-service |
| `/api/users/**` | `/api/v1/users/**` | user-service |
| `/api/activities/**` | `/api/activities/**` | activity-service |

### 3. auth-service — Port 8081, DB: `authdb`
- JJWT 0.11.5, BCrypt passwords, Lombok
- `User` entity: `id (Long)`, `email` (unique), `password`, `role`
- `Role` enum: `ADMIN | MANAGER | DEVELOPER | VIEWER`
- `AuthService.registerUser()` → saves user + syncs profile to user-service via LoadBalanced `RestTemplate`
- `JwtService.generateToken()` → HS256, subject=email, claim `role`=role, expiry 24h
- **Controller:** `POST /api/v1/auth/register`, `POST /api/v1/auth/login`
- Has its own `JwtAuthenticationFilter` for self-protection; not involved in downstream auth

### 4. user-service — Port 8083, DB: `usersdb`
- `User` entity: `id (UUID)`, `name`, `email` (unique), `role`, `createdDate`
- `UserRole` enum: `ADMIN | MANAGER | DEVELOPER | VIEWER`
- `ddl-auto: validate` — **no Flyway migrations present → DB schema must be created manually**
- `UserService`: CRUD + role-change + delete with `@PreAuthorize` guards
- **Controller:**
  - `GET  /api/users`         — all roles
  - `POST /api/users`         — ADMIN/MANAGER
  - `PATCH /api/users/{id}`   — ADMIN/MANAGER
  - `PATCH /api/users/{id}/role`
  - `DELETE /api/users/{id}`  — ADMIN only

### 5. project-service — Port 8082, DB: `projectdb`
- `Project` entity: `id (UUID)`, `name`, `description`, `createdAt`
- `ddl-auto: validate` — **no Flyway migrations present**
- **No `ActivityClient`** — create/update/delete are NOT audited
- **Controller:**
  - `GET    /api/v1/projects`       — all roles
  - `GET    /api/v1/projects/{id}`  — all roles
  - `POST   /api/v1/projects`       — ADMIN/MANAGER
  - `PATCH  /api/v1/projects/{id}`  — ADMIN/MANAGER
  - `DELETE /api/v1/projects/{id}`  — ADMIN only

### 6. sprint-service — Port 8084, DB: `sprintdb`
- `Sprint` entity: `id (UUID)`, `name`, `startDate`, `endDate`, `status`, `velocity`, `projectId`
- `@Version` field for optimistic locking
- `SprintStatus` enum: `PLANNED | ACTIVE | COMPLETED | CANCELLED`
- `ddl-auto: validate` — **no Flyway migrations present**
- `PrePersist` validates `endDate > startDate`
- **No `ActivityClient`** — mutations NOT audited
- Flexible filtering: by `projectId`, `status`, or both
- **Controller:**
  - `GET    /api/v1/sprints`       — query params: `projectId`, `status`, pageable
  - `GET    /api/v1/sprints/{id}`
  - `POST   /api/v1/sprints`       — ADMIN/MANAGER
  - `PATCH  /api/v1/sprints/{id}`
  - `DELETE /api/v1/sprints/{id}`  — ADMIN only

### 7. stories-service — Port 8086, DB: `storiesdb`
- `Story` entity: `id (UUID)`, `title`, `description`, `status`, `priority`, `storyPoints`,
  `projectId`, `sprintId`, `assigneeEmail`, `createdAt`, `updatedAt`
- `StoryStatus`: `BACKLOG | IN_PROGRESS | IN_REVIEW | DONE`
- `StoryPriority`: `LOW | MEDIUM | HIGH | CRITICAL`
- `StoryAssignment` entity: `id (UUID)`, `storyId`, `userId`, `skill`, `pointsAssigned`, `pointsCompleted`
- `ddl-auto: update` — **⚠ auto-DDL active in production, not safe**
- **No `ActivityClient`** — mutations NOT audited
- Has TestContainers in pom but no test implementations
- **Controllers:**
  - `StoryController`: standard CRUD on `/api/v1/stories`
  - `StoryAssignmentController`:
    - `GET  /api/v1/stories/{id}/assignments`
    - `POST /api/v1/stories/{id}/assignments`
    - `PATCH /api/v1/stories/{id}/progress`

### 8. activity-service — Port 8085, DB: `activity_db`
- `Activity` entity: `id (Long)`, `userEmail`, `actionType`, `targetType`, `targetId`,
  `description`, `timestamp`
- `ActionType`: `CREATED | UPDATED | DELETED | STATUS_CHANGED | ASSIGNED | COMMENTED`
- `TargetType`: `PROJECT | SPRINT | STORY | ASSIGNMENT | COMMENT`
- Fully functional audit log API — **but nothing calls it**
- `ActivityRequest` DTO (Lombok): `actionType`, `targetType`, `targetId`, `description`
- **Controller:**
  - `POST /api/activities`                            — log an action
  - `GET  /api/activities?userEmail=X`               — get by user
  - `GET  /api/activities?targetType=X&targetId=Y`   — get by target
  - `GET  /api/activities`                            — paginated full list

### 9. common-security (shared library)
- `HeaderAuthenticationFilter`: validates constant-time `X-Gateway-Secret`,
  reads `X-User-Email`/`X-User-Role`, builds `SecurityContext`
- Used by: user, project, sprint, stories, activity services
- **Note:** Uses `spring-boot-starter-parent:3.2.0` — other services use `3.3.5` (minor mismatch)

---

## Frontend

### Stack
React 19 + TypeScript + Vite.
`react-router-dom` is in `package.json` but **not used** — a custom router is implemented in `router.tsx`.
No CSS framework (raw CSS classes).

### Pages

| Route | Component |
|---|---|
| `/` | → redirect to `/projects` |
| `/projects` | `ProjectsPage` |
| `/sprints` | `SprintsPage` |
| `/users` | `UsersPage` |

### API Layer

**`client.ts` base URLs — WRONG (bypass gateway entirely):**
```typescript
projects: "http://localhost:8081/api/v1"  // ← hits auth-service (wrong service!)
sprints:  "http://localhost:8082/api/v1"  // ← hits project-service (wrong service!)
users:    "http://localhost:8083/api/v1"  // ← correct port, but bypasses gateway (no JWT sent)
```
Correct target for all three should be `http://localhost:8080` (gateway).

**`types.ts` mismatches vs backend:**

| Frontend type | Frontend value | Actual backend value |
|---|---|---|
| `Project.ownerId` | `string` | Field does not exist in entity |
| `CreateProjectRequest.ownerId` | sent in body | Not accepted by backend |
| `UserRole` | `"PRODUCT_OWNER" \| "SCRUM_MASTER"` | `"MANAGER" \| "VIEWER"` |
| `Sprint.goal` | `string` | Field does not exist in entity |
| `SprintStatus` | missing `"CANCELLED"` | Backend has `CANCELLED` |
| Auth types | none | `LoginRequest`, `RegisterRequest`, `AuthResponse` missing |

**No authentication in frontend:**
- No login page
- No JWT token storage
- No `Authorization: Bearer` header on any request

---

## Gap Analysis

| # | Area | Issue | Severity |
|---|---|---|---|
| 1 | **Audit / Activity** | `project-service`, `sprint-service`, `stories-service` have no `ActivityClient` — zero mutations are ever audited despite activity-service being fully built | 🔴 Critical |
| 2 | **Frontend routing** | `client.ts` uses wrong ports — all API calls bypass the gateway | 🔴 Critical |
| 3 | **Frontend auth** | No login page, no JWT storage, no `Authorization` header sent on any request | 🔴 Critical |
| 4 | **Frontend types** | `UserRole`, `ownerId`, `goal`, `SprintStatus` all mismatch backend | 🔴 Critical |
| 5 | **Database schema** | `ddl-auto: validate` on 4 services with no Flyway migrations — services will fail to start against a fresh DB | 🔴 Critical |
| 6 | **stories-service** | `ddl-auto: update` in production — schema auto-modified on every startup | 🟠 High |
| 7 | **Optimistic locking** | `GlobalExceptionHandler` in sprint-service does not handle `ObjectOptimisticLockingFailureException` — concurrent updates throw 500 instead of 409 | 🟡 Medium |
| 8 | **Sprint entity** | No `goal` field despite frontend already sending it | 🟡 Medium |
| 9 | **Activity orphaned** | activity-service is completely built but receives no calls | 🟡 Medium |
| 10 | **No containerisation** | No Dockerfiles, no `docker-compose.yml`, no `.env.example` | 🟡 Medium |
| 11 | **No tests** | Zero unit or integration tests across all backend services | 🟡 Medium |
| 12 | **Route prefix inconsistency** | Gateway rewrites `/auth/**` → `/api/v1/auth/**` but `/api/activities/**` → `/api/activities/**` (no `/v1`); inconsistent pathing | 🟢 Low |
| 13 | **common-security version** | `spring-boot-starter-parent:3.2.0` while all services use `3.3.5` | 🟢 Low |

---

## What Works Today (As-Built)

| Component | Status |
|---|---|
| Eureka service registration/discovery | ✅ |
| JWT issuance (auth-service) | ✅ |
| JWT validation + header injection (gateway) | ✅ |
| HeaderAuthenticationFilter (common-security) | ✅ |
| User CRUD with role-based access | ✅ |
| Project CRUD | ✅ (no audit) |
| Sprint CRUD with optimistic locking | ✅ (no audit) |
| Story + Assignment CRUD | ✅ (no audit) |
| Activity-service API | ✅ (receives nothing) |
| Frontend renders 3 pages | ✅ (wrong ports, no auth) |

---

## Recommended Fix Order

1. **Add `ActivityClient` + `RestTemplateConfig` to project, sprint, stories services** — wire into all mutating service methods
2. **Fix `client.ts`** — all base URLs → `http://localhost:8080` (gateway), add `Authorization` header injection
3. **Add login page + JWT storage to frontend**
4. **Fix `types.ts`** — align `UserRole`, remove `ownerId`, add `CANCELLED`, add auth types
5. **Add Flyway V1 migrations** to all 6 DB services
6. **Change `stories-service` `ddl-auto`** from `update` to `validate`
7. **Add `ObjectOptimisticLockingFailureException` handler** to sprint-service `GlobalExceptionHandler`
8. **Add `goal` field to Sprint entity/DTO/service** if needed
