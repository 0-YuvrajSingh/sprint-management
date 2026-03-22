# Sprint Management System — Full Architecture & Readiness Analysis

**Analyzed on:** 2026-03-22

## Section 1 — Microservices Architecture

### 1) Service decomposition (domain boundaries)
**Rating: ✅ SOLID**

Services are mostly split by business capability (auth, users, projects, sprints, stories, activity), not by technical layer.

### 2) Service independence / DB isolation
**Rating: ✅ SOLID (with one security caveat)**

Each service points to its own PostgreSQL database (`authdb`, `projectdb`, `usersdb`, `sprintdb`, `storiesdb`, `activity_db`) rather than one shared schema.

### 3) API Gateway usage (routing, auth delegation, rate limiting)
**Rating: ⚠️ NEEDS WORK**

- Routing is correctly centralized in Spring Cloud Gateway.
- JWT validation and identity header propagation are implemented in a global filter.
- **Missing:** explicit gateway rate limiting, retries, circuit breakers, and CORS policy.
- Spring Security at gateway currently permits all exchanges and depends entirely on the custom filter.

### 4) Inter-service communication model
**Rating: ⚠️ NEEDS WORK**

Inter-service communication is synchronous REST (e.g., `auth-service` → `user-service` via `RestTemplate`) with no event bus / async messaging for eventual consistency workflows.

### 5) Service discovery mechanism
**Rating: ✅ SOLID**

Eureka server is present, and gateway routes use `lb://` service IDs.

### 6) Docker Compose one-command startup
**Rating: ❌ CRITICAL**

No `docker-compose.yml` / `compose.yaml` was found in the repository root or service directories, so this does not currently look like one-command full-system startup.

---

## Section 2 — Code Quality

### Naming conventions
- Package and class naming are mostly clean and conventional for Spring Boot.
- Endpoint naming is mostly consistent (`/api/v1/...`) except activity endpoints (`/api/activities`) creating API versioning inconsistency.

### DRY violations across services
- Security and exception-handling patterns are duplicated service-by-service (though `common-security` helps with auth header validation).
- DTO and response error contracts are close but still duplicated rather than centralized.

### Error handling
- Downstream services have `GlobalExceptionHandler` classes (good).
- Gateway returns handcrafted JSON strings for unauthorized responses from filter logic.
- Error model is therefore not fully standardized edge-to-core.

### Null safety
- Good use of Bean Validation (`@Valid`, `@NotNull`) and `Optional` repositories.
- Still relies on header presence and string claims parsing; malformed trusted headers can fail authentication as expected.

### Test coverage per service
- Current tests are primarily `contextLoads()` bootstraps.
- There is no meaningful unit/integration/contract test depth visible for business workflows.

---

## Section 3 — Security Audit

### Findings
1. **Gateway auth model:** JWT is validated at gateway and converted into internal trust headers.
2. **Downstream validation model:** Downstream services validate only `X-Gateway-Secret` + identity headers (not JWT).
3. **Trust boundary risk:** If a service port is reachable directly and the gateway secret leaks/defaults, requests can be spoofed with crafted headers.
4. **Secret hygiene issue:** Several services include weak default secrets in config fallbacks.
5. **CORS:** No explicit CORS configuration found.

### Severity map
- **🔴 HIGH:** Header-based trust with shared static secret and no mTLS/internal network isolation enforcement visible in code.
- **🟡 MED:** Default development secrets in config fallbacks.
- **🟡 MED:** No explicit CORS policy.
- **🔵 LOW:** Gateway security chain permits all and delegates auth exclusively to custom filter (works, but fragile if filter ordering/regression occurs).

---

## Section 4 — Performance

### N+1 query risk
- Low-to-moderate in current model because entities are mostly flat with UUID references rather than heavy JPA relationships.
- Biggest risk is not N+1, but synchronous call chains and missing resilience controls.

### Cross-service call chains
- Typical authenticated request path is: **Client → Gateway → Service** (2 hops after client).
- Registration path adds sync call: **Auth Service → User Service** (extra hop).

### Pagination
- Core list endpoints mostly support `Pageable`.
- Activity filtered endpoints (`userEmail`, `targetType+targetId`) return full `List<>` and can grow unbounded.

### Caching strategy
- No explicit caching (`@Cacheable`, Redis, gateway cache) observed.

### Async inter-service calls
- No async messaging/event-driven workflows observed.
- `registerUser()` performs synchronous profile sync with best-effort logging on failure.

---

## Section 5 — Portfolio Fit (Internship Interviews)

### Does this demonstrate real distributed systems knowledge?
**Answer:** Yes, partially. This is more than “microservices on paper” (gateway + Eureka + per-service DB + shared auth filter are real), but it still lacks production-grade reliability/security controls expected in stronger distributed systems projects.

### Top 3 strongest talking points
1. **End-to-end edge auth flow**: JWT verification at gateway with identity propagation to internal services.
2. **Domain-oriented service split** with independent persistence per service.
3. **Service discovery + API gateway routing** using Eureka + `lb://` routes.

### Top 3 fixes required before sharing with recruiters
1. Add containerized local platform (`docker-compose`) with all services + Postgres instances + one command boot.
2. Harden zero-trust internal security (remove weak defaults, rotate secrets, isolate service network, prefer JWT re-validation or signed service tokens / mTLS).
3. Add resilience + reliability patterns (timeouts/retries/circuit breakers + async events for cross-service consistency).

### 3 optimized resume bullets (quantified)
> Replace placeholder metrics (`X`, `Y`, `Z`) with your measured values before publishing.

- Designed and implemented a **6-service Spring Boot microservices platform** behind **Spring Cloud Gateway + Eureka**, reducing service coupling and enabling independent deployability across domains.
- Built centralized JWT auth at the gateway and propagated identity to downstream services, securing **100% of non-public API routes** with role-based access control.
- Modeled bounded contexts with isolated PostgreSQL databases and paginated APIs, supporting stable query performance under **N+ concurrent users** in local load tests.

### Interview prep

**Q: Why microservices over a monolith for this project?**
- Different bounded contexts (auth, user directory, planning, execution, auditing) evolve at different rates and ownership boundaries.
- Microservices let you isolate data ownership and scale hotspots independently.
- Tradeoff: higher operational complexity (discovery, tracing, failure handling), which your architecture partially addresses.

**Q: How do you handle partial failure?**
- Current state: best-effort sync in auth registration logs failures but does not compensate.
- Improved answer: use timeouts + retries + circuit breakers for synchronous calls and adopt event-driven outbox/Saga patterns for eventual consistency and recovery.

---

## Final Scores & Priority Actions

- **HEALTH SCORE: 6.7 / 10**
- **MICROSERVICES MATURITY SCORE: 7.1 / 10**

### TOP 3 CRITICAL FIXES (ranked)
1. **Internal trust hardening** (remove static-secret-only trust, enforce network isolation/mTLS or signed service tokens).
2. **Operational packaging** (add Docker Compose + environment profiles for true one-command spin-up).
3. **Resilience architecture** (timeouts/retries/circuit breakers + async events for cross-service side effects).

### TOP 3 STRENGTHS
1. Proper domain-based service decomposition with separate databases.
2. Gateway-centered authentication and route orchestration with service discovery.
3. Consistent use of validation and pageable access patterns across major CRUD APIs.

### ONE-LINE RESUME PITCH (<20 words)
Built a gateway-secured, Eureka-discovered Spring microservices platform with isolated PostgreSQL services for end-to-end sprint management.
