# Cross-AI Plan Review Request

You are reviewing implementation plans for a software project phase.
Provide structured feedback on plan quality, completeness, and risks.

## Project Context
# Mình Đi Đâu Thế

## What This Is

A comprehensive, all-in-one trip planning web application (PWA) for solo travelers, friend groups, and large collectives. The app provides an end-to-end experience: from destination selection, itinerary building, budget estimation, to task delegation, with a Phase 2 vision for a Native Mobile App to handle deep-tech features like offline mesh networking.

## Core Value

Maximum convenience and the total elimination of group-travel "pain points" by centralizing itinerary, finances, logistics, and memories into a single, seamless web platform requiring zero app installation for onboarding.

## Requirements

### Validated

<!-- Shipped and confirmed valuable. -->

(None yet — ship to validate)

### Active (V1 Web App PWA)

<!-- Current scope. Building toward these. -->

- [ ] **Flexible Planning & 1-Click Marketplace:** Support diverse group sizes. Provide a Community Template Library (copy an itinerary with 1 click). Integrate a Tinder-style swipe feature to vote on food/activities via Web.
- [ ] **Culinary Routing:** "Route by stomach." After selecting desired food spots, AI automatically drafts the most logical geographical route.
- [ ] **AI Outfit Planner (Optional):** AI suggests outfit colors/styles based on the destination's weather/scenery.
- [ ] **Smart Room & Ride Allocation:** Drag-and-drop web UI to distribute people into cars/rooms via 3 modes (Leader manual, Member auto-register, Randomizer).
- [ ] **Photo-Proof Check-in (Web-based):** Leader sets gathering points. Members must upload/take a selfie (via browser camera) to confirm "Arrived".
- [ ] **Auto-parsing Hub:** AI scans forwarded emails, extracting booking codes into Timeline slots.
- [ ] **Dynamic Itinerary & Profile Matching:** Displays timeline. Red-alerts if an added spot violates the group's health/dietary profile.
- [ ] **Local Expert AI & Cultural Warning:** Translates menus, suggests hidden gems. Warns about culturally sensitive areas.
- [ ] **Local Cost Benchmarking:** Cross-references planned expenses with Big Data to alert users of rip-offs.
- [ ] **Smart To-do & Logistics:** Leader delegates shared packing items. Tracks completion status.
- [ ] **Fund Management & Expenses:** Centralized pool managed by treasurer, MoMo/Bank QR codes for money collection.
- [ ] **Digital Vault:** Cloud drive to gather ID cards and flight tickets for the Leader.
- [ ] **Souvenir Planner:** Recommends local specialties and sends reminders.
- [ ] **Smart Discovery & AI Daily Podcast:** Weather forecasting and an end-of-day audio broadcast summing up the trip.
- [ ] **Reunion Organizer:** Sends e-invites for a post-trip meetup.
- [ ] **On-demand Concierge & SOS:** Quick access to local mechanics or medical support. Basic Web SOS button.
- [ ] **Anonymous Post-trip Feedback:** Fun, incognito survey at the end of the trip.

### Out of Scope (Deferred to Phase 2 / Native App)

<!-- Explicit boundaries. Includes reasoning to prevent re-adding. -->

- **[Offline Mode & Bluetooth Mesh Network]** — Browsers cannot broadcast BLE mesh networks. Deferred to Mobile App.
- **[Continuous Background Live Location tracking]** — Web apps lose GPS context when screen locks. Deferred to Mobile App.
- [Auto-vlog render / AR Memories / Luggage Teleportation] — Excluded from V1 to prioritize core development resources.
- [Automated Split Bill] — V1 strictly utilizes a centralized "Group Fund" approach.
- [Real-time Co-editing Itinerary] — V1 strictly assigns itinerary modification rights only to the Leader.

## Context

- The product is positioned as a viral web-based "Tour Guide" tool to organically attract users before unlocking broad Native App capabilities. Rapid Web onboarding (no install required) is the primary acquisition strategy.

## Constraints

- **[Usability & Access]**: Must be fully accessible via a URL. Users should join a trip instantly from Zalo/Messenger without downloading an app.
- **[Language & Tone of Voice]**: The App UI/UX must be strictly 100% Vietnamese. The tone must be intensely friendly, intimate, and casual.

## Key Decisions

<!-- Decisions that constrain future work. Add throughout project lifecycle. -->

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| [Web App First Strategy] | Optimizes viral onboarding and complex UI building over deep-tech tracking. | — Pending |
| [Centralized Fund over Split Bill] | Easier to control risks and guarantee upfront capital. | — Pending |

---
*Last updated: 2026-03-28 (Pivoted to Web App V1)*

## Phase 4: Finances & Safety
### Roadmap Section
## Phase 4: Finances & Safety
**Focus**: Money collection, weather parsing, and SOS alerts.
- [ ] 4.1: Group Fund Management & MoMo QR Integration (FINA-01, FINA-02, FINA-03).
- [ ] 4.2: Weather, Crowd predictions, and Safety Directory (SAFE-01, SAFE-02, SAFE-04).
- [ ] 4.3: Web-based SOS and Cultural Warning popups (SAFE-03, SAFE-05).

### Requirements Addressed
### FINA: Finances & Fund
- [ ] **FINA-01**: Treasurer can create a centralized "Group Fund" target amount.
- [ ] **FINA-02**: Treasurer can display a unified MoMo/Bank QR code for members to send their fund contributions.
- [ ] **FINA-03**: Members can view the total fund pool and the percentage spent vs. budget (Burn Rate).
- [ ] **FINA-04**: System flags planned expenses if they significantly exceed "Local Cost Benchmarking" data.
### SAFE: Safety & Alerts
- [ ] **SAFE-01**: User can view a 5-day weather forecast specific to the upcoming itinerary locations.
- [ ] **SAFE-02**: User can view real-time crowd predictions for major tourist attractions.
- [ ] **SAFE-03**: User can press a Web-based SOS button to send a high-priority alert to all group members.
- [ ] **SAFE-04**: User can access a localized directory of verified mechanics, pharmacies, and clinics.
- [ ] **SAFE-05**: System flashes browser warnings when the group approaches culturally sensitive locations (e.g., dress codes for temples).

### User Decisions (CONTEXT.md)
# Phase 4: Finances & Safety - Context

**Gathered:** 2026-03-30
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the operational trust layer for a trip: centralized group-fund management, contribution QR collection, burn-rate visibility, weather and crowd awareness, emergency service lookup, SOS escalation, and cultural-sensitivity warnings. This phase focuses on financial coordination and situational safety during the trip, not itinerary editing, offline tracking, or post-trip memory flows.

</domain>

<decisions>
## Implementation Decisions

### Group Fund Authority
- **D-01:** The phase should preserve the existing leader-first control model. For V1, the leader is the default financial authority who can initialize and manage the centralized fund instead of introducing a separate permission system first.
- **D-02:** Members can view fund progress and contribution instructions, but structural fund settings remain controlled by the leader-facing authority path.
- **D-03:** Finance actions should feel transparent and reassuring rather than accounting-heavy. The UI should emphasize shared trip readiness, not expense bureaucracy.

### Contribution And QR Collection
- **D-04:** The fund contribution flow should center on one unified payment surface that can display both MoMo and bank-transfer QR options when configured.
- **D-05:** V1 should treat contributions as app-recorded confirmations around a displayed QR target, not as direct payment-provider webhook verification.
- **D-06:** Members should always understand the current target amount, how much has been collected, and what action they are expected to take next from the same surface.

### Fund Visibility And Burn Rate
- **D-07:** Burn rate should be communicated as a simple shared-trip health view: collected, spent, remaining, and percentage-used are the primary signals.
- **D-08:** Budget visibility should stay trip-scoped and lightweight, with strong emphasis on summary cards and warning states rather than dense ledger tables as the default view.
- **D-09:** Local cost benchmarking should appear as a warning or caution layer attached to planned spending context, not as a separate analytical dashboard.

### Forecast And Safety Awareness
- **D-10:** Weather and crowd signals should be itinerary-aware where possible, using upcoming locations/dates as the main context for what is shown first.
- **D-11:** Safety information should be surfaced in practical, action-oriented modules: forecast outlook, crowd pressure, and verified emergency-directory cards.
- **D-12:** Cultural warnings should be shown as contextual browser-visible alerts tied to locations or itinerary moments, not as background geofencing that assumes native mobile capabilities.

### SOS And Escalation
- **D-13:** SOS should be a deliberate high-priority web action that alerts the group immediately and clearly, rather than a hidden secondary menu item.
- **D-14:** The SOS experience should prioritize speed and clarity: one obvious trigger, visible state after sending, and immediate access to the relevant support directory or trip contacts.
- **D-15:** As with earlier phases, the product should enable members to act quickly in urgent flows while still keeping the trip context understandable to the leader and the rest of the group.

### the agent's Discretion
- Exact visual treatment for finance summary cards, as long as contribution progress and burn-rate health remain instantly scannable.
- Exact grouping and ordering of safety widgets inside the trip workspace, as long as urgent information appears before passive informational content.
- Exact copy and motion style for SOS escalation, as long as it stays serious, clear, and distinct from playful planning surfaces.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Product Scope
- `.planning/ROADMAP.md` — Defines Phase 4 scope: group fund management, QR collection, weather/crowd awareness, safety directory, SOS, and cultural warnings.
- `.planning/PROJECT.md` — Web-first strategy, Vietnamese-only UX, centralized fund direction, and no-install constraints.
- `.planning/REQUIREMENTS.md` — Functional requirements for FINA-01, FINA-02, FINA-03, FINA-04, SAFE-01, SAFE-02, SAFE-03, SAFE-04, and SAFE-05.

### Prior Decisions
- `.planning/phases/01-foundation-onboarding/01-CONTEXT.md` — Establishes web-first onboarding, playful Vietnamese UI, and leader-controlled structural authority.
- `.planning/phases/02-the-itinerary-engine/02-CONTEXT.md` — Carries forward timeline-as-source-of-truth thinking and the principle that support layers should cluster around the trip workspace.
- `.planning/phases/03-logistics-attendance/03-CONTEXT.md` — Carries forward leader authority with bounded member participation, trip-scoped coordination modules, and practical real-time operational surfaces.

### Existing Implementation Context
- `apps/web/src/components/trip/TripWorkspaceShell.tsx` — Existing trip workspace tabs, leader/member branching, floating actions, and the main place where new finance/safety surfaces should integrate.
- `apps/web/src/lib/api-client.ts` — Current typed REST clients and trip-scoped snapshot patterns used by itinerary, logistics, checklist, and attendance.
- `packages/database/prisma/schema.prisma` — Current trip, member, logistics, checklist, and attendance models that Phase 4 will extend for finance and safety data.
- `apps/api/src/trips/trips.service.ts` — Existing trip membership and role checks that can anchor financial and safety authorization.
- `apps/web/src/components/trip/AttendanceTab.tsx` — Current example of an operational trip module with urgent-state handling and mobile-friendly action design.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `apps/web/src/components/trip/TripWorkspaceShell.tsx`: Existing trip workspace shell already clusters multiple operational tabs behind one trip-centric interface and handles leader/member branching cleanly.
- `apps/web/src/lib/api-client.ts`: Established typed client pattern favors trip-scoped snapshot APIs and small feature modules instead of ad-hoc fetch calls.
- `packages/database/prisma/schema.prisma`: Current relational model already centers everything on `Trip` and `TripMember`, which is a strong base for adding fund and safety entities.
- `apps/web/src/components/trip/AttendanceTab.tsx`: Reusable pattern for urgency-aware CTA placement, status cards, and operational trip workflows.

### Established Patterns
- The product keeps one trip workspace as the operational home instead of scattering related features across many disconnected screens.
- Leader-controlled structural authority remains the dominant governance pattern, while members can participate inside bounded action paths.
- Existing feature APIs favor explicit trip-scoped routes plus snapshot responses that refresh the UI state after mutations.
- Web-first constraints rule out background-native assumptions, so safety alerts and cultural warnings should rely on visible browser-session surfaces.

### Integration Points
- Phase 4 will likely add new Prisma models for fund state, contribution records, planned/spent expense markers, safety resource entries, and alert events.
- New finance and safety APIs should follow the same feature-module style already used for logistics, checklist, and attendance in both NestJS and the web client.
- The trip workspace is the most natural host for a new finance/safety surface, with possible sub-tabs or cards under the same trip-scoped shell.
- Any high-priority SOS or live warning behavior can likely reuse the existing realtime patterns already introduced for votes and attendance if immediacy becomes necessary.

</code_context>

<specifics>
## Specific Ideas

- Finance should feel like “cả nhóm đang góp đủ để chuyến đi chạy mượt” rather than a mini accounting app.
- Safety surfaces should prioritize what the group needs to act on next, not overwhelm them with generic travel content.
- SOS must feel serious and immediate, with tone more practical than playful.

</specifics>

<deferred>
## Deferred Ideas

None — analysis stayed within phase scope.

</deferred>

---

*Phase: 04-finances-safety*
*Context gathered: 2026-03-30*

### Research Findings
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

### Plans to Review
#### 04-01-PLAN.md
---
phase: 04-finances-safety
plan: "01"
type: execute
wave: 1
depends_on: []
files_modified:
  - packages/database/prisma/schema.prisma
  - apps/api/src/app.module.ts
  - apps/api/src/fund/fund.module.ts
  - apps/api/src/fund/fund.controller.ts
  - apps/api/src/fund/fund.service.ts
  - apps/api/src/fund/dto/create-trip-fund.dto.ts
  - apps/api/src/fund/dto/create-fund-contribution.dto.ts
  - apps/api/src/fund/dto/create-fund-expense.dto.ts
  - apps/api/src/fund/fund.service.spec.ts
  - apps/api/test/phase-04-finance-safety.e2e-spec.ts
  - apps/web/src/lib/api-client.ts
  - apps/web/src/components/trip/TripWorkspaceShell.tsx
  - apps/web/src/components/trip/FinanceSafetyTab.tsx
  - apps/web/src/components/trip/FundOverviewPanel.tsx
  - apps/web/src/components/trip/FundContributionSheet.tsx
  - apps/web/src/components/trip/__tests__/finance-safety-panel.test.tsx
autonomous: true
requirements:
  - FINA-01
  - FINA-02
  - FINA-03
user_setup: []
must_haves:
  truths:
    - The trip has one centralized fund snapshot with a target amount, contribution progress, and burn-rate visibility.
    - The leader-first control model stays intact: structural fund setup is leader-controlled, while members can view and submit contribution confirmations in bounded flows.
    - Fund progress and QR contribution guidance are visible inside the trip workspace as a first-class surface rather than a hidden admin route.
  artifacts:
    - path: packages/database/prisma/schema.prisma
      contains: model TripFund
      min_lines: 260
    - path: apps/api/src/fund/fund.service.ts
      contains: getFundSnapshot
      min_lines: 180
    - path: apps/web/src/components/trip/FinanceSafetyTab.tsx
      contains: Quỹ chung
      min_lines: 180
    - path: apps/web/src/components/trip/FundContributionSheet.tsx
      contains: MoMo
      min_lines: 80
  key_links:
    - from: apps/api/src/fund/fund.controller.ts
      to: apps/api/src/fund/fund.service.ts
      via: trip-scoped fund endpoints delegate to the canonical fund snapshot service.
      pattern: this\.fundService\.
    - from: apps/web/src/components/trip/TripWorkspaceShell.tsx
      to: apps/web/src/components/trip/FinanceSafetyTab.tsx
      via: the trip workspace mounts the finance and safety surface as a first-class trip tab.
      pattern: FinanceSafetyTab
---

<objective>
Create the fund-management foundation for Phase 4.

Purpose: Make group money collection trustworthy before weather, directory, and urgent alert layers are added on top.
Output: Prisma fund models, NestJS fund APIs, fund summary UI with QR contribution guidance, and validation coverage.
</objective>

<execution_context>
@C:/Users/quoct/OneDrive/Desktop/code/designapp/trip-planner/.codex/get-shit-done/workflows/execute-plan.md
@C:/Users/quoct/OneDrive/Desktop/code/designapp/trip-planner/.codex/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/REQUIREMENTS.md
@.planning/phases/04-finances-safety/04-CONTEXT.md
@.planning/phases/04-finances-safety/04-RESEARCH.md
@.planning/phases/04-finances-safety/04-VALIDATION.md
@apps/web/src/components/trip/TripWorkspaceShell.tsx
@apps/web/src/lib/api-client.ts
@apps/api/src/trips/trips.service.ts
@packages/database/prisma/schema.prisma
</context>

<tasks>
<task type="auto">
  <name>Task 1: Add centralized fund and contribution models to Prisma</name>
  <files>packages/database/prisma/schema.prisma</files>
  <read_first>
    packages/database/prisma/schema.prisma
    .planning/phases/04-finances-safety/04-CONTEXT.md
    .planning/phases/04-finances-safety/04-RESEARCH.md
  </read_first>
  <action>
    Extend packages/database/prisma/schema.prisma with the Phase 4 fund domain.
    1. Add enum FundContributionMethod with MOMO, BANK_TRANSFER, CASH, and OTHER.
    2. Add enum FundContributionStatus with PLEDGED, CONFIRMED, and REJECTED.
    3. Add model TripFund with fields id String @id @default(cuid()), tripId String @unique, ownerTripMemberId String, targetAmount Decimal, currency String @default("VND"), momoQrPayload String?, bankQrPayload String?, status String @default("ACTIVE"), createdAt DateTime @default(now()), updatedAt DateTime @updatedAt; relate it to Trip, TripMember, FundContribution, and FundExpense.
    4. Add model FundContribution with fields id String @id @default(cuid()), tripFundId String, tripMemberId String, declaredAmount Decimal, method FundContributionMethod, status FundContributionStatus @default(PLEDGED), transferNote String?, createdAt DateTime @default(now()), updatedAt DateTime @updatedAt; add @@index([tripFundId, status]).
    5. Add model FundExpense with fields id String @id @default(cuid()), tripFundId String, createdByTripMemberId String, title String, amount Decimal, category String, linkedItineraryItemId String?, incurredAt DateTime, createdAt DateTime @default(now()), updatedAt DateTime @updatedAt; relate it to TripFund and TripMember, and add @@index([tripFundId, incurredAt]).
    6. Add relation fields on Trip and TripMember so the trip exposes tripFund, fundContributions, and fundExpenses while TripMember exposes ownedFund, submittedFundContributions, and createdFundExpenses.
  </action>
  <verify>npm exec prisma validate</verify>
  <acceptance_criteria>
    - packages/database/prisma/schema.prisma contains "model TripFund"
    - packages/database/prisma/schema.prisma contains "model FundContribution"
    - packages/database/prisma/schema.prisma contains "model FundExpense"
    - packages/database/prisma/schema.prisma contains "enum FundContributionMethod"
    - packages/database/prisma/schema.prisma contains "MOMO"
    - packages/database/prisma/schema.prisma contains "BANK_TRANSFER"
    - packages/database/prisma/schema.prisma contains "currency String @default(\"VND\")"
  </acceptance_criteria>
  <done>The schema can persist one trip fund, member contribution confirmations, and recorded trip expenses.</done>
</task>

<task type="auto">
  <name>Task 2: Implement fund snapshot APIs and leader-first controls</name>
  <files>apps/api/src/app.module.ts, apps/api/src/fund/fund.module.ts, apps/api/src/fund/fund.controller.ts, apps/api/src/fund/fund.service.ts, apps/api/src/fund/dto/create-trip-fund.dto.ts, apps/api/src/fund/dto/create-fund-contribution.dto.ts, apps/api/src/fund/dto/create-fund-expense.dto.ts, apps/api/src/fund/fund.service.spec.ts, apps/api/test/phase-04-finance-safety.e2e-spec.ts</files>
  <read_first>
    apps/api/src/app.module.ts
    apps/api/src/trips/trips.service.ts
    packages/database/prisma/schema.prisma
    .planning/phases/04-finances-safety/04-CONTEXT.md
    .planning/phases/04-finances-safety/04-RESEARCH.md
    .planning/phases/04-finances-safety/04-VALIDATION.md
  </read_first>
  <action>
    Add a new FundModule and register it in apps/api/src/app.module.ts.
    1. In apps/api/src/fund/fund.controller.ts expose exactly these routes: GET /trips/:tripId/fund, POST /trips/:tripId/fund, PATCH /trips/:tripId/fund, POST /trips/:tripId/fund/contributions, POST /trips/:tripId/fund/contributions/:contributionId/confirm, and POST /trips/:tripId/fund/expenses.
    2. Build apps/api/src/fund/fund.service.ts around getFundSnapshot(tripId, userId) that returns targetAmount, collectedAmount, spentAmount, remainingAmount, burnRatePercent, contribution rows, and role flags for the current member.
    3. Enforce exactly these permission rules: only the trip leader can create or update the fund; members can submit a contribution confirmation row for themselves; only the trip leader can confirm a contribution or add a trip expense.
    4. Ensure the snapshot math is server-derived from FundContribution and FundExpense records rather than trusting client totals.
    5. Add apps/api/src/fund/fund.service.spec.ts coverage for fund creation, confirmation, expense aggregation, and burn-rate math; extend apps/api/test/phase-04-finance-safety.e2e-spec.ts with the leader-create plus member-contribute plus leader-confirm flow.
  </action>
  <verify>npx jest --config test/jest-e2e.json --runInBand test/phase-04-finance-safety.e2e-spec.ts</verify>
  <acceptance_criteria>
    - apps/api/src/app.module.ts contains "FundModule"
    - apps/api/src/fund/fund.controller.ts contains "@Controller('trips/:tripId/fund')"
    - apps/api/src/fund/fund.controller.ts contains "contributions/:contributionId/confirm"
    - apps/api/src/fund/fund.service.ts contains "getFundSnapshot"
    - apps/api/src/fund/fund.service.ts contains "burnRatePercent"
    - apps/api/src/fund/fund.service.ts contains "collectedAmount"
    - apps/api/test/phase-04-finance-safety.e2e-spec.ts contains "Phase 04 Finance Safety API"
  </acceptance_criteria>
  <done>The API exposes a canonical fund snapshot and enforces the leader-first centralized-fund rules promised by the phase context.</done>
</task>

<task type="auto">
  <name>Task 3: Build the fund UI, QR reveal flow, and trip workspace entry point</name>
  <files>apps/web/src/lib/api-client.ts, apps/web/src/components/trip/TripWorkspaceShell.tsx, apps/web/src/components/trip/FinanceSafetyTab.tsx, apps/web/src/components/trip/FundOverviewPanel.tsx, apps/web/src/components/trip/FundContributionSheet.tsx, apps/web/src/components/trip/__tests__/finance-safety-panel.test.tsx</files>
  <read_first>
    apps/web/src/components/trip/TripWorkspaceShell.tsx
    apps/web/src/lib/api-client.ts
    apps/web/src/components/trip/AttendanceTab.tsx
    .planning/phases/04-finances-safety/04-CONTEXT.md
    .planning/phases/04-finances-safety/04-RESEARCH.md
    .planning/phases/04-finances-safety/04-VALIDATION.md
    apps/api/src/fund/fund.service.ts
  </read_first>
  <action>
    Extend the trip workspace so users can reach Phase 4 finance features.
    1. In apps/web/src/lib/api-client.ts add typed contracts and methods for the fund snapshot and write actions: getFund, createFund, updateFund, submitContribution, confirmContribution, and createExpense.
    2. In apps/web/src/components/trip/TripWorkspaceShell.tsx add a new tab labeled exactly "Quỹ & an toàn" and mount a new FinanceSafetyTab component.
    3. Build apps/web/src/components/trip/FinanceSafetyTab.tsx to load the fund snapshot and render FundOverviewPanel above a contribution action area.
    4. Build apps/web/src/components/trip/FundOverviewPanel.tsx so it shows exactly these signals: "Mục tiêu", "Đã góp", "Đã chi", "Còn lại", and a burn-rate message using the server snapshot.
    5. Build apps/web/src/components/trip/FundContributionSheet.tsx so leader sees controls to set targetAmount, momoQrPayload, and bankQrPayload; members see a bounded contribution flow with a primary CTA and QR reveal surface; the sheet visibly labels the transfer methods "MoMo" and "Chuyển khoản"; and the contribution status clearly distinguishes pending confirmation from confirmed.
    6. Add apps/web/src/components/trip/__tests__/finance-safety-panel.test.tsx coverage for tab rendering, finance summary cards, leader settings visibility, and member contribution CTA/QR reveal.
  </action>
  <verify>npx vitest run src/components/trip/__tests__/finance-safety-panel.test.tsx</verify>
  <acceptance_criteria>
    - apps/web/src/components/trip/TripWorkspaceShell.tsx contains "Quỹ & an toàn"
    - apps/web/src/components/trip/TripWorkspaceShell.tsx contains "FinanceSafetyTab"
    - apps/web/src/components/trip/FundOverviewPanel.tsx contains "Mục tiêu"
    - apps/web/src/components/trip/FundOverviewPanel.tsx contains "Đã góp"
    - apps/web/src/components/trip/FundOverviewPanel.tsx contains "Đã chi"
    - apps/web/src/components/trip/FundContributionSheet.tsx contains "MoMo"
    - apps/web/src/components/trip/FundContributionSheet.tsx contains "Chuyển khoản"
    - apps/web/src/components/trip/__tests__/finance-safety-panel.test.tsx contains "Quỹ & an toàn"
  </acceptance_criteria>
  <done>The trip workspace exposes a first-class fund-management surface with clear QR contribution guidance and summary-first burn-rate visibility.</done>
</task>
</tasks>

<verification>
- [ ] Run `npm exec prisma validate`
- [ ] Run `npx jest --config test/jest-e2e.json --runInBand test/phase-04-finance-safety.e2e-spec.ts`
- [ ] Run `npx vitest run src/components/trip/__tests__/finance-safety-panel.test.tsx`
- [ ] Confirm the leader/member finance branching is visible directly in the trip workspace
</verification>

<success_criteria>
- A centralized trip fund exists with trustworthy summary math
- Members can see how to contribute through one clear QR-based flow
- Leaders remain the structural authority for fund setup and expense recording
- Finance is visible as a first-class trip surface, not a hidden admin feature
</success_criteria>

<output>
After completion, create `.planning/phases/04-finances-safety/04-01-SUMMARY.md`
</output>

#### 04-02-PLAN.md
---
phase: 04-finances-safety
plan: "02"
type: execute
wave: 2
depends_on:
  - "04-01"
files_modified:
  - packages/database/prisma/schema.prisma
  - apps/api/src/app.module.ts
  - apps/api/src/safety/safety.module.ts
  - apps/api/src/safety/safety.controller.ts
  - apps/api/src/safety/safety.service.ts
  - apps/api/src/safety/provider/weather.provider.ts
  - apps/api/src/safety/provider/crowd.provider.ts
  - apps/api/src/safety/provider/directory.provider.ts
  - apps/api/src/safety/safety.service.spec.ts
  - apps/api/test/phase-04-finance-safety.e2e-spec.ts
  - apps/web/src/lib/api-client.ts
  - apps/web/src/components/trip/FinanceSafetyTab.tsx
  - apps/web/src/components/trip/SafetyOverviewPanel.tsx
  - apps/web/src/components/trip/SafetyDirectoryList.tsx
  - apps/web/src/components/trip/__tests__/finance-safety-panel.test.tsx
autonomous: true
requirements:
  - SAFE-01
  - SAFE-02
  - SAFE-04
user_setup: []
must_haves:
  truths:
    - Safety information is trip-aware and biased toward upcoming itinerary context rather than generic destination content.
    - The safety surface shows weather, crowd pressure, and verified emergency-directory actions in one practical snapshot.
    - External provider lookups are normalized behind server-side service boundaries and returned as trip-scoped snapshots.
  artifacts:
    - path: apps/api/src/safety/safety.service.ts
      contains: getSafetyOverview
      min_lines: 200
    - path: apps/web/src/components/trip/SafetyOverviewPanel.tsx
      contains: Dự báo 5 ngày
      min_lines: 120
    - path: apps/web/src/components/trip/SafetyDirectoryList.tsx
      contains: Gọi ngay
      min_lines: 80
  key_links:
    - from: apps/api/src/safety/safety.controller.ts
      to: apps/api/src/safety/safety.service.ts
      via: safety overview and directory routes delegate to one trip-scoped overview service.
      pattern: this\.safetyService\.
    - from: apps/web/src/components/trip/FinanceSafetyTab.tsx
      to: apps/web/src/components/trip/SafetyOverviewPanel.tsx
      via: the finance and safety tab adds safety overview panels under the existing trip-scoped shell.
      pattern: SafetyOverviewPanel
---

<objective>
Add itinerary-aware weather, crowd, and safety directory intelligence to Phase 4.

Purpose: Give the group practical situation awareness before urgent SOS and cultural-warning flows are layered on top.
Output: Safety snapshot APIs, provider adapters, trip-scoped safety panels, and tests for forecast/crowd/directory rendering.
</objective>

<execution_context>
@C:/Users/quoct/OneDrive/Desktop/code/designapp/trip-planner/.codex/get-shit-done/workflows/execute-plan.md
@C:/Users/quoct/OneDrive/Desktop/code/designapp/trip-planner/.codex/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/REQUIREMENTS.md
@.planning/phases/04-finances-safety/04-CONTEXT.md
@.planning/phases/04-finances-safety/04-RESEARCH.md
@.planning/phases/04-finances-safety/04-VALIDATION.md
@apps/web/src/components/trip/FinanceSafetyTab.tsx
@apps/web/src/lib/api-client.ts
@packages/database/prisma/schema.prisma
</context>

<tasks>
<task type="auto">
  <name>Task 1: Implement safety overview services and provider normalization</name>
  <files>packages/database/prisma/schema.prisma, apps/api/src/app.module.ts, apps/api/src/safety/safety.module.ts, apps/api/src/safety/safety.controller.ts, apps/api/src/safety/safety.service.ts, apps/api/src/safety/provider/weather.provider.ts, apps/api/src/safety/provider/crowd.provider.ts, apps/api/src/safety/provider/directory.provider.ts, apps/api/src/safety/safety.service.spec.ts, apps/api/test/phase-04-finance-safety.e2e-spec.ts</files>
  <read_first>
    packages/database/prisma/schema.prisma
    apps/api/src/trips/trips.service.ts
    .planning/phases/04-finances-safety/04-CONTEXT.md
    .planning/phases/04-finances-safety/04-RESEARCH.md
    .planning/phases/04-finances-safety/04-VALIDATION.md
  </read_first>
  <action>
    Add a new SafetyModule and register it in apps/api/src/app.module.ts.
    1. In packages/database/prisma/schema.prisma add model SafetyDirectoryEntry with fields id String @id @default(cuid()), tripId String?, kind String, title String, phone String?, address String, lat Float?, lng Float?, source String, verifiedAt DateTime?, createdAt DateTime @default(now()), updatedAt DateTime @updatedAt, plus @@index([tripId, kind]).
    2. In apps/api/src/safety/safety.controller.ts expose exactly these routes: GET /trips/:tripId/safety/overview and GET /trips/:tripId/safety/directory.
    3. In apps/api/src/safety/safety.service.ts implement getSafetyOverview(tripId, userId) so it returns a five-day weather array, crowd forecast highlights, directory quick picks, and itinerary-aware labels derived from trip destination and dates.
    4. Implement provider wrapper files weather.provider.ts, crowd.provider.ts, and directory.provider.ts that normalize upstream data into deterministic internal shapes; if no live provider is wired yet, make them return stable stubbed/demo payloads through one service boundary instead of sprinkling mock data across controllers.
    5. Add tests for normalization logic, overview snapshot shape, and directory retrieval in safety.service.spec.ts; extend phase-04-finance-safety.e2e-spec.ts so the overview route returns weather, crowd, and directory payloads for a valid trip member.
  </action>
  <verify>npx jest --config test/jest-e2e.json --runInBand test/phase-04-finance-safety.e2e-spec.ts</verify>
  <acceptance_criteria>
    - apps/api/src/app.module.ts contains "SafetyModule"
    - apps/api/src/safety/safety.controller.ts contains "@Controller('trips/:tripId/safety')"
    - apps/api/src/safety/safety.controller.ts contains "overview"
    - apps/api/src/safety/safety.controller.ts contains "directory"
    - apps/api/src/safety/safety.service.ts contains "getSafetyOverview"
    - apps/api/src/safety/provider/weather.provider.ts contains "getFiveDayForecast"
    - apps/api/src/safety/provider/crowd.provider.ts contains "getCrowdForecast"
    - apps/api/src/safety/provider/directory.provider.ts contains "getSafetyDirectory"
  </acceptance_criteria>
  <done>The API can serve one normalized safety overview snapshot with weather, crowd, and directory data for a trip member.</done>
</task>

<task type="auto">
  <name>Task 2: Extend the finance and safety tab with weather, crowd, and directory panels</name>
  <files>apps/web/src/lib/api-client.ts, apps/web/src/components/trip/FinanceSafetyTab.tsx, apps/web/src/components/trip/SafetyOverviewPanel.tsx, apps/web/src/components/trip/SafetyDirectoryList.tsx, apps/web/src/components/trip/__tests__/finance-safety-panel.test.tsx</files>
  <read_first>
    apps/web/src/components/trip/FinanceSafetyTab.tsx
    apps/web/src/components/trip/FundOverviewPanel.tsx
    apps/web/src/lib/api-client.ts
    .planning/phases/04-finances-safety/04-CONTEXT.md
    .planning/phases/04-finances-safety/04-RESEARCH.md
    apps/api/src/safety/safety.service.ts
  </read_first>
  <action>
    Extend the existing FinanceSafetyTab so it also becomes the trip’s practical safety dashboard.
    1. In apps/web/src/lib/api-client.ts add typed methods getSafetyOverview(tripId) and getSafetyDirectory(tripId) plus interfaces for weather cards, crowd cards, and directory entries.
    2. In apps/web/src/components/trip/FinanceSafetyTab.tsx load the safety overview alongside the fund snapshot and render safety modules below the finance summary.
    3. Create apps/web/src/components/trip/SafetyOverviewPanel.tsx that shows heading "Dự báo 5 ngày", a weather card list, a crowd-pressure section, and contextual empty/fallback copy when provider data is unavailable.
    4. Create apps/web/src/components/trip/SafetyDirectoryList.tsx that renders emergency service entries with exactly these action labels where data exists: "Gọi ngay" and "Mở bản đồ".
    5. Update finance-safety-panel.test.tsx so it covers overview rendering, fallback copy, and quick-action directory rows.
  </action>
  <verify>npx vitest run src/components/trip/__tests__/finance-safety-panel.test.tsx</verify>
  <acceptance_criteria>
    - apps/web/src/components/trip/SafetyOverviewPanel.tsx contains "Dự báo 5 ngày"
    - apps/web/src/components/trip/SafetyOverviewPanel.tsx contains "Mức đông"
    - apps/web/src/components/trip/SafetyDirectoryList.tsx contains "Gọi ngay"
    - apps/web/src/components/trip/SafetyDirectoryList.tsx contains "Mở bản đồ"
    - apps/web/src/components/trip/FinanceSafetyTab.tsx contains "SafetyOverviewPanel"
    - apps/web/src/components/trip/__tests__/finance-safety-panel.test.tsx contains "Dự báo 5 ngày"
  </acceptance_criteria>
  <done>The trip workspace can show weather, crowd, and emergency-directory guidance in the same finance and safety tab.</done>
</task>
</tasks>

<verification>
- [ ] Run `npx jest --config test/jest-e2e.json --runInBand test/phase-04-finance-safety.e2e-spec.ts`
- [ ] Run `npx vitest run src/components/trip/__tests__/finance-safety-panel.test.tsx`
- [ ] Confirm the safety overview remains understandable when provider data is empty or partial
</verification>

<success_criteria>
- Trip members can see itinerary-aware weather and crowd guidance
- Emergency directory quick actions are available in the same tab
- Safety provider complexity stays behind normalized server-side service boundaries
</success_criteria>

<output>
After completion, create `.planning/phases/04-finances-safety/04-02-SUMMARY.md`
</output>

#### 04-03-PLAN.md
---
phase: 04-finances-safety
plan: "03"
type: execute
wave: 3
depends_on:
  - "04-01"
  - "04-02"
files_modified:
  - packages/database/prisma/schema.prisma
  - apps/api/src/app.module.ts
  - apps/api/src/safety/safety.gateway.ts
  - apps/api/src/safety/safety.controller.ts
  - apps/api/src/safety/safety.service.ts
  - apps/api/src/safety/dto/create-sos-alert.dto.ts
  - apps/api/src/safety/dto/acknowledge-safety-alert.dto.ts
  - apps/api/src/safety/safety.service.spec.ts
  - apps/api/test/phase-04-finance-safety.e2e-spec.ts
  - apps/web/src/lib/api-client.ts
  - apps/web/src/components/trip/FinanceSafetyTab.tsx
  - apps/web/src/components/trip/SOSPanel.tsx
  - apps/web/src/components/trip/CulturalWarningBanner.tsx
  - apps/web/src/components/trip/__tests__/finance-safety-panel.test.tsx
autonomous: true
requirements:
  - SAFE-03
  - SAFE-05
user_setup: []
must_haves:
  truths:
    - SOS is a deliberate high-priority action that creates a visible trip alert and can notify the group without relying on native background capabilities.
    - Cultural warnings are shown as contextual browser-visible surfaces tied to itinerary or destination context instead of assumed geofencing.
    - The trip workspace keeps urgent alert UI serious and action-first, clearly distinct from the playful planning tone used elsewhere.
  artifacts:
    - path: apps/api/src/safety/safety.gateway.ts
      contains: /safety
      min_lines: 80
    - path: apps/web/src/components/trip/SOSPanel.tsx
      contains: SOS
      min_lines: 80
    - path: apps/web/src/components/trip/CulturalWarningBanner.tsx
      contains: Lưu ý văn hóa
      min_lines: 60
  key_links:
    - from: apps/api/src/safety/safety.controller.ts
      to: apps/api/src/safety/safety.gateway.ts
      via: SOS writes broadcast refreshed safety-alert state to connected trip members.
      pattern: broadcast
    - from: apps/web/src/components/trip/FinanceSafetyTab.tsx
      to: apps/web/src/components/trip/SOSPanel.tsx
      via: the finance and safety tab mounts the high-priority SOS surface alongside contextual warnings.
      pattern: SOSPanel
---

<objective>
Add urgent SOS and cultural-warning behavior to complete Phase 4.

Purpose: Finish the finance-and-safety layer with serious, action-first alert handling that still fits the web-first constraints of the project.
Output: Safety alert models, SOS APIs and broadcast flow, contextual cultural-warning UI, and tests for urgent-state rendering.
</objective>

<execution_context>
@C:/Users/quoct/OneDrive/Desktop/code/designapp/trip-planner/.codex/get-shit-done/workflows/execute-plan.md
@C:/Users/quoct/OneDrive/Desktop/code/designapp/trip-planner/.codex/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/REQUIREMENTS.md
@.planning/phases/04-finances-safety/04-CONTEXT.md
@.planning/phases/04-finances-safety/04-RESEARCH.md
@.planning/phases/04-finances-safety/04-VALIDATION.md
@apps/web/src/components/trip/FinanceSafetyTab.tsx
@apps/api/src/safety/safety.service.ts
@apps/api/src/votes/votes.gateway.ts
</context>

<tasks>
<task type="auto">
  <name>Task 1: Implement trip-scoped safety alerts, SOS writes, and realtime broadcast</name>
  <files>packages/database/prisma/schema.prisma, apps/api/src/app.module.ts, apps/api/src/safety/safety.gateway.ts, apps/api/src/safety/safety.controller.ts, apps/api/src/safety/safety.service.ts, apps/api/src/safety/dto/create-sos-alert.dto.ts, apps/api/src/safety/dto/acknowledge-safety-alert.dto.ts, apps/api/src/safety/safety.service.spec.ts, apps/api/test/phase-04-finance-safety.e2e-spec.ts</files>
  <read_first>
    packages/database/prisma/schema.prisma
    apps/api/src/safety/safety.service.ts
    apps/api/src/votes/votes.gateway.ts
    .planning/phases/04-finances-safety/04-CONTEXT.md
    .planning/phases/04-finances-safety/04-RESEARCH.md
    .planning/phases/04-finances-safety/04-VALIDATION.md
  </read_first>
  <action>
    Extend the safety backend to support urgent alerts.
    1. In packages/database/prisma/schema.prisma add model SafetyAlert with fields id String @id @default(cuid()), tripId String, type String, status String @default("OPEN"), message String, createdByTripMemberId String?, linkedItineraryItemId String?, acknowledgedByTripMemberId String?, createdAt DateTime @default(now()), updatedAt DateTime @updatedAt; add @@index([tripId, status]) and relation fields on Trip and TripMember as needed.
    2. Add apps/api/src/safety/safety.gateway.ts as a `/safety` namespace gateway using the same snapshot-on-join pattern already used in votes and attendance.
    3. In apps/api/src/safety/safety.controller.ts expose POST /trips/:tripId/safety/sos, POST /trips/:tripId/safety/alerts/:alertId/acknowledge, and GET /trips/:tripId/safety/warnings.
    4. In apps/api/src/safety/safety.service.ts implement createSosAlert(tripId, userId, dto) so it creates a high-priority SOS alert, returns a refreshed safety snapshot, and triggers broadcast through the gateway; implement acknowledgeAlert(tripId, alertId, userId) so members can mark visible awareness without closing the entire safety system.
    5. Extend safety.service.spec.ts and phase-04-finance-safety.e2e-spec.ts with cases for SOS creation, alert acknowledgement, and refreshed warnings payloads.
  </action>
  <verify>npx jest --config test/jest-e2e.json --runInBand test/phase-04-finance-safety.e2e-spec.ts</verify>
  <acceptance_criteria>
    - packages/database/prisma/schema.prisma contains "model SafetyAlert"
    - apps/api/src/safety/safety.gateway.ts contains "namespace: '/safety'"
    - apps/api/src/safety/safety.controller.ts contains "safety/sos"
    - apps/api/src/safety/safety.controller.ts contains "alerts/:alertId/acknowledge"
    - apps/api/src/safety/safety.service.ts contains "createSosAlert"
    - apps/api/src/safety/safety.service.ts contains "acknowledgeAlert"
  </acceptance_criteria>
  <done>The backend can create trip-scoped SOS alerts and broadcast refreshed alert state to connected members.</done>
</task>

<task type="auto">
  <name>Task 2: Render SOS and cultural-warning surfaces in the finance and safety tab</name>
  <files>apps/web/src/lib/api-client.ts, apps/web/src/components/trip/FinanceSafetyTab.tsx, apps/web/src/components/trip/SOSPanel.tsx, apps/web/src/components/trip/CulturalWarningBanner.tsx, apps/web/src/components/trip/__tests__/finance-safety-panel.test.tsx</files>
  <read_first>
    apps/web/src/components/trip/FinanceSafetyTab.tsx
    apps/web/src/components/trip/AttendanceTab.tsx
    apps/web/src/lib/api-client.ts
    .planning/phases/04-finances-safety/04-CONTEXT.md
    .planning/phases/04-finances-safety/04-RESEARCH.md
    apps/api/src/safety/safety.service.ts
  </read_first>
  <action>
    Extend the finance and safety tab with urgent-state UI.
    1. In apps/web/src/lib/api-client.ts add typed methods createSosAlert(tripId, body), acknowledgeSafetyAlert(tripId, alertId), getSafetyWarnings(tripId), and connectSafetySocket().
    2. Create apps/web/src/components/trip/SOSPanel.tsx with one dominant CTA labeled exactly "Gửi SOS", visible sent state text, and follow-up action links or copy that make the next step obvious after activation.
    3. Create apps/web/src/components/trip/CulturalWarningBanner.tsx that renders contextual warning blocks with the heading "Lưu ý văn hóa" and shows warning text tied to destination or itinerary context.
    4. Update apps/web/src/components/trip/FinanceSafetyTab.tsx so it mounts SOSPanel in a visually distinct urgent section, renders CulturalWarningBanner when warnings exist, subscribes to the `/safety` socket and refreshes alert state on broadcasts, and keeps the tone serious and clear in the urgent area instead of playful.
    5. Extend finance-safety-panel.test.tsx to cover SOS CTA rendering, sent-state update, and cultural-warning banner visibility.
  </action>
  <verify>npx vitest run src/components/trip/__tests__/finance-safety-panel.test.tsx</verify>
  <acceptance_criteria>
    - apps/web/src/components/trip/SOSPanel.tsx contains "Gửi SOS"
    - apps/web/src/components/trip/SOSPanel.tsx contains "Đã gửi cảnh báo"
    - apps/web/src/components/trip/CulturalWarningBanner.tsx contains "Lưu ý văn hóa"
    - apps/web/src/components/trip/FinanceSafetyTab.tsx contains "connectSafetySocket"
    - apps/web/src/components/trip/FinanceSafetyTab.tsx contains "SOSPanel"
    - apps/web/src/components/trip/__tests__/finance-safety-panel.test.tsx contains "Gửi SOS"
  </acceptance_criteria>
  <done>The trip workspace shows a serious SOS flow and contextual cultural warnings that survive refresh and realtime updates.</done>
</task>
</tasks>

<verification>
- [ ] Run `npx jest --config test/jest-e2e.json --runInBand test/phase-04-finance-safety.e2e-spec.ts`
- [ ] Run `npx vitest run src/components/trip/__tests__/finance-safety-panel.test.tsx`
- [ ] Confirm SOS remains visible and clearly distinct from ordinary trip UI copy
- [ ] Confirm cultural warnings only render when warning payloads are present
</verification>

<success_criteria>
- SOS can be triggered from the trip workspace and creates visible alert state
- Alert state can refresh or broadcast to connected members in the browser
- Cultural warnings are contextual, not generic or background-native
</success_criteria>

<output>
After completion, create `.planning/phases/04-finances-safety/04-03-SUMMARY.md`
</output>

## Review Instructions

Analyze each plan and provide:

1. **Summary** — One-paragraph assessment
2. **Strengths** — What's well-designed (bullet points)
3. **Concerns** — Potential issues, gaps, risks (bullet points with severity: HIGH/MEDIUM/LOW)
4. **Suggestions** — Specific improvements (bullet points)
5. **Risk Assessment** — Overall risk level (LOW/MEDIUM/HIGH) with justification

Focus on:
- Missing edge cases or error handling
- Dependency ordering issues
- Scope creep or over-engineering
- Security considerations
- Performance implications
- Whether the plans actually achieve the phase goals

Output your review in markdown format.
