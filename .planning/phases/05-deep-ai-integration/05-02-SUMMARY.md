---
phase: 05-deep-ai-integration
plan: 02
subsystem: api
tags: [prisma, nestjs, react, vitest, jest, booking-import, ai]
requires:
  - phase: 05-00
    provides: phase 5 test scaffold and shared AI fixtures
  - phase: 05-01
    provides: trip-scoped AI tab and explicit-confirmation trust model
provides:
  - booking import draft persistence with forwarding-address config
  - leader-confirmed draft materialization into itinerary items
  - AI tab booking import card and editable review sheet
  - backend and frontend verification for booking import review flow
affects: [phase-05-ai, itinerary, trip-workspace, booking-import]
tech-stack:
  added: []
  patterns: [draft-first ingestion, leader-only confirmation for canonical writes, trip-scoped AI review sheets]
key-files:
  created:
    - apps/api/src/booking-import/booking-import.controller.ts
    - apps/api/src/booking-import/booking-import.service.ts
    - apps/api/src/booking-import/booking-import.service.spec.ts
    - apps/web/src/components/trip/BookingImportCard.tsx
    - apps/web/src/components/trip/BookingImportReviewSheet.tsx
  modified:
    - packages/database/prisma/schema.prisma
    - apps/api/src/app.module.ts
    - apps/api/test/phase-05-deep-ai-integration.e2e-spec.ts
    - apps/web/src/lib/api-client.ts
    - apps/web/src/components/trip/AiAssistTab.tsx
    - apps/web/src/components/trip/__tests__/phase-05-ai.test.tsx
key-decisions:
  - "Booking ingestion persists raw content and parsed rows as drafts before any itinerary mutation."
  - "Leader confirmation remains the only path that can materialize booking drafts into canonical itinerary items."
  - "The booking review flow lives inside the existing AI tab alongside culinary routing instead of a separate AI screen."
patterns-established:
  - "Draft-first AI ingestion: save parse output with raw excerpts and confidence labels before structural writes."
  - "Trip-scoped review sheet: manual paste, uncertainty messaging, and confirm CTA stay inside the shared workspace surface."
requirements-completed: [AIX-01]
duration: 42min
completed: 2026-04-01
---

# Phase 05 Plan 02: Booking Import Draft Flow Summary

**Trip-scoped booking forwarding address, persisted import drafts, and editable review-sheet confirmation into itinerary items**

## Performance

- **Duration:** 42 min
- **Started:** 2026-04-01T21:32:00+07:00
- **Completed:** 2026-04-01T22:13:56+07:00
- **Tasks:** 2
- **Files modified:** 14

## Accomplishments
- Added `BookingImportDraft` persistence with forwarding metadata, confidence labels, raw content, and parsed rows.
- Implemented booking import API routes for config, draft listing, manual paste creation, inbound forwarding, and leader-only confirm.
- Exposed booking import inside `AiAssistTab` with visible forwarding address, recent draft list, editable review sheet, and confirm CTA.

## Task Commits

Each task was committed atomically:

1. **Task 1: Add booking import draft persistence and confirm-only itinerary insertion** - `0e0f63a` (feat)
2. **Task 2: Expose the booking import review flow in the AI tab** - `503cf8f` (feat)

## Files Created/Modified
- `packages/database/prisma/schema.prisma` - Added `BookingImportDraftStatus` and `BookingImportDraft` with trip/member relations.
- `apps/api/src/app.module.ts` - Registered `BookingImportModule`.
- `apps/api/src/booking-import/booking-import.controller.ts` - Added trip-scoped config, draft, inbound, and confirm routes.
- `apps/api/src/booking-import/booking-import.service.ts` - Implemented forwarding-address generation, draft parsing, inbound creation, and leader confirm flow.
- `apps/api/src/booking-import/booking-import.service.spec.ts` - Added unit coverage for forwarding config, low-confidence parsing, inbound flow, and confirm authorization.
- `apps/api/test/phase-05-deep-ai-integration.e2e-spec.ts` - Added booking import API verification for draft-first behavior and leader-only confirm.
- `apps/web/src/lib/api-client.ts` - Added booking import client contracts and request helpers.
- `apps/web/src/components/trip/AiAssistTab.tsx` - Integrated booking import card and review sheet into the existing AI tab.
- `apps/web/src/components/trip/BookingImportCard.tsx` - Rendered `Dia chi chuyen tiep`, manual paste CTA, and recent drafts with confidence chips.
- `apps/web/src/components/trip/BookingImportReviewSheet.tsx` - Rendered editable parsed rows, raw excerpt review, caution state, and `Nhap vao lich trinh`.
- `apps/web/src/components/trip/__tests__/phase-05-ai.test.tsx` - Added booking import UI coverage.

## Decisions Made

- Stored parsed booking rows as JSON on the draft so the review sheet can edit and resubmit them without inventing a second booking source-of-truth.
- Reused `ItineraryService.createItem()` for draft confirmation so itinerary authorization and ordering rules stay centralized.
- Kept the booking import affordance in the same AI tab as routing and surfaced explicit copy that content `khong duoc dua vao lich trinh` until review plus leader confirmation.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Tightened booking parser matching for low-confidence drafts**
- **Found during:** Task 1 (backend booking import verification)
- **Issue:** The initial parser treated generic uppercase words like `PENDING` and loose `o` matches as valid booking/location data, which hid missing fields that should remain editable.
- **Fix:** Restricted booking-code extraction to tokens containing digits and added word boundaries to location matching.
- **Files modified:** `apps/api/src/booking-import/booking-import.service.ts`
- **Verification:** `apps/api/test/phase-05-deep-ai-integration.e2e-spec.ts --testNamePattern "booking import|forwarding"` passed after the parser update.
- **Committed in:** `0e0f63a`

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** The auto-fix was required to keep low-confidence drafts honest and reviewable. No scope creep.

## Issues Encountered

- `prisma generate` and `db:push` both hit a Windows DLL rename lock under `node_modules/.prisma/client`, but `db:push` still synced the database schema and the regenerated TypeScript client files were sufficient for backend verification.
- The frontend Vitest command hit sandbox `spawn EPERM` during Vite startup, so verification was rerun with escalation and then passed normally.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- The AI tab now supports both routing suggestions and booking import drafts under the same explicit-confirmation model.
- Downstream Phase 5 work can reuse the new review-sheet pattern for other trust-sensitive AI outputs that need editable drafts before canonical writes.

## Self-Check: PASSED

- Summary file exists at `.planning/phases/05-deep-ai-integration/05-02-SUMMARY.md`
- Commit `0e0f63a` found in git history
- Commit `503cf8f` found in git history

---
*Phase: 05-deep-ai-integration*
*Completed: 2026-04-01*
