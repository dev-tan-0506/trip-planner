# Phase 3: Logistics & Attendance - Context

**Gathered:** 2026-03-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the logistics coordination layer for a trip: smart room and ride allocation, shared to-do and packing assignments, and photo-proof attendance check-in with a real-time dashboard for the leader. This phase focuses on physical coordination of the group, not finances, safety alerts, or post-trip memory flows.

</domain>

<decisions>
## Implementation Decisions

### Room And Ride Allocation
- **D-01:** Allocation uses a hybrid model. Leader can drag and drop people manually, while the system can still help fill remaining slots through assisted/random allocation.
- **D-02:** Member self-registration is allowed for available room or ride slots, but the leader can always override and rearrange assignments afterward.
- **D-03:** Allocation UX should feel like a clear planning board rather than a hidden algorithm. Manual editing remains visible and important even when auto-assist exists.

### Member Slot Registration
- **D-04:** Members can join an available slot directly instead of sending approval requests first.
- **D-05:** A member joining a slot is not final authority. The leader remains the final source of truth and may move people if the overall allocation needs balancing.
- **D-06:** Planning should assume slot capacity matters and self-registration should only work for open capacity, not overbooked slots.

### Packing And Shared To-do Structure
- **D-07:** The checklist model is combined: there is a shared packing / logistics space organized by category, and there is still room for personally assigned tasks or items.
- **D-08:** Shared categories should support common travel group buckets such as documents, medicine, food, transport gear, and miscellaneous supplies.
- **D-09:** Individual ownership still matters inside the combined model: each item or task can have a responsible member even when it lives inside a shared category.

### Photo-Proof Check-in And Dashboard
- **D-10:** Check-in uses browser-based photo proof plus location permission when available.
- **D-11:** The leader creates a specific gathering point and time window for a check-in round rather than relying on an always-on attendance tracker.
- **D-12:** Members confirm arrival by uploading or taking a selfie in the browser and, when they grant access, attaching their location to the check-in proof.
- **D-13:** The leader dashboard should clearly distinguish who has checked in and who has not, while also surfacing the captured location context for arrived members.

### Control Model
- **D-14:** As in earlier phases, the leader remains the structural authority for coordination-critical data.
- **D-15:** Members are allowed to act within safe boundaries that reduce leader workload, but every logistics flow must still be understandable and overridable by the leader.

### the agent's Discretion
- Exact card / board presentation for room and ride allocation, as long as hybrid manual-plus-assisted allocation stays obvious.
- Exact visual treatment of checklist categories versus personal tasks, as long as both coexist clearly.
- Exact dashboard layout and attendance status styling, as long as leader can quickly read arrived versus missing members.

</decisions>

<specifics>
## Specific Ideas

- Allocation should feel interactive and tangible, more like moving people across visible slots than filling out a plain form.
- The member self-join flow should reduce coordination overhead but never weaken leader control.
- Check-in proof should feel lightweight enough for a phone browser, not like a heavy verification ceremony.

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Product Scope
- `.planning/ROADMAP.md` — Defines Phase 3 scope: allocation, packing/to-do, and attendance check-in dashboard.
- `.planning/PROJECT.md` — Web-first, Vietnamese-only, playful but practical UX constraints.
- `.planning/REQUIREMENTS.md` — Functional requirements for LOGI-01, LOGI-02, LOGI-03, LOGI-04, and LOGI-05.

### Prior Decisions
- `.planning/phases/01-foundation-onboarding/01-CONTEXT.md` — Establishes guest-join expectations, playful UI direction, and web onboarding principles.
- `.planning/phases/02-the-itinerary-engine/02-CONTEXT.md` — Carries forward leader-controlled structural authority, member proposal participation patterns, and timeline-as-source-of-truth mentality.

### Existing Implementation Context
- `apps/web/src/components/trip/TripWorkspaceShell.tsx` — Current trip workspace patterns, floating actions, and leader/member branching.
- `apps/web/src/components/trip/TimelineDaySection.tsx` — Existing interactive trip-planning board patterns that may inspire allocation surfaces.
- `apps/web/src/lib/api-client.ts` — Existing typed API contracts and client conventions for trip-scoped features.
- `apps/api/src/trips/trips.service.ts` — Current trip membership and leader permission patterns.
- `packages/database/prisma/schema.prisma` — Current trip/member data model that Phase 3 will extend for logistics entities.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `apps/web/src/components/trip/TripWorkspaceShell.tsx`: Existing trip-scoped shell already handles leader/member branching, overlays, floating CTAs, and periodic refresh behavior.
- `apps/web/src/lib/api-client.ts`: Established pattern for typed REST clients and trip-feature modules.
- `apps/web/src/store/useAuthStore.ts`: Current auth and hydration pattern for member-aware interactions.
- `apps/api/src/trips/trips.service.ts`: Existing trip membership and role checks can anchor logistics authorization.

### Established Patterns
- The product already treats the leader as the final structural authority while still allowing members to participate in bounded ways.
- UI direction is playful, Vietnamese-first, mobile-friendly, and should avoid dry administrative dashboards.
- Trip features currently cluster around a single trip workspace rather than scattering unrelated flows across many disconnected pages.

### Integration Points
- New logistics models will likely extend the trip/member domain in `packages/database/prisma/schema.prisma`.
- Attendance and assignment APIs should follow the current trip-scoped service/controller pattern already used in itinerary, proposals, templates, and votes.
- The trip planner surface is a natural integration point for launching room/ride allocation, checklist views, and live attendance status.

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 03-logistics-attendance*
*Context gathered: 2026-03-28*
