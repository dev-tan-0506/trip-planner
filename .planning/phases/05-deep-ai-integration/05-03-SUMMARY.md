---
phase: 05-deep-ai-integration
plan: 03
subsystem: ui
tags: [nestjs, react, ai-cards, vitest, jest, trip-workspace]
requires:
  - phase: 05-01
    provides: AI tab shell, culinary route card patterns, trip-scoped confidence labels
  - phase: 05-02
    provides: booking import review card patterns inside the AI workspace
provides:
  - Local Expert API endpoints for menu translation, hidden local spots, and outfit planning
  - Compact AI task cards with confidence labels and visible next actions in the trip workspace
  - Frontend AI tab panels for menu translation, hidden-spot discovery, and outfit suggestions
affects: [05-04, 05-05, api, ui, testing]
tech-stack:
  added: []
  patterns: [trip-scoped assistant endpoints, compact AI response cards, confidence-labeled suggestion panels]
key-files:
  created:
    - apps/api/src/local-expert/local-expert.module.ts
    - apps/api/src/local-expert/local-expert.controller.ts
    - apps/api/src/local-expert/local-expert.service.ts
    - apps/web/src/components/trip/LocalExpertPanel.tsx
    - apps/web/src/components/trip/OutfitPlannerPanel.tsx
  modified:
    - apps/api/src/app.module.ts
    - apps/api/test/phase-05-deep-ai-integration.e2e-spec.ts
    - apps/web/src/lib/api-client.ts
    - apps/web/src/components/trip/AiAssistTab.tsx
    - apps/web/src/components/trip/__tests__/phase-05-ai.test.tsx
key-decisions:
  - "Local Expert and outfit tools stay inside the existing AI trip tab instead of creating a separate assistant surface."
  - "All new AI responses remain compact cards with confidence labels and next actions instead of freeform chat output."
patterns-established:
  - "Trip-scoped assistant endpoints return structured card payloads with Vietnamese confidence labels."
  - "Lightweight AI helpers in the workspace reuse existing review-card patterns instead of mutating canonical trip data."
requirements-completed: [AIX-02, AIX-03]
duration: 31min
completed: 2026-04-01
---

# Phase 05 Plan 03: Local Expert AI Menu Translator & Outfit Planner Summary

**Trip-scoped Local Expert endpoints and AI tab panels for menu translation, hidden-spot discovery, and three-card outfit suggestions**

## Performance

- **Duration:** 31 min
- **Started:** 2026-04-01T22:26:00+07:00
- **Completed:** 2026-04-01T22:57:08+07:00
- **Tasks:** 2
- **Files modified:** 14

## Accomplishments

- Added a new NestJS `local-expert` module with guarded trip-scoped endpoints for menu translation, hidden spots, and outfit planning.
- Returned compact structured assistant cards with `Goi y`, `Uoc luong`, and `Can xem lai` confidence labels plus explicit next actions.
- Extended the AI workspace tab with `LocalExpertPanel` and `OutfitPlannerPanel` while preserving the existing card-first, non-chat assistant surface.

## Task Commits

Each task was committed atomically:

1. **Task 1: Add structured Local Expert and outfit planner APIs** - `2040290` (feat)
2. **Task 2: Render Local Expert and outfit cards inside the AI trip tab** - `f8c4a37` (feat)

## Files Created/Modified

- `apps/api/src/local-expert/local-expert.service.ts` - deterministic assistant card generation for menu translation, hidden spots, and outfit plans
- `apps/api/src/local-expert/local-expert.controller.ts` - guarded trip-scoped assistant endpoints under `/trips/:tripId/local-expert`
- `apps/api/test/phase-05-deep-ai-integration.e2e-spec.ts` - e2e coverage for local expert response shape and outfit card cap
- `apps/web/src/components/trip/LocalExpertPanel.tsx` - UI surface for `Dich menu` and `Goi y choi gi quanh day`
- `apps/web/src/components/trip/OutfitPlannerPanel.tsx` - `Len do cho hom nay` card panel capped at three options
- `apps/web/src/components/trip/AiAssistTab.tsx` - integration of the new assistant panels into the existing AI tab
- `apps/web/src/lib/api-client.ts` - typed client contracts for the new local expert endpoints
- `apps/web/src/components/trip/__tests__/phase-05-ai.test.tsx` - UI coverage for menu, hidden-spot, and outfit assistant flows

## Decisions Made

- Kept Local Expert and outfit planning under the existing AI tab to preserve the trip-workspace-first Phase 5 architecture.
- Reused the existing AI card interaction model so these lighter helpers feel consistent with culinary routing and booking review.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- Local sandbox execution could not complete backend/frontend verification directly because Jest/Vite child process spawning hit environment restrictions (`DATABASE_URL` missing in the plain backend test command, then `spawn EPERM` under sandboxed execution).
- Backend verification was completed successfully from the orchestrator side with `.env` loaded.
- Frontend verification completed successfully after rerunning the plan Vitest command outside the sandbox.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 05 now has lightweight suggestion-card helpers for local knowledge and style guidance inside the same AI workspace.
- The next AI plans can reuse the same confidence-label and compact-card contract for podcast recap and local cost benchmarking flows.

## Self-Check: PASSED

- Found `.planning/phases/05-deep-ai-integration/05-03-SUMMARY.md`
- Found task commit `2040290`
- Found task commit `f8c4a37`

---
*Phase: 05-deep-ai-integration*
*Completed: 2026-04-01*
