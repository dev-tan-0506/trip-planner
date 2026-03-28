# Project Research: Architecture Dimension

## Target Domain
Trip Planning & Travel Utility App ("Mình Đi Đâu Thế")

## System Structure & Data Flow

**1. Core Component Boundaries**
- **Authentication & Identity**: Manages User profiles, Health/Dietary profiles.
- **Group/Trip Management**: The central aggregate. Contains Trip metadata, Leader permissions.
- **Itinerary Engine**: Manages the Timeline. Handles the Core Logic (CRUD by Leader only) and Auto-parsing integrations.
- **Real-time Interaction Hub**: Manages Votes (Swipe), Smart To-do registrations, and Chat/Comments.
- **Geospatial & Safety Layer**: Manages Live Location broadcasting, SOS triggers, Weather context, and Crowd predict API calls.
- **Financial Module**: Manages Group Fund, Budget goals, and QR generation/payment proofs.
- **Offline Mesh Network**: A standalone native module that intercepts network calls when offline and routes them via BLE to nearby peers.

**2. Data Flow Architecture**
```text
[User Device] <---(WebSockets/BLE)---> [Interaction Hub / Mesh Network]
      |
 (Offline-First local DB: WatermelonDB)
      |
   (Sync)
      v
[Backend - Supabase PostgreSQL] <---(Webhooks/APIs)---> [AI Services & Mapbox]
```
- **Leader Action**: Leader edits timeline -> Saves to Local DB -> Syncs to Backend -> Broadcasts via Supabase Realtime to all members.
- **Member Action**: Member swipes a restaurant -> Hits Backend -> Broadcasts to Leader and Group.
- **Offline Action**: Phone detects No Signal -> Activates BLE Mesh -> Broadcasts SOS/Message to nearby group devices directly without external server.

**3. Suggested Build Order**
- **Phase 1 (Foundation)**: Auth, Group Creation, Leader-driven Itinerary CRUD (No AI/Real-time yet).
- **Phase 2 (Interaction)**: Tinder-swipe voting, Real-time check-ins, To-do list.
- **Phase 3 (Finances & Media)**: Group Fund, Souvenir Planner, Shared Vault.
- **Phase 4 (Deep Tech)**: Live Location, Offline Mesh, Auto-parsing Hub, AI Outfit/Podcast.

## Architectural Implications
Because the app relies on Offline tracking and Mesh networking, the architecture MUST strictly follow an "Offline-First" paradigm. The local device database must be the single source of truth for the UI, passively syncing with the cloud when connection is restored.
