# Resume-Focused Engineering Audit

Date: March 23, 2026
Scope: Sprint Management full stack (backend microservices + frontend)

---

## 🔴 Backend Audit

### 1) Security Gaps

- **Issue**: stories-service uses the wrong secret source for gateway trust (`JWT_SECRET` instead of `GATEWAY_SECRET`).
- **Why it matters**: In real deployments, this can break all authenticated traffic and signals weak environment contract discipline.
- **Severity**: Critical

- **Issue**: Production secret fallbacks are hardcoded in multiple services.
- **Why it matters**: Signals weak secret hygiene and "dev defaults in prod" risk.
- **Severity**: Major

- **Issue**: Registration flow accepts client-provided role directly in auth-service.
- **Why it matters**: Potential privilege boundary weakness; looks unsafe in a security review.
- **Severity**: Critical

- **Issue**: Gateway security chain is `permitAll` globally and depends on custom filter behavior.
- **Why it matters**: One routing/filter mistake can expose protected endpoints.
- **Severity**: Major

- **Issue**: No visible API abuse controls (rate limiting/throttling) at gateway layer.
- **Why it matters**: Missing production resilience controls for public-facing APIs.
- **Severity**: Major

### 2) Error Handling

- **Issue**: Error response shapes are inconsistent across services.
- **Why it matters**: Frontend error handling becomes brittle and API quality looks ungoverned.
- **Severity**: Major

- **Issue**: auth-service swallows profile-sync failures to user-service and continues.
- **Why it matters**: Creates silent cross-service data divergence.
- **Severity**: Major

- **Issue**: Generic catch-all exception handlers dominate without stable app-level error codes.
- **Why it matters**: Weak observability and poor client recovery behavior.
- **Severity**: Major

### 3) Architecture Quality

- **Issue**: Significant contract drift between services and frontend (auth payloads, pagination, endpoint conventions).
- **Why it matters**: Signals weak integration discipline and no contract testing.
- **Severity**: Critical

- **Issue**: Shared security is thin, while service security configs are mostly duplicated.
- **Why it matters**: Copy-paste architecture increases maintenance risk.
- **Severity**: Major

- **Issue**: activity-service logging architecture is not wired from key mutation paths (project/sprint/story).
- **Why it matters**: Claimed system behavior (audit trail) is not actually delivered.
- **Severity**: Critical

### 4) Database Design

- **Issue**: user-service Flyway baseline version is misconfigured for fresh installs.
- **Why it matters**: Schema bootstrapping reliability is compromised.
- **Severity**: Critical

- **Issue**: Timestamp fields are inconsistent/incomplete across entities (`createdAt` vs `createdDate`, missing `updatedAt`).
- **Why it matters**: Poor schema governance and weaker analytics/audit consistency.
- **Severity**: Major

- **Issue**: Some activity filter queries return unbounded lists while others are paginated.
- **Why it matters**: Predictable scaling behavior is missing.
- **Severity**: Major

### 5) API Design

- **Issue**: Inconsistent versioning and route conventions across services.
- **Why it matters**: Looks fragmented and lowers confidence in API governance.
- **Severity**: Major

- **Issue**: Validation coverage is inconsistent on PATCH endpoints.
- **Why it matters**: Higher risk of partial update data integrity issues.
- **Severity**: Major

### 6) Code Quality Signals

- **Issue**: Dead or misleading config keys remain in services that do not need them.
- **Why it matters**: Increases onboarding friction and operational confusion.
- **Severity**: Minor

- **Issue**: Service-to-service coding standards are inconsistent (error shape, response style, DTO patterns).
- **Why it matters**: Feels like disconnected projects rather than a coherent platform.
- **Severity**: Major

### 7) Missing Production Patterns

- **Issue**: Weak cross-service observability patterns (correlation IDs, consistent structured logs, tracing).
- **Why it matters**: Debugging distributed incidents becomes slow and expensive.
- **Severity**: Major

- **Issue**: No strong resilience policy (retry/circuit-breaker/backoff) on cross-service dependencies.
- **Why it matters**: Outages cascade more easily.
- **Severity**: Major

### 8) Test Coverage

- **Issue**: Tests are mostly context-load smoke tests.
- **Why it matters**: Signals missing confidence in business logic, security rules, and contracts.
- **Severity**: Critical

---

## 🔵 Frontend Audit

### 1) Component Design

- **Issue**: `UsersPage.tsx` appears to be duplicated sprint page logic.
- **Why it matters**: Strong copy-paste signal; looks incomplete and unreviewed.
- **Severity**: Critical

- **Issue**: Page components are monolithic (UI + state + data + forms + styling in one file).
- **Why it matters**: Hard to test, maintain, and scale.
- **Severity**: Major

- **Issue**: Legacy app shell files (`App.tsx`, `Layout.tsx`) conflict with active router architecture.
- **Why it matters**: Indicates half-finished refactor and architectural drift.
- **Severity**: Major

### 2) State Management

- **Issue**: Auth flow mixes localStorage polling, redirects, and interceptor side effects.
- **Why it matters**: Fragile lifecycle and difficult reasoning under edge cases.
- **Severity**: Major

- **Issue**: Query invalidation/state patterns are repetitive and page-scoped, not standardized.
- **Why it matters**: Error-prone behavior as app grows.
- **Severity**: Major

### 3) Performance Red Flags

- **Issue**: No route-level code splitting/lazy loading.
- **Why it matters**: Bundle growth degrades startup performance over time.
- **Severity**: Major

- **Issue**: Heavy inline style objects on large pages.
- **Why it matters**: Weak maintainability and extra render overhead.
- **Severity**: Minor

### 4) API Integration

- **Issue**: Frontend contracts do not consistently match backend responses.
- **Why it matters**: Runtime failures and integration fragility.
- **Severity**: Critical

- **Issue**: Auth register client expects payload semantics that backend does not provide.
- **Why it matters**: User journey fails or behaves unpredictably.
- **Severity**: Critical

### 5) Error UX

- **Issue**: No app-level React error boundary.
- **Why it matters**: Uncaught rendering errors can crash the UI with poor user recovery.
- **Severity**: Major

- **Issue**: Error UX is mostly plain text banners with limited recovery actions.
- **Why it matters**: Production polish is weak.
- **Severity**: Minor

### 6) Accessibility & Semantics

- **Issue**: Icon-only controls lack accessible labels.
- **Why it matters**: Basic accessibility violation; hurts inclusive usability.
- **Severity**: Major

- **Issue**: Accessibility appears secondary across interactive patterns.
- **Why it matters**: Hiring managers increasingly expect baseline a11y competence.
- **Severity**: Major

### 7) Code Quality Signals

- **Issue**: Frontend build currently fails with TypeScript import/type errors.
- **Why it matters**: Immediate red flag; project is not deployment-ready.
- **Severity**: Critical

- **Issue**: Duplicate/conflicting type models exist in multiple files.
- **Why it matters**: Causes drift and contributor confusion.
- **Severity**: Major

- **Issue**: Starter template CSS remains while custom inline style system is used.
- **Why it matters**: Incomplete cleanup and inconsistent styling architecture.
- **Severity**: Minor

### 8) Client Security

- **Issue**: JWT token is stored in localStorage.
- **Why it matters**: Classic XSS token theft risk.
- **Severity**: Critical

- **Issue**: Auth redirects and token handling are implemented in interceptors.
- **Why it matters**: Tight coupling and brittle auth behavior.
- **Severity**: Minor

---

## 🟡 Resume Impact Summary

### Top 5 Blockers

1. Frontend does not compile cleanly.
2. Frontend/backend API contract mismatches in core flows.
3. Critical security/config issues (wrong secret binding, role registration policy, secret fallbacks).
4. Test suite is mostly smoke tests.
5. Evidence of copy-paste/incomplete frontend screens (Users page mismatch).

### What Is Actually Good

1. Microservice decomposition and service boundaries are clear.
2. Role-based authorization is mostly present in controllers.
3. DTO usage and service layer structure exist in most backend services.
4. Flyway and validation direction is present, even though unevenly applied.
5. Frontend stack choices (TypeScript, React Query, Zod, RHF) are strong foundations.

### 2-Day Priority Fix Order (Max Resume Impact)

1. Make frontend build green and remove dead/conflicting shell files.
2. Align API contracts end-to-end (auth response, list pagination, DTO fields).
3. Fix critical security/config faults (stories secret binding, role registration policy, secret defaults).
4. Add real tests for core business/security flows.
5. Standardize error envelopes and add app-level error boundary + accessibility pass.
