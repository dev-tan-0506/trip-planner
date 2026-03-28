# Project Research: Features Dimension

## Target Domain
Trip Planning & Travel Utility App ("Mình Đi Đâu Thế")

## Feature Categorization

### Table Stakes (Must-Have or Users Leave)
*These are standard baseline features that users expect from any travel planner today.*
- User Authentication & Profile Management.
- Trip Creation (Dates, Destination, Inviting Members via Link).
- Static Itinerary Timeline (Days -> Hours -> Activities).
- Basic Map Integration (Pinning locations on Google/Apple Maps).
- Budget Logging (Simple expense tracking).
- Push Notifications for basic updates.

### Differentiators (Competitive Advantage)
*These features define the "Core Value" and will disrupt current market options.*
- **Interactive Tinder-Swipe Voting**: Eliminates text-chat arguments for food/destinations.
- **Photo-Proof Attendance**: Gamified and strict check-ins.
- **Group Fund & MoMo QR Integration**: Solving the immediate payment friction cleanly.
- **Auto-Parsing Hub**: AI reads forwarded emails to build the timeline instantly.
- **Live Location & Offline Mesh Network**: Safety and communication in remote areas.
- **Local Expert AI & Cultural Warnings**: Highly contextual hyper-personalization.
- **Driver/Room Smart Allocation**: The drag-and-drop / randomizer for large groups.

### Anti-Features (Do Deliberately NOT Build in V1)
- **Real-Time Co-editing Itinerary**: Leads to data conflicts, UI clutter, and destroys the "Leader" concept. High engineering cost with low utility.
- **Automatic Micro Split-Bills**: Calculating who owes who down to the penny ruins the fun travel vibe and causes disputes. Use "Group Fund" instead.
- **Auto-rendered AR Video/Vlogs**: Extensively high rendering costs, server bills, and takes focus away from the core utility function.

### Feature Dependencies
- *Outfit Planner* depends on *Itinerary Timeline* and *Weather APIs*.
- *AI Podcast* depends on *Photo Vault*, *Live Location (Distance)*, and *To-Do tracking*.
- *Mesh Network* depends strictly on *Native Device Capabilities (BLE)*.
