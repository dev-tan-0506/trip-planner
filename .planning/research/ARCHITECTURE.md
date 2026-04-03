# Project Research: Architecture Dimension

## Milestone Goal
Reshape the shipped `v1.0` codebase so the UI can fully adopt the Stitch design while FE and BE become easier to extend safely.

## Current Architectural Signals

### Frontend
- `apps/web/src/lib/api-client.ts` is a shared choke point at ~1500 lines.
- `TripWorkspaceShell.tsx`, `VoteSessionLobby.tsx`, and multiple route files combine orchestration, fetching, state, layout, and visual markup in single files.
- `packages/ui` exists but is not yet the actual design system backbone.

### Backend
- Domain folders already exist, which is a good foundation.
- Several services have become oversized orchestration-heavy files:
  - `itinerary.service.ts`
  - `memories.service.ts`
  - `votes.service.ts`
  - `fund.service.ts`
- The risk is not missing modular folders; it is too much policy, mapping, and business logic living inside single service classes.

## Recommended Target Shape

### Frontend target shape

#### 1. App shell layer
- global layout
- navigation shell
- route-level screen entry points

#### 2. Feature layer
Example feature slices:
- `features/auth`
- `features/dashboard`
- `features/trip-workspace`
- `features/votes`
- `features/templates`

Each slice should own:
- screen sections
- hooks / state orchestration
- domain-specific UI components
- request clients or adapters for that feature

#### 3. Shared UI layer
`packages/ui` should own:
- primitives
- composable layout pieces
- token-backed component variants
- shared interaction patterns

#### 4. Shared web infrastructure
`apps/web/src/lib` should shrink to true infrastructure only:
- low-level fetch wrapper
- auth token handling
- socket helpers
- small shared utilities

### Backend target shape

Each domain module should move toward:
- controller
- application/orchestration service
- domain helpers / calculators / policy guards
- data mappers / response builders
- DTOs
- persistence helper functions where needed

Example for itinerary:
- `itinerary.service.ts` becomes a thinner coordinator
- reorder logic, overlap detection, progress calculation, health-profile analysis, and route suggestion logic move into focused files

Example for memories:
- split vault, feedback, souvenir, reunion, and scheduler responsibilities into separate collaborators

## Suggested Build Order

1. Establish design tokens and shared UI primitives.
2. Redesign the global app shell and auth/dashboard entry surfaces.
3. Redesign and split the trip workspace shell.
4. Refactor tab-by-tab feature slices on the frontend while aligning each tab with the new design system.
5. Refactor the backend domain services in parallel with the FE slices they support.
6. Finish with regression hardening and leftover oversized file cleanup.

## Architectural Success Markers

- No single frontend transport file owns every API contract.
- No single workspace shell owns every trip surface concern.
- No single backend service is the default home for all domain behavior.
- Shared UI primitives are real and reused.
- Screen redesign work no longer requires editing giant cross-cutting files for every change.
