# Phase 2: the-itinerary-engine - Context

**Gathered:** 2026-03-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the shared itinerary engine for a trip: timeline CRUD with drag-and-drop, map-assisted place selection and itinerary visualization, Tinder-style collaborative voting, and community template cloning. Timeline remains the source of truth; maps, voting, and templates support planning around it.

</domain>

<decisions>
## Implementation Decisions

### Timeline Structure And Editing
- **D-01:** Timeline items stay intentionally simple: `gio`, `tieu de`, `dia diem`, and `ghi chu ngan`.
- **D-02:** The itinerary is grouped by day, with each day shown as its own section.
- **D-03:** The leader can drag and drop items within a day and move items across days.
- **D-04:** Items may exist without a concrete time and should be shown as `chua chot gio`.
- **D-05:** Creating an item supports both a quick mode and a detailed mode, with quick mode as the default path.
- **D-06:** When creating an item, the leader chooses the insertion position up front instead of relying on automatic placement.
- **D-07:** Editing an item happens in a dedicated modal or panel, not inline on the timeline.
- **D-08:** Deleting an item always requires explicit confirmation.

### Timeline Collaboration And Conflict Handling
- **D-09:** Members cannot edit structural timeline data directly, but they can submit simple proposals to change time, location, notes, or suggest a new item.
- **D-10:** Proposal review happens primarily in a dedicated inbox, while timeline items show badges or indicators when related proposals exist.
- **D-11:** The leader reviews proposals one by one with explicit accept or reject actions.
- **D-12:** The leader is the final source of truth; if an item changes, older proposals tied to its previous state become outdated instead of being auto-merged.

### Timeline Progress States And Feedback
- **D-13:** Timeline items with a time use automatic progress states: `sap toi`, `dang di`, and `da di`.
- **D-14:** An item becomes `dang di` at its start time and becomes `da di` when the next timed item starts.
- **D-15:** Untimed items are not forced into progress states and remain visually separate as `chua chot gio`.
- **D-16:** The itinerary view opens all days by default, marks the current area clearly, and auto-scrolls to the current portion.
- **D-17:** Days with no items use a friendly empty state with a clear CTA to add an activity.
- **D-18:** Status styling is intentionally distinct: `dang di` is the most prominent, `da di` is de-emphasized but readable, `sap toi` remains clearly upcoming, and `chua chot gio` uses a neutral treatment.
- **D-19:** The system warns about time overlaps within the same day in both the edit form and the timeline, but still allows saving.

### Map Behavior
- **D-20:** Timeline remains the primary planning surface; the map is a support tool for selecting places and visualizing the itinerary.
- **D-21:** Leaders can select locations either by search or by clicking the map, but a map click only suggests a point and still requires explicit place confirmation.
- **D-22:** After a place is chosen, the map immediately zooms to and highlights the selected location.
- **D-23:** The map shows pins for itinerary items with valid locations and draws simple visual connector lines in timeline order, not real navigation routes.
- **D-24:** When timeline order or location data changes, the map updates immediately to reflect the new source-of-truth itinerary state.
- **D-25:** Items without a resolved location are omitted from the map.
- **D-26:** The map lives in its own dedicated screen or mode rather than being embedded into the main timeline screen.
- **D-27:** The map screen includes day filtering, remembers the previously selected day filter, and when opened from a specific timeline item it focuses that item immediately.
- **D-28:** The map keeps all pins visible and uses light clustering only when density becomes too high.

### Voting Flow
- **D-29:** Tinder-style voting is used for both new options that may be added to the itinerary and candidate replacements for existing itinerary items.
- **D-30:** Members may propose creating a voting session, but the leader must approve it before the vote opens to the group.
- **D-31:** New-option votes can automatically create a new itinerary item after winning, but only because the leader must predefine the target day and insertion position when creating the vote.
- **D-32:** Replacement votes never overwrite an existing itinerary item automatically; the winning result becomes a replacement proposal that still requires leader confirmation.
- **D-33:** Voting uses swipe-left or swipe-right card interactions as the primary interaction model.
- **D-34:** Only official trip members may participate in voting; guests cannot vote.
- **D-35:** Members may change their vote until the voting deadline, and only the latest active vote counts.
- **D-36:** Voting sessions use a leader-defined deadline to close.
- **D-37:** If a vote ends in a tie, the system runs one shorter tie-break round; if that also ties, the leader decides.
- **D-38:** Live interim results are visible during the voting window, but the final result is only locked at the deadline.
- **D-39:** Replacement votes must clearly show the current itinerary item and the challenger option so members understand they are voting to keep or replace something specific.
- **D-40:** Voting data is not hard-capped to a small option count, but the UX should still present options sequentially as cards rather than dumping everything at once.
- **D-41:** Members may propose adding new options to an active vote, but the leader must approve them before they enter the session.
- **D-42:** If a new option is approved while voting is already open, it joins immediately from that approval point forward; existing votes are not retroactively rewritten, but members can re-vote before the deadline.

### Community Template Cloning
- **D-43:** Community templates are cloned into a fully separate trip copy with no live link back to the source template.
- **D-44:** Cloning copies usable planning content only: timeline structure, locations, and notes.
- **D-45:** Day structure in templates is relative; `Day 1`, `Day 2`, and so on are remapped onto the new trip based on its new start date.
- **D-46:** Only the trip leader can publish a trip as a community template.
- **D-47:** Publishing a community template automatically strips personal or sensitive data and keeps only the itinerary content itself.

### the agent's Discretion
- Exact visual language for timeline state highlighting, as long as current, past, upcoming, and untimed items remain unmistakable.
- Exact inbox UI for proposals and voting moderation, as long as leader review stays primary and explicit.
- Exact mobile/desktop gesture fallback for Tinder-style swipe interactions, as long as the core voting flow remains intuitive on the web.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Product Scope
- `.planning/ROADMAP.md` — Defines Phase 2 scope: itinerary timeline CRUD, voting, and template cloning.
- `.planning/PROJECT.md` — Product positioning, Vietnamese-only UX, playful tone, and web-first constraints.
- `.planning/REQUIREMENTS.md` — Functional requirements for PLAN-01, PLAN-02, PLAN-03, and TRIP-03.

### Prior Decisions
- `.planning/phases/01-foundation-onboarding/01-CONTEXT.md` — Carries forward playful UI direction, guest read-only preview, and leader-controlled structural editing.

### Existing Implementation Context
- `apps/web/src/lib/api-client.ts` — Current web API integration style and trip DTO shapes.
- `apps/api/src/trips/trips.service.ts` — Existing trip membership and join-code service patterns.
- `packages/database/prisma/schema.prisma` — Current persisted domain model before itinerary/map/voting/template entities are added.
- `apps/web/src/app/trip/[joinCode]/page.tsx` — Current guest trip preview behavior that phase 2 must extend consistently.
- `apps/web/app/globals.css` — Existing playful visual direction and app-wide theme tokens.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `apps/web/src/lib/api-client.ts`: Established REST client pattern for the web app, including auth-aware request handling and typed trip APIs.
- `apps/web/src/store/useAuthStore.ts`: Existing Zustand store pattern for session-aware UI state on the web.
- `apps/web/src/components/ui/AuthHydration.tsx`: Current auth restoration pattern for protected interactive behaviors.
- `apps/api/src/trips/trips.service.ts`: Existing service style for trip ownership, joining, and membership checks that can anchor permission logic in phase 2.

### Established Patterns
- Timeline-related features should preserve the leader/member permission split already established in product docs and phase 1 context.
- The current stack favors straightforward REST and server-backed state over highly collaborative real-time editing.
- The web app already assumes a playful Vietnamese-first UI, so phase 2 interactions should feel lively without adding brittle complexity.

### Integration Points
- New itinerary, voting, and template entities will extend the trip domain in `packages/database/prisma/schema.prisma`.
- New APIs will likely sit alongside the existing trip module patterns in `apps/api/src/trips` or adjacent feature modules.
- Timeline, proposal inbox, and map-launching flows will build on the current trip-centric web surface in `apps/web/src/app/trip/[joinCode]/page.tsx` and related future trip pages.

</code_context>

<specifics>
## Specific Ideas

- Timeline should visibly distinguish `da di`, `dang di`, `sap toi`, and `chua chot gio` without confusing automatic progress with untimed items.
- The itinerary screen should open fully expanded but still snap attention to the current portion automatically.
- Voting should feel playful and social, but timeline stability wins over full automation.
- Map lines are for visual itinerary flow only, not real route guidance.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 02-the-itinerary-engine*
*Context gathered: 2026-03-28*
