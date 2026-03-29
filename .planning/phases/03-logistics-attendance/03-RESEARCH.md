# Phase 3 Research: logistics-attendance

## Executive Takeaway

Phase 3 should be implemented as a trip-scoped logistics workspace layered onto the existing trip planner shell. The safest structure is:

- room and ride allocation as visible boards with leader-first control and member self-join within remaining capacity
- packing and to-do coordination as a combined checklist system with shared categories plus personal ownership
- attendance as a session-based check-in flow with selfie proof, optional browser geolocation, and websocket-backed dashboard refresh

Current codebase signals:
- The database already supports trips, members, itinerary, votes, and templates, but it does not yet contain logistics, checklist, or attendance entities in [`packages/database/prisma/schema.prisma`](../../../packages/database/prisma/schema.prisma).
- The trip experience already clusters around one shell in [`apps/web/src/components/trip/TripWorkspaceShell.tsx`](../../../apps/web/src/components/trip/TripWorkspaceShell.tsx), which is the best anchor for new logistics entry points.
- Realtime infrastructure already exists in [`apps/api/src/votes/votes.gateway.ts`](../../../apps/api/src/votes/votes.gateway.ts), so attendance can reuse the same snapshot-on-join websocket pattern without inventing a new sync model.

Confidence: high on the architectural split, medium on the exact UI density until the design contract or implementation settles final presentation details.

## Standard Stack

- Use NestJS modules, controllers, DTOs, guards, and Prisma transactions for all room, ride, checklist, and attendance mutations.
- Keep room/ride allocation and checklist CRUD on REST APIs backed by full snapshot responses after writes.
- Use websockets only where immediacy matters operationally: attendance dashboards and optionally allocation occupancy updates if later needed.
- Keep browser-only APIs isolated in client components:
  - `navigator.mediaDevices.getUserMedia` for camera capture with file upload fallback
  - `navigator.geolocation.getCurrentPosition` for optional location proof
- Keep the server as the source of truth for capacities, assignments, checklist ownership, and attendance status.

## Architecture Patterns

- Model every new feature as trip-scoped and membership-aware.
- Separate structural containers from assignments:
  - room/ride containers define capacity and metadata
  - assignments map members into those containers
- Preserve leader authority while allowing bounded member self-service:
  - member self-join succeeds only when capacity remains
  - leader can reassign at any time
- Treat attendance as session-based, not ambient:
  - leader opens a check-in round for a gathering point and time window
  - members submit proof into that round
  - dashboard reads the latest snapshot for that round
- Prefer snapshot-style APIs over incremental client reconciliation:
  - after mutations, return the refreshed room/ride board, checklist snapshot, or attendance session snapshot
  - on websocket reconnect, emit a fresh snapshot immediately

## Data Model Implications

Recommended Prisma additions:

- Allocation models
  - `LogisticsBoard` or separate `RoomAllocation` / `RideAllocation` containers scoped to a trip
  - each unit should include `id`, `tripId`, `type` (`ROOM` or `RIDE`), `label`, `capacity`, `sortOrder`, and optional metadata such as `notes`
  - `AllocationAssignment` should include `tripId`, `unitId`, `memberId`, `createdById`, `source` (`LEADER`, `SELF_JOIN`, `AUTO_FILL`), timestamps, and uniqueness preventing one member from occupying multiple units of the same type at once
- Checklist models
  - `ChecklistGroup` with `tripId`, `title`, `sortOrder`, `kind` (`SHARED_CATEGORY`, `PERSONAL_TASKS`)
  - `ChecklistItem` with `tripId`, `groupId`, `title`, `notes`, `assigneeMemberId`, `status`, `dueAt?`, and ordering fields
  - keep per-item ownership explicit even when the item belongs to a shared category
- Attendance models
  - `AttendanceSession` with `tripId`, `createdById`, `title`, `meetingLabel`, `meetingAddress`, `lat?`, `lng?`, `opensAt`, `closesAt`, `status`
  - `AttendanceSubmission` with `sessionId`, `memberId`, `photoUrl` or stored asset reference, `submittedAt`, `lat?`, `lng?`, `accuracyMeters?`, `locationStatus` (`GRANTED`, `DENIED`, `UNAVAILABLE`)
  - optional derived fields such as `distanceMeters` should be computed on read instead of persisted unless needed for audit

Important constraints:
- enforce unique occupancy per type, for example one member cannot be in two ride slots at once
- enforce capacity server-side in transactions
- keep assignment ordering explicit for deterministic board rendering

## API Surface

Use dedicated feature modules rather than expanding `trips`:

- Allocation
  - `GET /trips/:tripId/logistics/allocations`
  - `POST /trips/:tripId/logistics/units`
  - `PATCH /trips/:tripId/logistics/units/:unitId`
  - `DELETE /trips/:tripId/logistics/units/:unitId`
  - `POST /trips/:tripId/logistics/assignments/self-join`
  - `POST /trips/:tripId/logistics/assignments/reassign`
  - `POST /trips/:tripId/logistics/auto-fill`
- Checklist
  - `GET /trips/:tripId/checklists`
  - `POST /trips/:tripId/checklists/groups`
  - `PATCH /trips/:tripId/checklists/groups/:groupId`
  - `POST /trips/:tripId/checklists/items`
  - `PATCH /trips/:tripId/checklists/items/:itemId`
  - `POST /trips/:tripId/checklists/items/:itemId/toggle`
- Attendance
  - `GET /trips/:tripId/attendance/sessions/current`
  - `POST /trips/:tripId/attendance/sessions`
  - `POST /attendance/sessions/:sessionId/submissions`
  - `POST /attendance/sessions/:sessionId/close`

Implementation note: every successful mutation should return a full refreshed snapshot for its feature area to match the current web app's server-backed style.

## UI Flow

- Extend the trip workspace rather than sending users to a disconnected admin page.
- Allocation UI should feel like a visible planning board:
  - one lane for rooms, one lane for rides, or a toggle between them
  - cards for slots/vehicles/rooms with capacity badges
  - drag-and-drop for leader
  - clear self-join action for members on open slots
  - assisted/random fill as an explicit leader button, not hidden behavior
- Checklist UI should avoid a sterile task manager feel:
  - shared categories as collapsible sections
  - personal tasks visible in the same surface but visually distinct
  - quick assign / unassign controls for leader
- Attendance UI should optimize for mobile friction:
  - one large CTA to open camera or upload selfie
  - lightweight location permission prompt
  - clear states such as `da den`, `thieu vi tri`, `chua nop`
  - dashboard should surface missing members first

## Realtime Strategy

- Reuse the vote gateway pattern:
  - join session room
  - emit fresh snapshot on room join for reconnect recovery
  - broadcast session updates after each submission or session state change
- Restrict realtime to attendance first. This matches the highest operational urgency and keeps allocation/checklist complexity lower.
- For allocation and checklist, start with REST + refetch or short polling. Only add live occupancy sync later if user testing proves it necessary.

## Browser And Platform Constraints

- Camera capture
  - mobile browsers may block direct camera access without HTTPS or user gesture
  - always provide file input fallback in addition to `getUserMedia`
- Geolocation
  - must gracefully degrade when permission is denied
  - browser coordinates can be noisy, so store `accuracyMeters` and do not overstate precision
- Assets
  - there is no visible photo upload pipeline in the current scan, so planning should either introduce a minimal upload/storage path or define a temporary local/test-only proof strategy for the first iteration

## Don’t Hand-Roll

- Don’t build a hidden optimizer for allocations. The chosen product direction is visible, leader-steerable planning.
- Don’t rely on client-only occupancy checks; capacity and duplicate-assignment rules must be enforced in Prisma transactions.
- Don’t make geolocation mandatory for successful check-in when the product decision says location is attached when available.
- Don’t turn checklist completion into free-form text logs when boolean completion plus ownership is enough for phase scope.
- Don’t spread logistics across many top-level routes if the trip workspace can host the flows coherently.

## Common Pitfalls

- Simultaneous self-join attempts can overbook a slot unless capacity is checked and written atomically.
- Drag-and-drop assignment without fallback controls can feel brittle on mobile.
- Camera and geolocation permissions fail often in desktop localhost or non-secure contexts, so the UX must communicate fallback paths clearly.
- If attendance dashboards depend only on websocket deltas, reconnects will drift. Snapshot-on-join is mandatory.
- If checklist items are not clearly separated by shared category versus personal ownership, the combined model will feel messy rather than flexible.

## Sequencing Advice

1. Build room/ride persistence and leader/member assignment rules first.
2. Add board UI with self-join and override next.
3. Add checklist groups and item ownership after the trip logistics shell exists.
4. Build attendance sessions and proof submission after upload/camera approach is nailed down.
5. Add websocket-backed attendance dashboard last, after attendance snapshot shape is stable.

This sequence lowers risk because attendance depends on the most environment-sensitive browser features, while allocation and checklist are easier to stabilize first.

## Validation Architecture

- Unit test allocation capacity checks, duplicate-assignment prevention, self-join rules, and leader override rules.
- Unit test checklist assignment, toggle, and category ordering behavior.
- Unit test attendance session window validation and optional-location submission rules.
- Add API e2e tests for:
  - leader creates room/ride units and reassigns members
  - member self-joins only when capacity is available
  - leader creates checklist groups/items and assigns ownership
  - leader opens attendance session and member submits proof
- Add frontend interaction tests for:
  - allocation board rendering and leader move controls
  - member self-join affordance and occupied-state updates
  - checklist group/item editing
  - attendance capture flow with camera/upload fallback states

## Recommended Planning Decisions

- Keep Phase 3 split into three plans aligned with roadmap 3.1, 3.2, and 3.3.
- Use trip-scoped snapshot APIs for every logistics feature area.
- Reuse websocket snapshot-on-join only for attendance in the first pass.
- Make photo proof require a browser image source but not hard-require granted geolocation.
- Keep all leader override and capacity rules server-side and transaction-backed.

## Bottom Line

If planning stays aligned with the locked context, Phase 3 should be treated as three connected but separable problems: visible group allocation, shared coordination checklists, and proof-based attendance. The safest path is to make trip-scoped logistics state trustworthy first, then add the more permission-sensitive browser and realtime layers on top.
