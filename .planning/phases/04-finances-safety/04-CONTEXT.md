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
