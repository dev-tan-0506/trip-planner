# Phase 4 Research: finances-safety

## Executive Takeaway

Phase 4 should be implemented as a trip-scoped operations layer added to the existing trip workspace, split into three coordinated tracks:

- centralized group fund management with QR-based contribution guidance and summary-first burn-rate visibility
- itinerary-aware safety intelligence for weather, crowd pressure, and verified emergency services
- urgent escalation flows for SOS and cultural-sensitivity warnings, using browser-visible alerts instead of native background behavior

Current codebase signals:
- The trip experience already clusters around one shell in [`apps/web/src/components/trip/TripWorkspaceShell.tsx`](../../../apps/web/src/components/trip/TripWorkspaceShell.tsx), which is the best anchor for finance and safety surfaces.
- The data model in [`packages/database/prisma/schema.prisma`](../../../packages/database/prisma/schema.prisma) already centers on `Trip` and `TripMember`, but it has no fund, expense, safety directory, weather, or SOS entities yet.
- Existing feature APIs in [`apps/web/src/lib/api-client.ts`](../../../apps/web/src/lib/api-client.ts) consistently use trip-scoped snapshot responses, so finance and safety should follow the same pattern instead of introducing thin endpoint fragments.
- Realtime patterns already exist in [`apps/api/src/votes/votes.gateway.ts`](../../../apps/api/src/votes/votes.gateway.ts) and phase 3 attendance, so SOS can reuse socket-style broadcasting if immediate group notification is required.

Confidence: high on the phase split and architecture shape, medium on third-party data integrations because provider specifics are not yet chosen in the repo.

## Standard Stack

- Use NestJS feature modules, controllers, DTOs, and Prisma-backed services for all finance and safety mutations.
- Keep finance and safety reads trip-scoped and snapshot-based:
  - `GET /trips/:tripId/fund`
  - `GET /trips/:tripId/safety`
  - after writes, return refreshed snapshots for the relevant surface
- Prefer REST for fund and safety CRUD plus websocket notification only where urgency matters:
  - fund state can start with REST + refetch
  - SOS alerts may justify dedicated realtime broadcast
- Keep browser-only or external-provider concerns isolated:
  - QR rendering on the web client
  - weather/crowd/safety lookups in server-side services
  - browser banners / toasts for live warnings

## Architecture Patterns

- Model everything as trip-scoped and membership-aware.
- Preserve the leader-first structural authority pattern from prior phases:
  - leader initializes or controls fund structure in V1
  - members can view progress and confirm participation in bounded flows
- Keep finance as a summary-first operational surface:
  - collected amount
  - target amount
  - spent amount
  - remaining amount
  - burn-rate warning state
- Treat safety as contextual trip intelligence, not a separate generic travel portal:
  - upcoming-weather cards should bias toward itinerary dates and destinations
  - crowd signals should highlight likely pressure at relevant attractions
  - safety directory should surface directly usable contacts/actions
- Treat SOS as an event, not a passive record:
  - one mutation creates a high-priority trip alert
  - group members receive visible notification state
  - the alert links immediately to support information or location context

## Data Model Implications

Recommended Prisma additions:

- Fund and contribution models
  - `TripFund` with `tripId`, `targetAmount`, `currency`, `momoQrPayload?`, `bankQrPayload?`, `ownerTripMemberId`, `status`, timestamps
  - `FundContribution` with `tripFundId`, `tripMemberId`, `declaredAmount`, `method` (`MOMO`, `BANK_TRANSFER`, `CASH`, `OTHER`), `status` (`PLEDGED`, `CONFIRMED`, `REJECTED`), optional transfer note/proof, timestamps
  - `FundExpense` with `tripFundId`, `title`, `amount`, `category`, `linkedItineraryItemId?`, `incurredAt`, `createdByTripMemberId`
- Safety data models
  - `TripSafetySnapshot` or separate provider cache models keyed by trip/date/location for weather and crowd summaries
  - `SafetyDirectoryEntry` with `tripId` or `destinationRegionKey`, `kind` (`MECHANIC`, `PHARMACY`, `CLINIC`, `POLICE`, `HOSPITAL`), `title`, `phone`, `address`, `lat?`, `lng?`, `source`, `verifiedAt?`
  - `SafetyAlert` with `tripId`, `type` (`SOS`, `CULTURAL_WARNING`, `CROWD_WARNING`, `WEATHER_WARNING`), `status`, `message`, `createdByTripMemberId?`, `linkedItineraryItemId?`, timestamps

Important constraints:
- keep fund totals derivable from persisted records rather than trusting client-side math
- avoid payment-provider-specific lock-in in the initial schema; store normalized QR payloads or display-ready metadata
- keep external forecast/crowd data cacheable because upstream providers will be slower and rate-limited compared with core trip data
- store SOS and warning events with enough metadata for replay in the UI after refresh

## API Surface

Recommended modules and routes:

- Fund
  - `GET /trips/:tripId/fund`
  - `POST /trips/:tripId/fund`
  - `PATCH /trips/:tripId/fund`
  - `POST /trips/:tripId/fund/contributions`
  - `POST /trips/:tripId/fund/contributions/:contributionId/confirm`
  - `POST /trips/:tripId/fund/expenses`
- Safety
  - `GET /trips/:tripId/safety/overview`
  - `GET /trips/:tripId/safety/directory`
  - `GET /trips/:tripId/safety/warnings`
  - `POST /trips/:tripId/safety/sos`
  - `POST /trips/:tripId/safety/alerts/:alertId/acknowledge`

Implementation note: every mutating endpoint should return a refreshed snapshot for its surface area to fit the current app’s server-backed style.

## UI Flow

- Extend the trip workspace rather than creating a detached admin area.
- A finance/safety tab can combine:
  - summary cards for fund health
  - contribution CTA with QR reveal
  - safety forecast cards
  - emergency directory quick actions
  - SOS trigger area pinned or clearly separated
- Finance UI should feel reassuring:
  - large target/progress numbers
  - clear “how to contribute” instructions
  - warning chips when spending pressure rises
- Safety UI should feel action-first:
  - “what to watch next” above “reference info”
  - phone/map quick actions for directory cards
  - warnings attached to itinerary or destination context where possible
- SOS UI should be visually distinct from playful trip planning:
  - one obvious CTA
  - visible sent state
  - persistent alert banner or feed item after activation

## Realtime Strategy

- Reuse the socket gateway approach for SOS if the group needs immediate alerting in-browser.
- Keep weather/crowd updates pull-based at first; they do not need realtime sockets in V1.
- Cultural warnings can be recalculated on itinerary/safety snapshot reads instead of requiring a continuous stream.

## Browser And Platform Constraints

- The web app cannot rely on native background geofencing, so cultural warnings should be based on visible itinerary/location context, not locked-screen monitoring.
- QR presentation is easy on web, but actual payment confirmation is not guaranteed without provider integrations. Plan V1 around guided contribution plus app-side confirmation flows.
- Safety directory usefulness depends on data source quality; provider normalization and graceful empty states are essential.
- External forecast and crowd providers may fail or rate-limit, so cached server-side reads and fallback messaging are necessary.

## Don’t Hand-Roll

- Don’t build a full accounting ledger UI before the summary-first fund experience exists.
- Don’t tie V1 money collection to deep payment-provider verification if the product goal is coordination first.
- Don’t assume native emergency behaviors such as background alarms, persistent OS notifications, or locked-screen location tracking.
- Don’t scatter safety content across unrelated routes when the trip workspace can host it coherently.
- Don’t make crowd or cultural warnings appear “smart” without clear itinerary/location grounding; vague warnings will feel noisy and untrustworthy.

## Common Pitfalls

- A fund model without clear contribution states will confuse whether money is pledged, sent, or confirmed.
- Summary cards without underlying expense records will create drift between displayed burn rate and actual spending.
- Weather/crowd views that ignore itinerary dates will feel generic rather than trip-specific.
- Safety directories without fast actions (call/open map) will add information but not reduce stress in urgent moments.
- SOS flows that only write a record without broadcasting visible UI state will fail the core urgency promise.

## Sequencing Advice

1. Build fund persistence, contribution snapshots, and summary math first.
2. Add QR presentation and contribution confirmation UI next.
3. Layer weather/crowd/directory read models after the finance shell exists.
4. Add SOS alert creation and broadcast after safety snapshots are stable.
5. Add contextual cultural warning surfaces last, once itinerary-aware safety reads exist.

This sequence lowers risk because finance and safety directory data are more deterministic than urgent alert flows, while warning logic benefits from already-structured trip context.

## Validation Architecture

- Unit test fund math, contribution-state transitions, expense aggregation, and leader-only structural controls.
- Unit test provider adapters or normalization logic for weather, crowd, and safety directory data.
- Unit test SOS alert authorization, broadcast triggering, and acknowledgement state transitions.
- Add API e2e tests for:
  - leader creates or updates the trip fund
  - member submits a contribution confirmation
  - burn-rate snapshot reflects added expenses
  - safety overview returns weather/crowd/directory payloads
  - SOS creates an alert visible in refreshed trip safety snapshots
- Add frontend interaction tests for:
  - finance summary cards and contribution QR reveal
  - member contribution flow and leader confirmation path
  - safety overview card rendering and empty states
  - SOS trigger state and persistent alert banner rendering

## Recommended Planning Decisions

- Keep Phase 4 split into three plans aligned with roadmap 4.1, 4.2, and 4.3.
- Use trip-scoped snapshot APIs for fund and safety read surfaces.
- Keep provider-specific integrations behind service boundaries so later benchmarking or native expansion stays flexible.
- Treat leader-as-treasurer as the default V1 authority path unless the plan explicitly introduces a treasurer assignment mechanism.
- Use realtime only for SOS and other truly urgent alert states; keep the rest of phase 4 mostly REST-backed.

## Bottom Line

If planning stays aligned with the locked context, Phase 4 should be treated as three connected but separable problems: coordinated fund collection, contextual safety intelligence, and urgent group alerts. The safest path is to establish trustworthy finance and safety snapshots first, then add the faster-moving alert and warning behaviors on top.
