# PortsPilot — Backend Implementation Plan

## Top-Level Overview

**Goal**: Build a production-ready REST API backend for the PortsPilot application that replaces the existing frontend-only mock data layer (`mockData.ts`, `portOperationsService.ts`) with a real server, persistent database, and authenticated endpoints.

**Scope**:
- Node.js + Express (TypeScript) REST API server
- PostgreSQL database with Prisma ORM
- JWT-based authentication supporting demo login and Google OAuth
- Role-based access control (admin vs. ship-agent)
- All data entities: Vessels, Berths, Cranes, Yard Blocks, Forecasts, Optimization Results, Simulation Results, Route Options, Shift Plans, Alerts, Berth Requests, Shipping Documents
- AI Copilot endpoint proxying Google Gemini (keeping API key server-side)
- WebSocket channel for real-time updates to the frontend
- File upload endpoint for shipping documents
- Database seeding matching the existing mock data shapes

**Non-Goals**:
- Mobile application
- Payment processing
- Hardware sensor integration (data ingested as-is)
- Complete ML/OR-Tools engine rewrite (ML outputs stored as structured data, engine can be plugged in later)
- Frontend code changes (backend surfaces the same data shapes the frontend already expects)

**Frontend-Backend Contract**: Every API response matches the TypeScript interfaces defined in [`types/operations.ts`](frontend/src/types/operations.ts) and [`types/auth.ts`](frontend/src/types/auth.ts) so no frontend changes are required.

---

## Architecture Diagram (Text)

```
Browser (React SPA)
      │
      │  HTTPS REST + WebSocket (ws://)
      ▼
┌─────────────────────────────────────────┐
│          Express API Server              │
│  /api/auth        Auth Router            │
│  /api/operations  Admin Router           │
│  /api/agent       Ship-Agent Router      │
│  /api/copilot     Copilot Proxy Router   │
│  /api/uploads     File Upload Router     │
│  WebSocket Hub    Real-time Events       │
└────────────┬────────────────────────────┘
             │
    ┌─────────────────┐     ┌──────────────────┐
    │  PostgreSQL DB   │     │  Google Gemini   │
    │  (via Prisma)    │     │  AI API          │
    └─────────────────┘     └──────────────────┘
```

---

## Sub-Tasks

---

### Sub-Task 1 — Project Scaffolding & Configuration

**Status**: `[x] done`

**Intent**:
Set up the backend directory structure, TypeScript project, package dependencies, and environment variable configuration. This is the foundation for all subsequent sub-tasks.

**Expected Outcomes**:
- `backend/` directory exists with `src/`, `prisma/`, and config files
- TypeScript compiles without errors (`tsc --noEmit`)
- `npm run dev` starts the server on port 3001 with hot-reload
- `.env.example` documents every required variable

**Todo List**:
1. Create `backend/` directory at repo root alongside `frontend/`
2. Initialize `package.json` (`npm init -y`)
3. Install runtime dependencies: `express`, `cors`, `helmet`, `dotenv`, `jsonwebtoken`, `bcryptjs`, `prisma`, `@prisma/client`, `ws`, `multer`, `google-auth-library`, `uuid`, `zod`
4. Install dev dependencies: `typescript`, `ts-node`, `nodemon`, `@types/express`, `@types/jsonwebtoken`, `@types/multer`, `@types/ws`, `@types/node`
5. Create `tsconfig.json` (target ES2021, moduleResolution Node, strict mode)
6. Create `src/index.ts` entry point (Express app bootstrap, listen on PORT from env)
7. Create `.env.example` with all variables: `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `GEMINI_API_KEY`, `GOOGLE_CLIENT_ID`, `PORT`, `ALLOWED_ORIGINS`, `UPLOAD_DIR`
8. Create `nodemon.json` for hot-reload during development
9. Add `scripts` to `package.json`: `dev`, `build`, `start`, `db:migrate`, `db:seed`

**Relevant Context**:
- Current frontend lives in `frontend/` — backend sits in a sibling `backend/` directory
- Frontend expects API at `/api/*` prefix (to be proxied via Vite dev proxy or Nginx in production)
- [`frontend/vite.config.ts`](frontend/vite.config.ts) — add proxy config `{ '/api': 'http://localhost:3001' }` here

---

### Sub-Task 2 — Database Schema (Prisma)

**Status**: `[x] done`

**Intent**:
Define the full relational database schema mapping every TypeScript interface in the frontend to a Prisma model. This drives all migrations and typed DB access.

**Expected Outcomes**:
- `prisma/schema.prisma` covers all entities
- `npx prisma migrate dev` runs without errors and creates all tables
- Prisma Client types match the frontend TypeScript interfaces

**Todo List**:
1. Initialize Prisma (`npx prisma init`)
2. Define `User` model: `id`, `name`, `email`, `photoUrl`, `role` (enum: ADMIN, SHIP_AGENT), `authProvider` (enum: DEMO, GOOGLE), `createdAt`
3. Define `Vessel` model: all fields from [`Vessel` interface](frontend/src/types/operations.ts) — `id`, `name`, `imo`, `flag`, `lengthMeters`, `draughtMeters`, `teuCapacity`, `cargoVolume`, `origin`, `destination`, `eta`, `etd`, `status` (enum), `priority` (enum), `currentBerth`, `assignedBerth`, `predictedWaitHours`, `demurrageRisk`, `historicalTurnaroundHours`, `ownerId` (FK → User), `shippingCompany`, `callSign`, `vesselType`, `voyageNumber`, `cargoType`, `cargoQuantity`, `containersLoaded`, `containersTotal`, `dangerousGoods`, `specialNotes`, `requestedBerth`, `requestedArrivalTime`, `berthDurationHours`, `requestedCranes`
4. Define `VesselTimelineEvent` model: `id`, `vesselId` (FK), `timestamp`, `event`
5. Define `Berth` model: `id`, `name`, `lengthMeters`, `depthMeters`, `maxDraftMeters`, `status` (enum), `currentUtilization`, `predictedUtilization`, `queueCount`, `availableCranes`, `maxCranes`, `currentVesselId`, `nextVesselId`, `riskLevel`
6. Define `BerthHourlyForecast` model: `id`, `berthId` (FK), `hour`, `utilization`
7. Define `Crane` model: `id`, `name`, `type` (enum: STS, YARD, MOBILE), `status` (enum: ACTIVE, IDLE, MAINTENANCE, FAILED), `berthId`, `movesPerHour`, `utilizationPercent`, `failureDurationHours`, `impactSeverity`, `assignedVesselId`, `lastMaintenance`, `nextMaintenance`
8. Define `BerthCraneAssignment` junction table: `berthId`, `craneId`
9. Define `YardBlock` model: `id`, `name`, `category` (enum), `totalTeu`, `occupiedTeu`, `utilizationPercent`, `dwellTimeDays`, `inboundTeu24h`, `outboundTeu24h`, `congestionRisk`, `suggestedRedistribution`
10. Define `CongestionForecast` model: `id`, `timeHorizon`, `overallCongestionPercent`, `riskBottleneckBerth`, `bottleneckConfidence`, `createdAt`
11. Define `ForecastDriver` model: `id`, `forecastId` (FK), `factor`, `percentage`, `impact`, `detail`
12. Define `ForecastPoint` model: `id`, `forecastId` (FK), `name`, `threshold`, berth columns as JSON
13. Define `OptimizationResult` model: `id`, `timestamp`, `isApplied`, `targetVesselId`, `currentPlan` (JSON), `optimizedPlan` (JSON), `waitTimeDeltaHours`, `waitTimeReductionPercent`, `queueReductionCount`, `savingsEstimateUsd`, `rationale`
14. Define `SimulationResult` model: `id`, `scenario` (JSON), `before` (JSON), `after` (JSON), `recoveryPlan` (JSON)
15. Define `RouteOption` model: `id`, `portCode`, `portName`, `country`, `distanceNm`, `eta`, `delayHours`, `extraCostUsd`, `riskLevel`, `isRecommended`, `congestionScore`, `rationale`, `coordinates` (JSON)
16. Define `ShiftPlanItem` model: `id`, `dayOffset`, `shift`, `berthId`, `vesselId`, `vesselName`, `assignedCranes` (JSON), `status`, `conflictReason`
17. Define `OperationalAlert` model: `id`, `timestamp`, `severity` (enum), `title`, `description`, `relatedEntity` (JSON), `isResolved`, `actionRoute`, `actionLabel`
18. Define `BerthRequest` model: `id`, `vesselId`, `vesselName`, `imo`, `requestedBerth`, `requestedArrivalTime`, `estimatedDurationHours`, `requestedCranes`, `cargoType`, `status` (enum), `submittedAt`, `reviewedAt`, `assignedBerth`, `notes`, `ownerId` (FK → User)
19. Define `ShippingDocument` model: `id`, `name`, `vesselId`, `vesselName`, `type`, `status`, `uploadedDate`, `fileSize`, `fileUrl`, `ownerId` (FK → User)
20. Run `npx prisma migrate dev --name init`

**Relevant Context**:
- All interface shapes are in [`frontend/src/types/operations.ts`](frontend/src/types/operations.ts) and [`frontend/src/types/auth.ts`](frontend/src/types/auth.ts)
- JSON columns (plan details, coordinates) use Prisma `Json` type for schema flexibility
- Enums must match exactly the union type strings used in the frontend (e.g. `'Arriving' | 'At Anchor' | 'Berthing' | 'Loading' | 'Delayed' | 'Completed'`)

---

### Sub-Task 3 — Database Seeding

**Status**: `[x] done`

**Intent**:
Populate the database with the exact same initial data that the frontend currently uses from `mockData.ts`. This allows the backend to replace the mock layer without any visible change to the demo experience.

**Expected Outcomes**:
- `npm run db:seed` inserts all 8 vessels, 6 berths, 8 cranes, 4 yard blocks, forecast, optimization, simulation, 3 routes, 15 shift plan items, 4 alerts, 3 berth requests, 4 shipping documents
- Two demo users seeded: `DEMO_ADMIN` (role: ADMIN) and `DEMO_AGENT` (role: SHIP_AGENT)
- Running seed twice is idempotent (upsert pattern)

**Todo List**:
1. Create `prisma/seed.ts`
2. Seed `User` table: `demo-admin` (admin) and `demo-agent` (ship-agent) with known IDs matching the frontend's `DEMO_ADMIN` / `DEMO_AGENT` constants in [`authService.ts`](frontend/src/services/authService.ts)
3. Seed all 8 vessels from [`initialVessels`](frontend/src/services/mockData.ts) with their timeline events
4. Seed all 6 berths with their hourly forecast points
5. Seed all 8 cranes and their berth assignments
6. Seed all 4 yard blocks
7. Seed forecast data (drivers + points)
8. Seed optimization result, simulation result
9. Seed 3 route options
10. Seed 15 shift plan items
11. Seed 4 operational alerts
12. Seed 3 berth requests
13. Seed 4 shipping documents
14. Add `prisma.seed` script reference to `package.json`

**Relevant Context**:
- Full mock data is in [`frontend/src/services/mockData.ts`](frontend/src/services/mockData.ts)
- Seeded vessel `VES-01` (Ocean Star) has `ownerId = 'demo-agent-001'` — this must match the seeded demo agent user's `id`
- Document `DOC-01`–`DOC-04` are linked to `ownerId = 'demo-agent-001'`

---

### Sub-Task 4 — Authentication API

**Status**: `[x] done`

**Intent**:
Implement the authentication layer: demo login, Google OAuth token verification, JWT issuance, and session validation. This replaces the localStorage-only auth in [`authService.ts`](frontend/src/services/authService.ts) and [`AuthContext.tsx`](frontend/src/context/AuthContext.tsx).

**Expected Outcomes**:
- `POST /api/auth/login-demo` returns JWT for admin or agent demo user
- `POST /api/auth/google` accepts Google ID token, verifies it, upserts user, returns JWT
- `GET /api/auth/me` returns current user profile from JWT
- `POST /api/auth/logout` invalidates session (blacklist or client-side only)
- `POST /api/auth/role` allows updating a newly registered Google user's role (used by RoleSelector)
- All subsequent protected routes verify the JWT via middleware

**Todo List**:
1. Create `src/middleware/authenticate.ts` — JWT verification middleware, attaches `req.user` (id, email, role)
2. Create `src/routes/auth.ts` router
3. Implement `POST /api/auth/login-demo`: accept `{ role: 'admin' | 'ship-agent' }`, look up seeded demo user, sign JWT, return `{ token, user }`
4. Implement `POST /api/auth/google`: accept `{ idToken }`, verify with `google-auth-library` `OAuth2Client`, upsert User record, if first-time Google user set role to `null` (pending RoleSelector), sign JWT
5. Implement `POST /api/auth/role`: accept `{ role }`, require auth middleware, update `user.role` in DB, return updated user
6. Implement `GET /api/auth/me`: require auth middleware, return current user from DB
7. Implement `POST /api/auth/logout`: client-side JWT discard is sufficient; optionally maintain a token blocklist in DB or Redis
8. Create `src/middleware/requireRole.ts` — factory middleware e.g. `requireRole('admin')` returns 403 if role mismatch
9. Add Zod validation schemas for all auth request bodies
10. Write unit tests for JWT sign/verify and demo login flow

**Relevant Context**:
- Current auth logic: [`frontend/src/services/authService.ts`](frontend/src/services/authService.ts) (demo constants `DEMO_ADMIN`, `DEMO_AGENT`), [`frontend/src/context/AuthContext.tsx`](frontend/src/context/AuthContext.tsx)
- Google client ID used in frontend: stored in `VITE_GOOGLE_CLIENT_ID` env var
- `RoleSelector` component triggers when `user.role === null` after Google sign-in: [`frontend/src/components/auth/RoleSelector.tsx`](frontend/src/components/auth/RoleSelector.tsx)
- `RoleProtectedRoute` checks role for admin-only pages: [`frontend/src/components/auth/RoleProtectedRoute.tsx`](frontend/src/components/auth/RoleProtectedRoute.tsx)

---

### Sub-Task 5 — Port Operations API (Admin Read Endpoints)

**Status**: `[ ] pending`

**Intent**:
Expose all read-only operational data endpoints for the Port Admin portal. These replace `portOperationsService.ts` getters and feed every admin page.

**Expected Outcomes**:
- All 11 admin pages can fetch live data from the API instead of mock imports
- Response shapes exactly match the TypeScript interfaces in `types/operations.ts`
- All endpoints require `authenticate` + `requireRole('admin')` middleware

**Todo List**:
1. Create `src/routes/operations.ts` router (mount at `/api/operations`)
2. Create `src/services/operationsService.ts` (DB query layer using Prisma client)
3. Implement `GET /api/operations/port-status`:
   - Aggregate: vessel count, berth utilization (avg), crane availability count, yard utilization (avg), queue total, predicted congestion level (from latest forecast), high-risk berth name
   - Returns `PortStatus` shape consumed by `DashboardPage`
4. Implement `GET /api/operations/vessels` with optional query params `?search=&status=&priority=` — returns `Vessel[]`
5. Implement `GET /api/operations/vessels/:id` — returns single `Vessel` with nested `timelineEvents[]`
6. Implement `GET /api/operations/berths` — returns `Berth[]` with nested `hourlyForecast[]` and `assignedCraneIds[]`
7. Implement `GET /api/operations/berths/:id`
8. Implement `GET /api/operations/cranes` — returns `Crane[]`
9. Implement `GET /api/operations/cranes/:id`
10. Implement `GET /api/operations/yard-blocks` — returns `YardBlock[]`
11. Implement `GET /api/operations/forecast` — returns latest `CongestionForecastData` with nested `drivers[]` and `points[]`
12. Implement `GET /api/operations/optimization` — returns latest `OptimizationResult`
13. Implement `GET /api/operations/simulation` — returns latest `SimulationResult`
14. Implement `GET /api/operations/routes` — returns `RouteOption[]`
15. Implement `GET /api/operations/shift-plans` — returns `ShiftPlanItem[]`
16. Implement `GET /api/operations/alerts` — returns `OperationalAlert[]` (unresolved first)
17. Implement `GET /api/operations/berth-requests` — returns all `BerthRequest[]` (admin sees all)
18. Add Zod request validation for all query params

**Relevant Context**:
- Current data flow: `portOperationsService.ts` → `OperationsContext` → pages
- Target data flow: `GET /api/operations/*` → `OperationsContext` (replace mock imports with `fetch` calls)
- Nested relation example: `Vessel.timelineEvents` must be included via Prisma `include: { timelineEvents: true }`
- `DashboardPage` calls `getPortStatus()`: [`frontend/src/pages/DashboardPage.tsx`](frontend/src/pages/DashboardPage.tsx)
- `VesselsPage` shows search + filter: [`frontend/src/pages/VesselsPage.tsx`](frontend/src/pages/VesselsPage.tsx)

---

### Sub-Task 6 — Port Operations API (Admin Mutation Endpoints)

**Status**: `[ ] pending`

**Intent**:
Implement all state-changing admin operations: applying optimization, running simulation, applying recovery plan, resolving alerts, and reassigning vessels/berths. These correspond to OperationsContext action methods.

**Expected Outcomes**:
- Optimizer page can POST to apply the optimization and persists to DB
- Simulator page can POST a scenario and receive projected results
- Alerts can be marked resolved and persist
- All mutations are atomic DB transactions where multiple records change together

**Todo List**:
1. Implement `POST /api/operations/optimization/apply`: set `OptimizationResult.isApplied = true`, update `Vessel.assignedBerth` and `Vessel.predictedWaitHours`, update affected `Berth` utilization — all in one Prisma transaction
2. Implement `POST /api/operations/simulation/run`: accept `{ scenarioType, targetEntityId, durationHours }`, compute before/after metrics from DB state, persist new `SimulationResult`, return it
3. Implement `POST /api/operations/recovery-plan/apply`: set `SimulationResult.recoveryPlan.isApplied = true`, apply the recovery steps (update cranes, vessels, berths) in a transaction
4. Implement `POST /api/operations/alerts/:id/resolve`: set `OperationalAlert.isResolved = true`
5. Implement `PUT /api/operations/vessels/:id/reassign`: accept `{ berthId }`, update `Vessel.assignedBerth` and `Vessel.currentBerth`, update old/new `Berth.currentVesselId`
6. Implement `PUT /api/operations/vessels/:id`: general vessel update (used for ETA changes)
7. Implement `PUT /api/operations/berth-requests/:id/status`: admin approves/rejects/reassigns a berth request; accept `{ status, assignedBerth?, notes? }`, update `BerthRequest`, trigger berth queue count update
8. Add request body validation (Zod) for every mutation endpoint
9. Return the updated entity in every mutation response

**Relevant Context**:
- OperationsContext mutations: `applyOptimization()`, `runSimulation()`, `applyRecoveryPlan()`, `reassignVesselBerth()`, `resolveAlert()`: [`frontend/src/context/OperationsContext.tsx`](frontend/src/context/OperationsContext.tsx)
- `OptimizerPage` apply button → modal confirm: [`frontend/src/pages/OptimizerPage.tsx`](frontend/src/pages/OptimizerPage.tsx)
- `SimulatorPage` scenario run: [`frontend/src/pages/SimulatorPage.tsx`](frontend/src/pages/SimulatorPage.tsx)
- `BerthsPage` approve/reject panel: [`frontend/src/pages/BerthsPage.tsx`](frontend/src/pages/BerthsPage.tsx)

---

### Sub-Task 7 — Ship Agent API

**Status**: `[ ] pending`

**Intent**:
Implement all Ship Agent (ship-agent role) endpoints. Agents see only their own data (filtered by `ownerId`). This covers vessel CRUD, berth requests, cargo management, and document metadata.

**Expected Outcomes**:
- A ship-agent can fetch only their own vessels/requests/documents (not other agents' data)
- New vessel registration creates a Vessel record + auto-generates a BerthRequest
- Document upload endpoint accepts file and stores metadata to DB
- Admin berth request status updates are immediately visible to the agent via GET

**Todo List**:
1. Create `src/routes/agent.ts` router (mount at `/api/agent`, require `authenticate` + `requireRole('ship-agent')`)
2. Implement `GET /api/agent/vessels`: filter `Vessel` by `ownerId = req.user.id`
3. Implement `GET /api/agent/vessels/:id`: ownership check, 403 if not owner
4. Implement `POST /api/agent/vessels`: create `Vessel` with `ownerId = req.user.id`, auto-create `BerthRequest` in same transaction if `requestedBerth` is provided
5. Implement `PUT /api/agent/vessels/:id`: ownership check, update vessel fields
6. Implement `DELETE /api/agent/vessels/:id`: ownership check, soft-delete or hard-delete vessel
7. Implement `GET /api/agent/berth-requests`: filter by `ownerId = req.user.id`
8. Implement `POST /api/agent/berth-requests`: create new `BerthRequest`, link to calling user
9. Implement `GET /api/agent/cargo`: return vessels with cargo fields for agent (derives from GET vessels)
10. Implement `PUT /api/agent/cargo/:vesselId`: update `cargoType`, `cargoQuantity`, `containersLoaded`, `containersTotal`, `dangerousGoods`, `specialNotes`
11. Implement `GET /api/agent/documents`: filter `ShippingDocument` by `ownerId = req.user.id`
12. Implement `POST /api/agent/documents`: accept multipart form (file + metadata), save file to `UPLOAD_DIR`, insert `ShippingDocument` record
13. Implement `DELETE /api/agent/documents/:id`: ownership check, delete file from disk + DB record
14. Implement `GET /api/agent/alerts`: filter `OperationalAlert` where `relatedEntity.id` is one of agent's vessel IDs
15. Implement `GET /api/agent/schedules`: return `ShiftPlanItem[]` for agent's vessels
16. Implement `GET /api/agent/profile`: return calling user's full profile
17. Implement `PUT /api/agent/profile`: update user's `name`, `email`, company info fields

**Relevant Context**:
- Shipping pages filter by `ownerId` in current mock: [`frontend/src/context/OperationsContext.tsx`](frontend/src/context/OperationsContext.tsx) — methods like `vessels.filter(v => v.ownerId === user?.id)`
- Add Vessel form: [`frontend/src/pages/shipping/ShippingAddVesselPage.tsx`](frontend/src/pages/shipping/ShippingAddVesselPage.tsx)
- Berth requests page: [`frontend/src/pages/shipping/ShippingBerthRequestsPage.tsx`](frontend/src/pages/shipping/ShippingBerthRequestsPage.tsx)
- Document upload: [`frontend/src/pages/shipping/ShippingDocumentsPage.tsx`](frontend/src/pages/shipping/ShippingDocumentsPage.tsx) — uses `multer` for file handling

---

### Sub-Task 8 — AI Copilot Proxy Endpoint

**Status**: `[ ] pending`

**Intent**:
Move the Gemini API key server-side by creating a backend proxy endpoint for the AI Copilot. The frontend's `geminiCopilotService.ts` will be simplified to call `POST /api/copilot/query` instead of directly calling Google GenAI. The system prompt, context building, and fallback logic all live on the server.

**Expected Outcomes**:
- `POST /api/copilot/query` accepts user query + context summary, calls Gemini, returns structured response
- API key is never exposed to the browser
- Role-based context scoping: admin queries get full port telemetry, ship-agent queries get scoped context
- Fallback (no API key) returns grounded structured response based on DB state

**Todo List**:
1. Create `src/routes/copilot.ts` router (mount at `/api/copilot`, require `authenticate`)
2. Create `src/services/copilotService.ts` — port the logic from `geminiCopilotService.ts` server-side, reading Gemini API key from `process.env.GEMINI_API_KEY`
3. Implement `POST /api/copilot/query`: accept `{ userQuery, contextHints? }`, determine role from `req.user.role`
4. For `admin` role: fetch full port telemetry from DB (vessels, berths, cranes, forecast, alerts, optimization state), build context, call Gemini
5. For `ship-agent` role: fetch only agent-scoped data (their vessels, their requests, their documents), build scoped context, call Gemini
6. Port `buildStructuredContext()` and `buildAgentScopedContext()` logic from frontend to server
7. Port `validateAndSanitizeStructuredResponse()` and `generateGroundedStructuredFallback()` to server
8. Return `CopilotStructuredResponse` shape: `{ message, blocks[], suggestedActions[] }`
9. Add streaming support: `POST /api/copilot/query-stream` using Server-Sent Events (SSE) for token-by-token response (maps to `CopilotMessage.isStreaming` flag)
10. Apply rate limiting (e.g. 20 requests/minute per user) using `express-rate-limit`

**Relevant Context**:
- Current frontend service: [`frontend/src/services/geminiCopilotService.ts`](frontend/src/services/geminiCopilotService.ts)
- Copilot message structure: [`CopilotMessage` interface](frontend/src/types/operations.ts)
- Copilot page: [`frontend/src/pages/CopilotPage.tsx`](frontend/src/pages/CopilotPage.tsx) and [`frontend/src/pages/shipping/ShippingCopilotPage.tsx`](frontend/src/pages/shipping/ShippingCopilotPage.tsx)
- Copilot chat component: [`frontend/src/components/copilot/CopilotChat.tsx`](frontend/src/components/copilot/CopilotChat.tsx)

---

### Sub-Task 9 — WebSocket Real-Time Events

**Status**: `[ ] pending`

**Intent**:
Add a WebSocket server that pushes live updates to connected clients. This enables the dashboard and alerts page to receive changes (crane failures, new vessel arrivals, alert triggers) without polling.

**Expected Outcomes**:
- Browser connects to `ws://localhost:3001` on app load
- Server broadcasts events: `vessel_updated`, `alert_created`, `berth_status_changed`, `crane_status_changed`
- Frontend OperationsContext subscribes to events and merges updates into state
- Only authenticated users can connect (token passed as query param on ws upgrade)

**Todo List**:
1. Install `ws` package (already listed in Sub-Task 1)
2. Create `src/websocket/hub.ts` — WebSocket server attached to the HTTP server instance, maintains connected client registry (keyed by `userId`)
3. Implement JWT authentication on WebSocket upgrade: parse `?token=` query param, verify JWT, attach user to socket
4. Define event type enum: `VESSEL_UPDATED`, `ALERT_CREATED`, `ALERT_RESOLVED`, `BERTH_STATUS_CHANGED`, `CRANE_STATUS_CHANGED`, `OPTIMIZATION_APPLIED`, `SIMULATION_COMPLETED`
5. Create `src/websocket/broadcast.ts` — utility to emit typed events to specific users or all connected clients by role
6. Integrate broadcast calls in mutation route handlers (Sub-Task 6): after `optimization/apply`, broadcast `OPTIMIZATION_APPLIED`; after alert creation, broadcast `ALERT_CREATED`
7. Document frontend integration pattern: `OperationsContext` opens `new WebSocket(WS_URL)`, handles `onmessage`, dispatches state updates

**Relevant Context**:
- `OperationsContext` currently uses local state only: [`frontend/src/context/OperationsContext.tsx`](frontend/src/context/OperationsContext.tsx)
- `TopBar` displays toast notifications on state changes: [`frontend/src/components/layout/Topbar.tsx`](frontend/src/components/layout/Topbar.tsx)
- Toast system: `showToast()` in OperationsContext

---

### Sub-Task 10 — File Uploads & Document Serving

**Status**: `[ ] pending`

**Intent**:
Handle physical file storage for shipping documents uploaded by agents. Files are stored on disk (or cloud storage) and served back via a secure authenticated URL.

**Expected Outcomes**:
- `POST /api/agent/documents` (from Sub-Task 7) accepts multipart files up to 25 MB
- Files saved to `UPLOAD_DIR` with a UUID-based filename
- `GET /api/uploads/:fileId` serves the file only if the requesting user owns it (or is admin)
- File metadata (name, size, type) is extracted and stored in the `ShippingDocument` DB record

**Todo List**:
1. Configure `multer` middleware: `dest: process.env.UPLOAD_DIR`, max file size 25 MB, allowed mime types (PDF, image/*, application/msword, xlsx)
2. Create `src/routes/uploads.ts` router (mount at `/api/uploads`)
3. Implement `GET /api/uploads/:fileId`: look up `ShippingDocument` by `fileUrl` (filename), ownership check, pipe file stream to response with correct `Content-Type`
4. On `DELETE /api/agent/documents/:id`: `fs.unlink` the physical file after DB record deletion
5. Add cleanup job (cron) to remove orphaned files not referenced in DB

**Relevant Context**:
- `ShippingDocument.fileUrl` stores the relative file path: [`ShippingDocument` interface](frontend/src/types/operations.ts)
- Documents page: [`frontend/src/pages/shipping/ShippingDocumentsPage.tsx`](frontend/src/pages/shipping/ShippingDocumentsPage.tsx)

---

### Sub-Task 11 — Error Handling, Logging & Security

**Status**: `[ ] pending`

**Intent**:
Add production-grade error handling, request logging, and security hardening across the entire API. This ensures predictable error responses, visibility into issues, and protection against common web vulnerabilities.

**Expected Outcomes**:
- Every unhandled error returns `{ error: { code, message } }` JSON (no stack traces in production)
- All requests are logged with method, path, status, duration
- CORS is restricted to the allowed frontend origin
- Rate limiting is applied to auth and copilot endpoints
- Input validation errors return structured `{ error: { code: 'VALIDATION_ERROR', details: [...] } }`

**Todo List**:
1. Create `src/middleware/errorHandler.ts` — global Express error handler: catch `ZodError` → 400, `PrismaClientKnownRequestError` P2025 → 404, unknown → 500; strip stack traces in `NODE_ENV=production`
2. Create `src/middleware/requestLogger.ts` — log method, URL, status, duration using `morgan` or custom middleware
3. Configure `cors` middleware with `ALLOWED_ORIGINS` whitelist from env
4. Configure `helmet` middleware for security headers (HSTS, CSP, X-Frame-Options)
5. Add `express-rate-limit` middleware:
   - Auth routes: 10 requests/minute per IP
   - Copilot routes: 20 requests/minute per user
   - Other routes: 100 requests/minute per IP
6. Add `express-slow-down` for progressive slowdown on repeated auth failures
7. Validate `Content-Type: application/json` on all non-multipart POST/PUT routes
8. Create consistent error response factory: `{ error: { code: string, message: string, details?: any } }`
9. Add health check endpoint: `GET /api/health` → `{ status: 'ok', timestamp, db: 'connected' }`

---

### Sub-Task 12 — Frontend Integration (OperationsContext Wiring)

**Status**: `[ ] pending`

**Intent**:
Update `OperationsContext.tsx` and `AuthContext.tsx` to replace mock data imports and localStorage-only auth with real API calls. The frontend component tree requires no changes — only the context providers change.

**Expected Outcomes**:
- App loads data from `/api/*` instead of `mockData.ts`
- Auth tokens stored in memory + `httpOnly` cookie (or localStorage with JWT)
- All OperationsContext action methods call the correct mutation endpoints
- Loading states are shown during data fetch (`isLoading` flags already exist)
- Error toasts shown on API failures

**Todo List**:
1. Create `frontend/src/services/apiClient.ts` — thin fetch wrapper that attaches `Authorization: Bearer <token>` header, handles 401 (trigger logout), centralises base URL (`/api`)
2. Update `AuthContext.tsx`:
   - `loginDemo(role)` → `POST /api/auth/login-demo`
   - `loginWithGoogle(idToken)` → `POST /api/auth/google`
   - `updateRole(role)` → `POST /api/auth/role`
   - `logout()` → `POST /api/auth/logout` + clear token
   - On app init → `GET /api/auth/me` (replaces localStorage hydration)
3. Update `OperationsContext.tsx` initial data loading (replace `portOperationsService` imports with API calls):
   - `useEffect` on mount → fetch vessels, berths, cranes, yard blocks, forecast, optimization, simulation, routes, shift plans, alerts, berth requests, shipping documents
4. Update every mutation method to call the corresponding API endpoint, then update local state from the response
5. Add WebSocket connection setup in `OperationsContext` (consume events from Sub-Task 9)
6. Update Vite dev proxy in [`frontend/vite.config.ts`](frontend/vite.config.ts): `{ '/api': { target: 'http://localhost:3001', changeOrigin: true } }`
7. Update `geminiCopilotService.ts` to call `POST /api/copilot/query` instead of calling Google GenAI directly

**Relevant Context**:
- Context files: [`frontend/src/context/OperationsContext.tsx`](frontend/src/context/OperationsContext.tsx), [`frontend/src/context/AuthContext.tsx`](frontend/src/context/AuthContext.tsx)
- Auth service: [`frontend/src/services/authService.ts`](frontend/src/services/authService.ts)
- Copilot service: [`frontend/src/services/geminiCopilotService.ts`](frontend/src/services/geminiCopilotService.ts)

---

## Data Flow Summary

```
Current (Mock):
  mockData.ts → portOperationsService.ts → OperationsContext → Pages

Target (Live):
  PostgreSQL ← Prisma ← Express Routes ← fetch() ← apiClient.ts ← OperationsContext → Pages
                                                ↑ WebSocket push updates
  Google Gemini ← copilotService.ts (server) ← POST /api/copilot/query ← geminiCopilotService.ts (client, simplified)
```

---

## API Endpoint Reference

| Method | Path | Role | Description |
|--------|------|------|-------------|
| POST | /api/auth/login-demo | public | Demo login (admin or agent) |
| POST | /api/auth/google | public | Google OAuth token exchange |
| POST | /api/auth/role | authenticated | Update role after Google sign-in |
| GET | /api/auth/me | authenticated | Get current user |
| POST | /api/auth/logout | authenticated | Logout |
| GET | /api/operations/port-status | admin | Dashboard summary metrics |
| GET | /api/operations/vessels | admin | All vessels with filters |
| GET | /api/operations/vessels/:id | admin | Single vessel detail |
| PUT | /api/operations/vessels/:id | admin | Update vessel (ETA changes) |
| PUT | /api/operations/vessels/:id/reassign | admin | Reassign vessel to berth |
| GET | /api/operations/berths | admin | All berths |
| GET | /api/operations/berths/:id | admin | Single berth |
| GET | /api/operations/cranes | admin | All cranes |
| GET | /api/operations/cranes/:id | admin | Single crane |
| GET | /api/operations/yard-blocks | admin | All yard blocks |
| GET | /api/operations/forecast | admin | Latest congestion forecast |
| GET | /api/operations/optimization | admin | Latest optimization result |
| POST | /api/operations/optimization/apply | admin | Apply optimization |
| GET | /api/operations/simulation | admin | Latest simulation result |
| POST | /api/operations/simulation/run | admin | Run a new simulation |
| POST | /api/operations/recovery-plan/apply | admin | Apply recovery plan |
| GET | /api/operations/routes | admin | Alternate route options |
| GET | /api/operations/shift-plans | admin | 72-hour shift plan |
| GET | /api/operations/alerts | admin | Operational alerts |
| POST | /api/operations/alerts/:id/resolve | admin | Resolve an alert |
| GET | /api/operations/berth-requests | admin | All berth requests |
| PUT | /api/operations/berth-requests/:id/status | admin | Approve/reject/reassign |
| GET | /api/agent/vessels | ship-agent | Agent's own vessels |
| GET | /api/agent/vessels/:id | ship-agent | Agent's vessel detail |
| POST | /api/agent/vessels | ship-agent | Register new vessel |
| PUT | /api/agent/vessels/:id | ship-agent | Update vessel |
| DELETE | /api/agent/vessels/:id | ship-agent | Delete vessel |
| GET | /api/agent/berth-requests | ship-agent | Agent's berth requests |
| POST | /api/agent/berth-requests | ship-agent | Submit new berth request |
| PUT | /api/agent/cargo/:vesselId | ship-agent | Update cargo info |
| GET | /api/agent/documents | ship-agent | Agent's documents |
| POST | /api/agent/documents | ship-agent | Upload document (multipart) |
| DELETE | /api/agent/documents/:id | ship-agent | Delete document |
| GET | /api/agent/alerts | ship-agent | Alerts for agent's vessels |
| GET | /api/agent/schedules | ship-agent | Agent's vessel schedules |
| GET | /api/agent/profile | ship-agent | Agent profile |
| PUT | /api/agent/profile | ship-agent | Update profile |
| POST | /api/copilot/query | authenticated | AI copilot (admin or agent scoped) |
| POST | /api/copilot/query-stream | authenticated | SSE streaming copilot |
| GET | /api/uploads/:fileId | authenticated | Serve uploaded document |
| GET | /api/health | public | Health check |

---

## Technology Stack

| Layer | Technology | Reason |
|-------|-----------|--------|
| Runtime | Node.js 20 LTS | Matches Vite/React ecosystem |
| Framework | Express 5 + TypeScript | Minimal, well-known, type-safe |
| ORM | Prisma | Type-safe, schema-first, great migration tooling |
| Database | PostgreSQL 15 | Relational, JSON columns supported, production-ready |
| Auth | jsonwebtoken + google-auth-library | JWT for stateless auth, official Google OAuth library |
| Validation | Zod | Same validation patterns as tRPC/Next.js ecosystem, runtime schema enforcement |
| File Upload | Multer | Standard Express file upload middleware |
| Real-time | ws (WebSocket) | Lightweight, no Socket.io overhead needed |
| AI Proxy | @google/genai (server-side) | Keeps API key out of browser |
| Security | helmet + cors + express-rate-limit | Industry standard hardening stack |
| Logging | morgan | Standard HTTP request logger |

---

## Environment Variables (.env)

```
# Server
PORT=3001
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/portpulse

# Auth
JWT_SECRET=<strong-random-secret>
JWT_EXPIRES_IN=7d
GOOGLE_CLIENT_ID=<google-oauth-client-id>

# AI
GEMINI_API_KEY=<gemini-api-key>

# CORS
ALLOWED_ORIGINS=http://localhost:5173

# File Storage
UPLOAD_DIR=./uploads
MAX_FILE_SIZE_MB=25
```
