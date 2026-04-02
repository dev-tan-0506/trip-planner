# Mình Đi Đâu Thế

## What This Is

A comprehensive, all-in-one trip planning web application (PWA) for solo travelers, friend groups, and large collectives. The app provides an end-to-end experience: from destination selection, itinerary building, budget estimation, to task delegation, with a Phase 2 vision for a Native Mobile App to handle deep-tech features like offline mesh networking.

## Core Value

Maximum convenience and the total elimination of group-travel "pain points" by centralizing itinerary, finances, logistics, and memories into a single, seamless web platform requiring zero app installation for onboarding.

## Current State

- `v1.0` web milestone is closed as the shipped baseline.
- The product now covers onboarding, trip creation/join, itinerary, logistics, finance/safety, AI helpers, and post-trip memories in one connected workspace.
- `v2` is intentionally not opened yet because the next milestone direction is being reconsidered.

## Next Milestone Gate

Before opening `v2`, the team should reset planning around the new direction instead of extending the `v1` roadmap by inertia.

See: [.planning/PRE-V2-RESET.md](/c:/Users/quoct/OneDrive/Desktop/code/designapp/trip-planner/.planning/PRE-V2-RESET.md) and [.planning/PRE-V2-WORKING-BRIEF.md](/c:/Users/quoct/OneDrive/Desktop/code/designapp/trip-planner/.planning/PRE-V2-WORKING-BRIEF.md)

## Requirements

### Validated

<!-- Shipped and confirmed valuable. -->

- [x] **Culinary Routing:** Validated in Phase 05. AI drafts a route inside the trip workspace, and leaders explicitly apply any itinerary rewrite.
- [x] **AI Outfit Planner (Optional):** Validated in Phase 05. Outfit suggestions stay lightweight, confidence-labeled, and capped for fast review.
- [x] **Auto-parsing Hub:** Validated in Phase 05. Booking emails land as reviewable drafts before any itinerary mutation.
- [x] **Dynamic Itinerary & Profile Matching:** Validated in Phase 05. Health-profile conflicts render as inline advisory warnings instead of silent failures.
- [x] **Local Expert AI & Cultural Warning:** Validated in Phase 05. Menu translation and hidden-spot guidance remain compact, contextual, and trust-sensitive.
- [x] **Local Cost Benchmarking:** Validated in Phase 05. Finance warnings compare spending against destination-aware local benchmarks without blocking expense entry.
- [x] **Smart Discovery & AI Daily Podcast:** Validated in Phase 05. AI daily recap persists per trip day with browser playback fallback and text backup.

### Active (Awaiting Next Milestone Reset)

<!-- Current scope. Building toward these. -->

- [ ] **Next milestone requirements pending reset:** The `v1` roadmap is now archived. Define a fresh requirement set for `v2` after revisiting product direction, carry-over debt, and platform scope.

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
| [Phase 05 AI trust model] | AI features should draft, warn, or summarize without silently mutating trip structure. | Validated in Phase 05 |

---
*Last updated: 2026-04-03 after v1.0 close-out prep*
