# Phase 2 Research: the-itinerary-engine

## Executive Takeaway

Phase 2 should be built as a trip-scoped itinerary platform where the timeline is the single source of truth. Maps, voting, and community templates must read from and write back to that timeline instead of maintaining parallel state.

Current codebase signals:
- The API is still plain REST + NestJS + Prisma, with no websocket gateway yet.
- The web app already has a public trip preview route at [`apps/web/src/app/trip/[joinCode]/page.tsx`](../../../apps/web/src/app/trip/[joinCode]/page.tsx) and a lightweight auth restore pattern in [`apps/web/src/store/useAuthStore.ts`](../../../apps/web/src/store/useAuthStore.ts).
- Trip persistence is currently minimal in [`packages/database/prisma/schema.prisma`](../../../packages/database/prisma/schema.prisma), so Phase 2 needs new itinerary, vote, and template entities rather than extending an existing rich model.

Confidence: high on the stack and architecture shape, medium on the exact entity split until planning confirms final task boundaries.

## Standard Stack

- Use NestJS modules, controllers, DTOs, guards, and Prisma transactions for all phase 2 mutations.
- Keep REST for itinerary CRUD, proposal review, template publishing, and template cloning.
- Add websockets only for live vote-room updates and vote result broadcasts. Do not use websockets for structural timeline editing.
- Keep React client state thin. Let the server own canonical state and use refetches after writes.
- Keep auth and permission checks server-side in service methods, not just in the UI.

## Architecture Patterns

- Model everything as trip-scoped.
- Represent itinerary order explicitly and deterministically. Use `dayIndex` plus a stable `sortOrder` for each activity instead of letting the client infer order.
- Treat untimed items as first-class records with null time fields and a visible `chua chot gio` state.
- Compute progress states from time and trip dates rather than storing them as mutable database truth. That keeps `sap toi`, `dang di`, and `da di` from drifting.
- Separate structure from suggestion:
  - Structural itinerary edits belong to the leader.
  - Member suggestions live in a proposal inbox and reference the target item or the proposed new item.
- Use a vote-session snapshot model:
  - A vote session owns the candidate cards.
  - Ballots belong to a session, a user, and the latest active choice.
  - Winning results still return to leader confirmation when they would replace an existing itinerary item.
- Template cloning should be a deep copy into a new trip, not a live fork. Do not keep source-template links active after clone.

## Data Model Implications

Recommended Prisma additions:

- `Trip` should probably gain `timeZone` as an IANA string if itinerary timing is evaluated by local trip time. This is the lowest-risk choice for progress-state logic and day grouping.
- `ItineraryItem`
  - `id`, `tripId`, `dayIndex`, `sortOrder`
  - `startTime` nullable, `title`, `locationName`, `shortNote`
  - optional location payload: `placeId`, `lat`, `lng`, `address`
  - `version` or `updatedAt` for stale proposal detection
- `ItineraryProposal`
  - `type` such as `UPDATE_TIME`, `UPDATE_LOCATION`, `UPDATE_NOTE`, `ADD_ITEM`
  - `payload` JSON, `status`, `proposerId`, `reviewedById`
  - `targetItemId` nullable for new-item proposals
- `VoteSession`
  - `tripId`, `mode` (`NEW_OPTION`, `REPLACE_ITEM`)
  - `deadline`, `status`, `createdById`, `approvedByLeaderAt`
  - optional `targetItemId` for replacement votes
- `VoteOption`
  - `voteSessionId`, `itineraryItemId` nullable, `label`, `payload`
- `VoteBallot`
  - `voteSessionId`, `userId`, `optionId`, `updatedAt`
  - unique constraint on `(voteSessionId, userId)` so “latest active vote counts”
- `CommunityTemplate`
  - either a dedicated model or a `Trip`-based template flag
  - include only sanitized planning content

Indexes and constraints matter:
- `TripMember @@unique([userId, tripId])` already exists; keep using that for permission checks.
- Add indexes on `tripId`, `tripId + dayIndex`, and `voteSessionId`.
- Enforce uniqueness for ordering at the database layer if possible, then renumber inside transactions after drag-and-drop writes.

## API Surface

Use feature modules rather than stuffing everything into `trips`.

- `GET /api/trips/:joinCode` stays as the public preview source.
- `GET /api/trips/:tripId/itinerary` returns the canonical grouped timeline for authenticated users.
- `POST /api/trips/:tripId/itinerary/items`
- `PATCH /api/trips/:tripId/itinerary/items/:itemId`
- `DELETE /api/trips/:tripId/itinerary/items/:itemId`
- `POST /api/trips/:tripId/itinerary/reorder`
- `GET /api/trips/:tripId/proposals`
- `POST /api/trips/:tripId/proposals/:proposalId/accept`
- `POST /api/trips/:tripId/proposals/:proposalId/reject`
- `POST /api/trips/:tripId/votes/sessions`
- `POST /api/vote-sessions/:sessionId/ballots`
- `POST /api/vote-sessions/:sessionId/approve-option`
- `POST /api/trips/:tripId/templates/publish`
- `POST /api/templates/:templateId/clone`

Implementation note: prefer returning the full refreshed itinerary snapshot after each mutation. That fits the current app’s server-backed style and reduces UI drift.

## UI Flow

- Keep the public trip page as the lightweight join/preview entry.
- After join, route users into a dedicated trip workspace with tabs or modes for Timeline, Map, and Votes.
- Timeline UI:
  - day sections expanded by default
  - leader-only drag handles
  - dedicated modal or side panel for edit/create
  - explicit delete confirmation
  - visible badges for proposal counts and progress states
- Map UI:
  - dedicated screen or mode, not embedded permanently in the timeline
  - read-only pins for resolved locations
  - day filtering that remembers the last filter
  - click-through from an itinerary item to focus the corresponding pin
- Voting UI:
  - swipe cards as the primary interaction
  - button fallback for desktop and accessibility
  - interim results visible while the session is open
  - final lock only at deadline

## Don’t Hand-Roll

- Don’t build a CRDT or real-time co-editing system. The product decision is leader-owned structural editing.
- Don’t persist progress states as manual flags if they can be derived from time.
- Don’t let the map become a second source of truth for locations or ordering.
- Don’t auto-merge stale proposals back into changed itinerary items.
- Don’t copy community templates by shallow object duplication. Deep-copy usable planning content only.
- Don’t rely on the client to enforce vote deadlines or leader permissions.

## Common Pitfalls

- Timezone and date-boundary drift will break day grouping and “current item” logic if trip-local time is not explicit.
- Drag-and-drop reorder can create collisions if sort values are not normalized in a transaction.
- Websocket clients will reconnect and miss events, so every join/reconnect must start from a snapshot fetch.
- Replacement votes are easy to misread. The UI must show the current item and the challenger item side by side.
- If a candidate location is unresolved, omit it from the map instead of guessing.
- Template cloning must strip personal or sensitive data before publishing.
- Untimed items need a clear neutral state so they do not look “delayed” or “upcoming” by accident.

## Sequencing Advice

1. Ship itinerary CRUD and permission enforcement first.
2. Add derived progress-state computation and the timeline UI second.
3. Add proposal inbox flow third, because it depends on the item model and change versioning.
4. Add websocket-backed voting after the vote-session schema is stable.
5. Add community template publishing and cloning last, once itinerary serialization is settled.
6. Build the map screen only after itinerary locations are stable and queryable.

This sequence lowers risk because every later feature depends on the timeline model being trustworthy.

## Validation Architecture

- Unit test itinerary ordering, move-between-days logic, and progress-state computation.
- Unit test permission checks for leader-only structural mutations and member proposal/vote rules.
- Unit test vote deadline closure, tie-break behavior, and “latest active vote wins”.
- Unit test template cloning sanitization and deep-copy behavior.
- Add API e2e tests for:
  - public preview vs authenticated workspace
  - leader vs member authorization
  - drag/reorder persistence
  - websocket join/reconnect and event replay
  - vote approval and deadline locking
  - clone/publish flow
- Add frontend interaction tests for drag-and-drop, edit modal behavior, and swipe fallback.

## Code Examples

Canonical write pattern:

```ts
await this.prisma.$transaction(async (tx) => {
  const item = await tx.itineraryItem.update({
    where: { id: itemId },
    data: {
      dayIndex,
      sortOrder,
      startTime,
      title,
      locationName,
      shortNote,
      version: { increment: 1 },
    },
  });

  return this.getTripItinerarySnapshot(tx, tripId);
});
```

Vote-session flow:

```ts
// Server creates snapshot, client only renders cards and sends ballots.
// Every reconnect should fetch the current session snapshot before listening for deltas.
```

## Recommended Planning Decisions

- Use `dayIndex + sortOrder` as the canonical timeline ordering scheme.
- Use server-computed itinerary snapshots as the primary API response shape.
- Use websocket events only for vote room updates, not general itinerary editing.
- Use a dedicated template model or a clearly flagged template-trips table, but sanitize before publish.
- Add `Trip.timeZone` if planning wants accurate progress states and day boundaries.

## Bottom Line

If planning stays aligned with the locked context, Phase 2 should be treated as three related but separate problems: deterministic itinerary CRUD, live voting, and one-way template cloning. The safest implementation path is to make the timeline model solid first, then layer collaboration on top of it, and keep the map as a projection of the timeline rather than a competing editor.
