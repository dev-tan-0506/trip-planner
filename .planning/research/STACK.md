# Project Research: Stack Dimension

## Target Domain
Trip Planning & Travel Utility App ("Mình Đi Đâu Thế")

## Recommended Core Stack
**1. Frontend (Web App V1)**
- **Framework**: Next.js (React) deployed as a Progressive Web App (PWA).
- **Justification**: Maximum virality. A user can invite 10 friends via a Zalo link and they are immediately interacting (voting, viewing timeline) without an 80MB app download. Next.js excels at complex Drag-and-Drop UIs (for Smart Room Allocation).
- **State Management**: Zustand.
- **UI/UX**: TailwindCSS + Framer Motion.

**2. Backend & Database**
- **BaaS / Real-time**: Supabase (PostgreSQL + Realtime Subscriptions).
- **Justification**: The web app needs real-time "Tinder-swipe" voting updates and real-time Photo-proof Check-in dashboards. Supabase handles WebSockets natively.

**3. Future Phase (Native App V2)**
- **Framework**: Expo / React Native.
- **Deferred Tech**: `react-native-ble-plx` (for Offline Mesh) and Background Location Tracking APIs. These require native modules which will be built after V1 Web App validation.

## Confidence Level
High (95%). Pivoting to Web App for V1 drastically reduces Go-To-Market time and removes user friction (app installation), completely validating the core mechanics before investing in deep-tech mobile engineering.
