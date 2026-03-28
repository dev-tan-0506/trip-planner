# Project Research: Pitfalls Dimension

## Target Domain
Trip Planning & Travel Utility App ("Mình Đi Đâu Thế")

## Critical Mistakes & Prevention Strategies

**1. Battery Drain (The Silent Killer)**
- **Warning Sign**: App continuously polls GPS for "Live Location", draining a phone's battery from 100% to 20% in 3 hours during a hike. Users will aggressively delete the app.
- **Prevention Strategy**: Granular location updates. Only poll GPS every 5 minutes unless SOS is active. Implement "Geofencing" (triggering only when arriving at a destination) instead of continuous tracking. Use OS-level significant-change location APIs.

**2. The Offline Data Conflict**
- **Warning Sign**: Two people trying to edit the itinerary while having spotty 3G on a mountain. When they reconnect, the database crashes or overrides data unpredictably.
- **Prevention Strategy**: Enforce strict permission boundaries (Only Leader edits). Implement deterministic sync mechanisms (WatermelonDB) so changes are queued and merged gracefully based on timestamps when the network returns.

**3. Creepy / Invasive Privacy Tracking**
- **Warning Sign**: Members feel surveilled 24/7. Husbands/Wives refuse to install the app due to constant tracking.
- **Prevention Strategy**: Extreme transparency in UI. A giant green/red indicator: "YOUR LOCATION IS SHARED TO THE GROUP". Provide a "Ghost Mode" option (except for SOS). Tracking strictly terminates the millisecond the "Trip Ends".

**4. The "No One Adopts" Friction**
- **Warning Sign**: Leader creates the trip, but 8 members refuse to download an 80MB app just to vote on food.
- **Prevention Strategy**: Implement Web-based fallback via Deep Links/App Clips. Members should be able to do basic tasks (Vote, View Itinerary, Send Photos) via a mobile Web URL without downloading the full Native App. The Native app is only mandatory for offline mesh/live tracking.

**5. Over-engineering the Split Bill**
- **Warning Sign**: Spending 2 months building complex fraction algorithms for "who ate what", which users end up finding too tedious to input during a drunk dinner.
- **Prevention Strategy**: Stick firmly to the "Group Fund" model. One pot of money. Fast, simple, emotionally relaxing.
