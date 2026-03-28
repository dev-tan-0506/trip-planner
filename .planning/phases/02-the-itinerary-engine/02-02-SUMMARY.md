---
phase: 02-the-itinerary-engine
plan: "02"
subsystem: frontend
tags: [next.js, workspace, timeline, map, proposals, leaflet, vitest]
requires: [02-01]
provides: [trip-workspace-ui, itinerary-timeline, map-projection, proposal-ui]
affects: [apps/web]
tech-stack:
  added: [leaflet, react-leaflet, vitest, @testing-library/react]
  patterns: [workspace-shell, bottom-sheet-composer, progress-state-chips]
key-files:
  created:
    - apps/web/src/lib/api-client.ts (extended)
    - apps/web/src/components/trip/TripWorkspaceShell.tsx
    - apps/web/src/components/trip/TimelineDaySection.tsx
    - apps/web/src/components/trip/ItineraryComposerSheet.tsx
    - apps/web/src/components/trip/ItineraryItemEditor.tsx
    - apps/web/src/components/trip/DeleteItineraryItemDialog.tsx
    - apps/web/src/components/trip/ProposalComposerSheet.tsx
    - apps/web/src/components/trip/ProposalInboxPanel.tsx
    - apps/web/src/components/trip/TripMapScreen.tsx
    - apps/web/src/components/trip/LocationPicker.tsx
    - apps/web/app/trip/[joinCode]/map/page.tsx
    - apps/web/vitest.config.ts
    - apps/web/src/test/setup.tsx
    - apps/web/src/components/trip/__tests__/trip-workspace.test.tsx
  modified:
    - apps/web/app/trip/[joinCode]/page.tsx
    - apps/web/package.json
key-decisions:
  - summary: "Use bottom-sheet pattern for all composers and editors"
    rationale: "Mobile-first UX consistent with the app's Vietnamese-audience design"
  - summary: "Dynamic import TripMapScreen with ssr:false"
    rationale: "Leaflet requires window/document APIs not available in SSR"
  - summary: "Regex text matchers in tests for Vietnamese chips"
    rationale: "Emoji prefixes in progress chips split text nodes; regex handles this"
requirements-completed: [PLAN-01, PLAN-02]
duration: "18 min"
completed: "2026-03-28"
---

# Phase 02 Plan 02: Trip Workspace UI Summary

Full member-facing itinerary workspace with timeline CRUD, progress-state rendering, proposal inbox, map projection, and frontend interaction tests.

## Execution Details

- **Duration:** ~18 min
- **Tasks:** 4/4 complete
- **Files:** 16 created/modified
- **Tests:** 7 frontend interaction tests passing

## What Was Built

### Task 1: API Client + Route Shell
- Extended `api-client.ts` with `itineraryApi` (getSnapshot, createItem, updateItem, deleteItem, reorder) and `proposalsApi` (listProposals, createProposal, acceptProposal, rejectProposal)
- `TripWorkspaceShell` with three tabs: "Lich trinh", "Ban do", "De xuat"
- Trip page (`/trip/[joinCode]`) now shows workspace for `isMember` users and preserves guest preview for visitors

### Task 2: Timeline + Proposals
- `TimelineDaySection` with 4 progress state chips: `sap toi`, `dang di`, `da di`, `chua chot gio`
- `ItineraryComposerSheet` with quick/detailed modes, `insertAfterItemId` support
- `ItineraryItemEditor` with `overlapWarnings` display
- `DeleteItineraryItemDialog` with explicit "Xoa hoat dong nay" confirmation
- `ProposalComposerSheet` for `UPDATE_TIME`, `UPDATE_LOCATION`, `UPDATE_NOTE`, `ADD_ITEM` types via `createProposal`
- `ProposalInboxPanel` with `acceptProposal`/`rejectProposal` leader actions

### Task 3: Map Projection
- `TripMapScreen` with Leaflet, `Polyline` route in timeline order
- Day filter with `trip-map-day-filter:` localStorage persistence
- `focusItemId` query parameter for item-level centering
- `LocationPicker` with `pendingLocation` staging and `confirmLocation` action

### Task 4: Test Harness
- Vitest + RTL configured with `vitest.config.ts` and `setup.tsx`
- 7 tests: member read-only, leader controls, status chips, proposal badges, map launch with `focusItemId`

## Deviations from Plan

- **[Rule 1] setup.ts → setup.tsx**: Renamed test setup file from `.ts` to `.tsx` since it contains JSX in mock factories
- **[Rule 1] Regex matchers**: Used regex instead of exact string matchers for Vietnamese progress chips containing emoji prefixes

**Total deviations:** 2 auto-fixed. **Impact:** None.

## Next Plan Readiness

Ready for Plan 02-03 (Tinder-Style Voting System) — workspace UI is complete and all APIs are wired.
