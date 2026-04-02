# Mình Đi Đâu Thế

## What This Is

A comprehensive, all-in-one trip planning web application (PWA) for solo travelers, friend groups, and large collectives. The app provides an end-to-end experience: from destination selection, itinerary building, budget estimation, to task delegation, with a Phase 2 vision for a Native Mobile App to handle deep-tech features like offline mesh networking.

## Core Value

Maximum convenience and the total elimination of group-travel "pain points" by centralizing itinerary, finances, logistics, and memories into a single, seamless web platform requiring zero app installation for onboarding.

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

### Active (V1 Web App PWA)

<!-- Current scope. Building toward these. -->

- [ ] **Flexible Planning & 1-Click Marketplace:** Support diverse group sizes. Provide a Community Template Library (copy an itinerary with 1 click). Integrate a Tinder-style swipe feature to vote on food/activities via Web.
- [ ] **Smart Room & Ride Allocation:** Drag-and-drop web UI to distribute people into cars/rooms via 3 modes (Leader manual, Member auto-register, Randomizer).
- [ ] **Photo-Proof Check-in (Web-based):** Leader sets gathering points. Members must upload/take a selfie (via browser camera) to confirm "Arrived".
- [ ] **Smart To-do & Logistics:** Leader delegates shared packing items. Tracks completion status.
- [ ] **Fund Management & Expenses:** Centralized pool managed by treasurer, MoMo/Bank QR codes for money collection.
- [ ] **Digital Vault:** Cloud drive to gather ID cards and flight tickets for the Leader.
- [ ] **Souvenir Planner:** Recommends local specialties and sends reminders.
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
| [Phase 05 AI trust model] | AI features should draft, warn, or summarize without silently mutating trip structure. | Validated in Phase 05 |

---
*Last updated: 2026-04-02 (Phase 05 complete)*
