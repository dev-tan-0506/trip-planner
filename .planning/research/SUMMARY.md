# Research Summary: Trip Planning Ecosystem

## Technical Stack Direction
The optimal stack for V1 is a **Next.js Web App (PWA)** combined with **Supabase (PostgreSQL)** for real-time interactions. This guarantees frictionless onboarding (no app download required) and rapid UI iteration for planning features. Native mobile apps (Expo) are strictly deferred to V2.

## Core Feature Categories
Foundational **table stakes** include Auth, Profiles, and Itinerary Timeline CRUD. 
The absolute **Differentiators (Moats)** for the Web V1 are Tinder-swipe interactive voting, Drag-and-drop Room/Ride Allocation, Auto-parsing Hub, and Photo-Proof Attendance via browser camera.

## Key Architecture Pivot
1. **Web App First Strategy**: To maximize group adoption, joining a trip must be a simple URL click.
2. **Deferred Deep-Tech**: Continuous Live Location and Offline Bluetooth Mesh Network are officially deferred to Phase 2 (Native App) because Browsers cannot reliably execute these processes in the background.
3. **Data Integrity**: Letting multiple users edit the itinerary concurrently causes DB crashes. The "Leader-driven" architecture decision is maintained.
