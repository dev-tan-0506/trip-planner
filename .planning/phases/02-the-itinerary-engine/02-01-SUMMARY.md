---
phase: 02-the-itinerary-engine
plan: "01"
subsystem: backend
tags: [prisma, nestjs, itinerary, proposals, api]
requires: [Phase 1 auth, Phase 1 trips]
provides: [itinerary-api, proposal-api, phase-2-schema]
affects: [apps/api, packages/database]
tech-stack:
  added: []
  patterns: [canonical-snapshot, leader-only-mutations, version-tracking]
key-files:
  created:
    - packages/database/prisma/schema.prisma
    - apps/api/src/itinerary/itinerary.module.ts
    - apps/api/src/itinerary/itinerary.controller.ts
    - apps/api/src/itinerary/itinerary.service.ts
    - apps/api/src/itinerary/dto/create-itinerary-item.dto.ts
    - apps/api/src/itinerary/dto/update-itinerary-item.dto.ts
    - apps/api/src/itinerary/dto/reorder-itinerary.dto.ts
    - apps/api/src/proposals/proposals.module.ts
    - apps/api/src/proposals/proposals.controller.ts
    - apps/api/src/proposals/proposals.service.ts
    - apps/api/src/proposals/dto/create-proposal.dto.ts
    - apps/api/src/itinerary/itinerary.service.spec.ts
    - apps/api/src/proposals/proposals.service.spec.ts
    - apps/api/test/phase-02-itinerary.e2e-spec.ts
  modified:
    - apps/api/src/app.module.ts
key-decisions:
  - summary: "Use string literals for Prisma enum status values instead of enum imports"
    rationale: "Avoids ts-jest compilation issues with @prisma/client imports in test context while maintaining runtime correctness"
requirements-completed: [PLAN-01, PLAN-02]
duration: "15 min"
completed: "2026-03-28"
---

# Phase 02 Plan 01: Backend Foundation Summary

Canonical itinerary and proposal REST APIs built on a comprehensive Prisma schema that serves as the single source of truth for the entire Phase 2 Itinerary Engine.

## Execution Details

- **Duration:** ~15 min
- **Tasks:** 3/3 complete
- **Files:** 15 created/modified
- **Tests:** 18 unit tests passing (11 itinerary + 7 proposals)

## What Was Built

### Task 1: Prisma Schema Extension
Extended `schema.prisma` with all Phase 2 domain models in a single pass:
- `ItineraryItem` with `dayIndex + sortOrder` canonical ordering and `@@unique([tripId, dayIndex, sortOrder])`
- `ItineraryProposal` with type/status enums and version-based conflict tracking
- `VoteSession` with self-referencing tie-break ancestry via `@relation("VoteSessionParentChild")`
- `VoteBallot` with `@@unique([voteSessionId, userId])` for latest-vote-wins
- `VoteSessionOutcome` with durable winner tracking (createdItemId, replacementProposalId)
- `CommunityTemplate` with `sanitizedSnapshot Json` for detached template storage
- `Trip.timeZone` with `@default("Asia/Ho_Chi_Minh")`

### Task 2: Itinerary & Proposal REST Modules
- **ItineraryModule**: GET snapshot, POST create, PATCH update, DELETE, POST reorder
- **ProposalsModule**: GET list, POST create, POST accept, POST reject
- `getTripItinerarySnapshot()` returns grouped days, progress states (`sap toi`, `dang di`, `da di`, `chua chot gio`), overlap warnings, proposal counts, and `mapItems`
- Leader-only structural mutations enforced via `requireLeader()` guard
- Reorder uses Prisma `$transaction` with sortOrder normalization to 1..N
- `markOutdatedProposals()` marks stale proposals as `OUTDATED` when target item version changes

### Task 3: Backend Tests
- `itinerary.service.spec.ts`: 11 tests covering ordering, overlap warnings, untimed progress state, leader-only mutations, reorder normalization, time conversion
- `proposals.service.spec.ts`: 7 tests covering member creation, leader accept/reject, OUTDATED stale invalidation
- `phase-02-itinerary.e2e-spec.ts`: End-to-end lifecycle test

## Deviations from Plan

- **[Rule 1 - Bug] Prisma enum import**: Changed `ItineraryProposalStatus` enum import to string literals to avoid ts-jest compilation issues with `@prisma/client` in the test context. Runtime behavior is identical.
- **[Rule 1 - Bug] Payload type cast**: Added `as any` cast for `dto.payload` in `createProposal` to satisfy Prisma's `InputJsonValue` type requirement.

**Total deviations:** 2 auto-fixed (both Rule 1 - Bug). **Impact:** None — both are type-level fixes with no runtime behavior change.

## Issues Encountered

None.

## Next Plan Readiness

Ready for Plan 02-02 (Trip Workspace UI) — all backend APIs are in place for the frontend to consume.
