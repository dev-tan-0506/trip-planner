# Mình Đi Đâu Thế

## What This Is

A comprehensive, all-in-one trip planning web/mobile application for solo travelers, friend groups, and large collectives. The app provides an end-to-end experience: from destination selection, itinerary building, budget estimation, task delegation, to live location tracking and memory sharing, with a future vision for commercialization.

## Core Value

Maximum convenience and the total elimination of group-travel "pain points" by centralizing itinerary, finances, logistics, and memories into a single, seamless platform.

## Requirements

### Validated

<!-- Shipped and confirmed valuable. -->

(None yet — ship to validate)

### Active

<!-- Current scope. Building toward these. -->

- [ ] **Flexible Planning & 1-Click Marketplace:** Support diverse group sizes. Provide a Community Template Library where users can copy an entire itinerary (e.g., "Da Lat Healing 3D2N") with 1 click. Integrate a Tinder-style swipe feature to vote on food/activities.
- [ ] **Culinary Routing:** "Route by stomach." After selecting desired food spots, AI automatically drafts the most logical geographical route passing through the best restaurants to prevent backtracking.
- [ ] **AI Outfit Planner (Optional):** AI suggests outfit colors/styles based on the destination's weather, scenery, and trends for symmetric group photos. Auto-syncs with personal packing checklists.
- [ ] **Smart Room & Ride Allocation:** Solves the headache of distributing people into cars/rooms for large groups via 3 modes: (1) Leader drag-and-drop; (2) Members freely register for empty slots; (3) Fun random automated assignment.
- [ ] **Photo-Proof Check-in:** Leader sets gathering points. Members must take a selfie at the exact location to confirm "Arrived" instead of merely clicking a button. Completely eliminates lateness and builds a funny candid photo library.
- [ ] **Auto-parsing Hub:** AI scans forwarded flight and hotel booking emails, extracting and placing booking codes and schedules exactly into the correct Timeline slots automatically.
- [ ] **Dynamic Itinerary:** Displays a flexible activity timeline. Red-alerts if an added activity/food spot violates the group's health profile.
- [ ] **Health & Dietary Profile:** Members declare allergies/motion sickness. The app cross-references this with the itinerary to warn the group or auto-arrange car seating.
- [ ] **Local Expert AI & Cultural Warning:** AI acts as a native tour guide (translating menus, suggesting hidden gems). Triggers lock-screen warnings when entering culturally sensitive areas (e.g., reminding to rent a sarong before entering a temple).
- [ ] **Local Cost Benchmarking:** Cross-references planned expenses with Big Data to alert users if their budget is unfeasibly low or if they are being ripped off.
- [ ] **Group Map & Live Location:** Tracks team members' devices strictly during the trip on a shared map.
- [ ] **Offline Mode & Mesh Network:** Automatically switches to a Bluetooth-based decentralized Mesh network for short-range messaging and location tracking in areas without cell coverage (forests, mountains).
- [ ] **Smart To-do & Logistics:** Leader delegates major tasks and shared packing items. Tracks task completion status (Assigned, Remembered, Done with proof).
- [ ] **Fund Management & Expenses:** Budget templates provided. The group treasurer manages a centralized pool, with built-in Bank/MoMo QR codes for money collection and automated payment reminders.
- [ ] **Digital Vault & Shared Media:** High-speed cloud for shared photos/videos. A "Virtual Vault" to gather ID cards and flight tickets for the Leader to handle group check-ins seamlessly.
- [ ] **Souvenir Planner:** Recommends authentic local specialties and sends last-minute reminders to buy gifts before leaving.
- [ ] **Smart Discovery & Alerts:** Forecasts weather for upcoming itinerary stops. Suggests nearby clinics/gas stations.
- [ ] **Real-time Crowd Prediction:** Forecasts real-time crowding at tourist spots to avoid traffic jams and queues.
- [ ] **AI Daily Podcast:** At the end of the day, AI synthesizes a humorous audio broadcast summing up the day's events, distance traveled, funny photos, and latecomers.
- [ ] **Reunion Organizer:** Analyzes schedules and sends e-invites for a post-trip meetup/dinner 1 week/1 month after the trip.
- [ ] **On-demand Concierge:** Quick access to verified local mechanics (tire repair) or emergency medical support near the group's coordinates.
- [ ] **Gamification & SOS:** Built-in mini-games. Internal SOS button to alert/vibrate all members' phones in emergencies.
- [ ] **Anonymous Post-trip Feedback:** A fun, incognito survey at the end of the trip to vote on the most tardy person or praise the treasurer, clearing away bad vibes.
- [ ] **Commercial Marketplace (Next Phase):** Members publish their itinerary templates to the community to earn affiliate commissions down the line.
- [ ] **Smart Tag Tracking (Next Phase):** Bluetooth tag integration to prevent losing communal luggages or pets.

### Out of Scope

<!-- Explicit boundaries. Includes reasoning to prevent re-adding. -->

- [Auto-vlog render / AR Memories / Luggage Teleportation / Live Voice Translation / Biometric Auto-Delay] — Acknowledged ideas but excluded from V1 to prioritize core development resources.
- [Automated Split Bill] — V1 strictly utilizes a centralized "Group Fund" approach (collect first, spend later) to avoid end-of-trip debt collection complexities.
- [Real-time Co-editing Itinerary] — V1 strictly assigns itinerary modification rights only to the Leader to prevent data conflict (CRDT is too complex).

## Context

- The product is positioned as a super-utility "Tour Guide" tool to organically attract users before unlocking broad commercialization. Deep-tech features (Offline Mesh, AI) serve as massive core-differentiators.
- Pre-existing code in the directory exists, but codebase mapping was skipped. Development will append/refactor directly based on this document.

## Constraints

- **[Usability]**: Deep-tech features (Mesh, AI) must run silently in the background. The User Interface must remain extremely minimalist so non-tech-savvy users can operate it smoothly.
- **[Language & Tone of Voice]**: The App UI/UX must be strictly 100% Vietnamese. The tone must be intensely friendly, intimate, and casual (like friends talking). It should invoke warmth and fun, eliminating the "administrative burden" feeling of trip planning.
- **[Battery / Privacy]**: Bluetooth Mesh and Live Location must solve battery drain over multi-day trips. Location data is only gathered when "Trip On-going" and auto-terminates on "End Trip".

## Key Decisions

<!-- Decisions that constrain future work. Add throughout project lifecycle. -->

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| [Centralized Fund over Split Bill] | Easier to control risks and guarantee upfront capital. | — Pending |
| [Leader-driven Itinerary Rights] | Prevents data chaos and conflict during concurrent editing. | — Pending |

---
*Last updated: 2026-03-28 translated to English by request*
