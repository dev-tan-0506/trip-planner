---
phase: 05-deep-ai-integration
plan: 01
subsystem: ui
tags: [nestjs, prisma, react, vitest, jest, ai, itinerary]
requires:
  - phase: 05-00
    provides: phase-05 smoke scaffolds and shared trust-label fixtures
provides:
  - itinerary AI suggest/apply endpoints for culinary routing
  - inline health conflict warnings on itinerary snapshots and cards
  - trip workspace AI tab with draft-only route review flow
affects: [phase-05, itinerary, trip-workspace, ai-contracts]
tech-stack:
  added: []
  patterns: [trip-scoped AI tabs, draft-then-apply itinerary mutations, inline trust warnings]
key-files:
  created:
    - apps/api/src/itinerary/dto/request-culinary-route.dto.ts
    - apps/api/src/itinerary/dto/apply-culinary-route.dto.ts
    - apps/web/src/components/trip/AiAssistTab.tsx
    - apps/web/src/components/trip/CulinaryRouteCard.tsx
    - apps/web/src/components/trip/HealthConflictBadge.tsx
  modified:
    - apps/api/src/itinerary/itinerary.controller.ts
    - apps/api/src/itinerary/itinerary.service.ts
    - apps/api/src/itinerary/itinerary.service.spec.ts
    - apps/api/test/phase-05-deep-ai-integration.e2e-spec.ts
    - apps/web/src/lib/api-client.ts
    - apps/web/src/components/trip/TripWorkspaceShell.tsx
    - apps/web/src/components/trip/TimelineDaySection.tsx
    - apps/web/src/components/trip/__tests__/phase-05-ai.test.tsx
key-decisions:
  - "AI route suggestions stay inside the existing trip workspace and only rewrite itinerary order after an explicit leader apply call."
  - "Health-profile conflicts are advisory snapshot rows rendered inline on itinerary cards with visible severity and confidence labels."
patterns-established:
  - "Trip-scoped AI pattern: reuse ItinerarySnapshot plus explicit trip endpoints instead of creating a separate AI product area."
  - "Trust-sensitive mutation pattern: suggest returns a reviewable draft token, apply performs the canonical reorder in a second request."
requirements-completed: [PLAN-04, PLAN-05]
duration: 1h 25m
completed: 2026-04-01
---

# Phase 05 Plan 01: Culinary Routing & Health Profile Matching Summary

**Trip-scoped AI routing drafts with leader-only apply plus inline health conflict warnings and confidence-aware UI copy**

## Performance

- **Duration:** 1h 25m
- **Started:** 2026-04-01T20:05:00Z
- **Completed:** 2026-04-01T21:31:00Z
- **Tasks:** 2
- **Files modified:** 13

## Accomplishments
- Added itinerary AI endpoints for culinary route suggestion/apply without mutating canonical order during the suggest step.
- Extended itinerary snapshots with severity-coded `healthWarnings`, including ambiguous-profile fallback to `Can xem lai`.
- Added the `Tro ly AI` workspace tab, route review card, leader-only apply CTA, and inline health warning badges on timeline items.

## Task Commits

1. **Task 1: Add itinerary AI endpoints for health conflict warnings and culinary route suggestion/apply** - `23ba6ca` (feat)
2. **Task 2: Add the AI trip tab, route review UI, and inline health warning rendering** - `fc9c3f8` (feat)

## Files Created/Modified
- `apps/api/src/itinerary/itinerary.service.ts` - Added culinary route draft/apply logic and health warning assembly in itinerary snapshots.
- `apps/api/test/phase-05-deep-ai-integration.e2e-spec.ts` - Covers ambiguous health parsing, non-mutating route suggestion, and leader-only apply.
- `apps/web/src/lib/api-client.ts` - Added typed health warning and culinary route client contracts.
- `apps/web/src/components/trip/AiAssistTab.tsx` - New AI trip tab with stop selection, draft copy, and route request/apply flow.
- `apps/web/src/components/trip/CulinaryRouteCard.tsx` - Displays ordered stops, reasons, confidence chip, and apply CTA.
- `apps/web/src/components/trip/HealthConflictBadge.tsx` - Severity-styled inline warning badge for itinerary cards.
- `apps/web/src/components/trip/TimelineDaySection.tsx` - Renders health warnings directly under itinerary item metadata.

## Decisions Made
- Kept all Phase 5.1 AI behavior inside `TripWorkspaceShell` so the trip remains the primary context and source of truth.
- Used draft suggestion tokens plus a second explicit apply request to preserve leader authority over structural itinerary mutations.
- Mapped backend severity enums to visible Vietnamese-first warning badges instead of blocking edits or silently rewriting data.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Corrected `affectedMemberIds` to return user IDs instead of trip-member row IDs**
- **Found during:** Task 1 verification
- **Issue:** Health warning payload initially returned membership IDs, which mismatched the intended contract for affected members.
- **Fix:** Switched snapshot warning assembly to select and emit `TripMember.userId`.
- **Files modified:** `apps/api/src/itinerary/itinerary.service.ts`, `apps/api/src/itinerary/itinerary.service.spec.ts`
- **Verification:** `npx jest --config apps/api/test/jest-e2e.json --runInBand apps/api/test/phase-05-deep-ai-integration.e2e-spec.ts --testNamePattern "culinary route|health|non-mutation"`
- **Committed in:** `23ba6ca`

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** The fix aligned the API payload with the trust-sensitive UI contract. No scope creep.

## Issues Encountered

- Backend e2e verification initially failed because `DATABASE_URL` was not loaded and the local Postgres container was down; resolved by exporting the env vars and starting `minh-di-dau-the-db`.
- The frontend vitest command hit a Windows sandbox `spawn EPERM` during Vite startup; resolved by rerunning the same test command outside the sandbox.
- The first full UI assertion duplicated `Nguy co cao` text inside the new badge; resolved by tightening the test query rather than changing component behavior.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 5 now has a real AI entry point and trusted draft/apply contract for future booking import and expert-assistant work.
- Later Phase 5 plans can extend the existing `phase-05` API/UI tests instead of replacing placeholders.

## Known Stubs

None.

## Self-Check: PASSED

---
*Phase: 05-deep-ai-integration*
*Completed: 2026-04-01*
