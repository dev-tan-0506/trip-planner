---
phase: 03-logistics-attendance
plan: "03"
subsystem: attendance-checkin
tags: [prisma, nestjs, websocket, react, leaflet, attendance, proof]
requires: [trip-member-model, jwt-auth, map-ui]
provides: [attendance-session-api, local-proof-storage, attendance-socket, map-first-dashboard]
affects: [prisma-schema, api-client, trip-workspace, api-static-assets]
tech-stack:
  added: []
  patterns: [session-based-checkin, local-proof-storage, signal-and-refetch-realtime]
key-files:
  created:
    - apps/api/src/attendance/attendance.module.ts
    - apps/api/src/attendance/attendance.controller.ts
    - apps/api/src/attendance/attendance.service.ts
    - apps/api/src/attendance/attendance.gateway.ts
    - apps/api/src/attendance/proof-storage.service.ts
    - apps/api/src/attendance/dto/create-attendance-session.dto.ts
    - apps/api/src/attendance/dto/create-attendance-submission.dto.ts
    - apps/api/src/attendance/attendance.service.spec.ts
    - apps/api/test/phase-03-attendance.e2e-spec.ts
    - apps/web/src/components/trip/AttendanceTab.tsx
    - apps/web/src/components/trip/AttendanceMapPanel.tsx
    - apps/web/src/components/trip/AttendanceMapCanvas.tsx
    - apps/web/src/components/trip/AttendanceMemberList.tsx
    - apps/web/src/components/trip/CheckInCaptureSheet.tsx
    - apps/web/src/components/trip/__tests__/attendance-panel.test.tsx
  modified:
    - packages/database/prisma/schema.prisma
    - apps/api/src/app.module.ts
    - apps/api/src/main.ts
    - apps/web/src/lib/api-client.ts
    - apps/web/src/components/trip/TripWorkspaceShell.tsx
key-decisions:
  - Check-in is session-based, not always-on tracking
  - Proof images are stored locally behind a stable service contract so cloud storage can be swapped in later
  - Realtime uses a dedicated `/attendance` namespace and signal-driven refetch to avoid leaking lifecycle from `/votes`
requirements-completed:
  - LOGI-04
  - LOGI-05
duration: ~35 min
completed: 2026-03-29
---

# Phase 03 Plan 03: Attendance & Check-in Summary

Attendance rounds, local selfie-proof storage, a dedicated attendance socket namespace, and a map-first check-in tab are now implemented across API and web.

## What Was Built

### Backend
- Added `AttendanceSession` and `AttendanceSubmission` domain support in Prisma schema
- Built session open/current/submit/close APIs with leader/member role rules
- Added `ProofStorageService` that persists browser-generated data URLs under `apps/api/storage/attendance-proofs`
- Added `/attendance` websocket namespace and `attendance.snapshot` / `attendance.updated` lifecycle
- Exposed local proof assets through Nest static assets setup

### Frontend
- Added the top-level `Check-in` tab to the trip workspace
- Built a map-first attendance dashboard with summary counters and member ordering
- Added `CheckInCaptureSheet` with camera/upload fallback and optional geolocation capture
- Added isolated attendance socket client helper in `api-client`

### Verification
- `npx tsc -p apps/web/tsconfig.json --noEmit` ✅
- `npx tsc -p apps/api/tsconfig.json --noEmit` ✅
- `npx dotenv -e ../../.env -- prisma validate` ✅
- `npm run -w packages/database db:push` ✅
- `npx jest --runInBand src/attendance/attendance.service.spec.ts` ✅
- `npx jest --config test/jest-e2e.json --runInBand test/phase-03-attendance.e2e-spec.ts` ✅
- `npx vitest run src/components/trip/__tests__/attendance-panel.test.tsx` ✅

## Environment Follow-up Resolved

- Local PostgreSQL was restored by starting the existing Docker container `minh-di-dau-the-db`
- Prisma schema push now succeeds and attendance tables are applied locally
- `apps/api/test/jest-e2e.json` was added, and the new attendance e2e spec now runs through Jest successfully

## Next Phase Readiness

Phase 03 is ready for manual verify/UAT.
