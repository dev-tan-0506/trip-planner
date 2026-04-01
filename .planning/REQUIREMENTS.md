# Requirements: Mình Đi Đâu Thế

## v1 Requirements (Web App PWA)

### AUTH: Authentication & Profiles
- [ ] **AUTH-01**: User can sign up and log in via Email or Social Auth (Google/Facebook) without installing a native app.
- [ ] **AUTH-02**: User can create and edit a personal health profile (allergies, motion sickness).

### TRIP: Trip Management
- [ ] **TRIP-01**: User (Leader) can create a new trip with destination, dates, and a shareable join link.
- [ ] **TRIP-02**: User can join an existing trip via a shared URL without immediate account creation (Guest friction removal).
- [ ] **TRIP-03**: User can clone an entire itinerary from the Community Template Library with a single click.

### PLAN: Itinerary & Timeline
- [ ] **PLAN-01**: Leader can add, edit, and reorder activities and locations on a drag-and-drop timeline.
- [ ] **PLAN-02**: Members can view the real-time timeline but cannot edit its structural data.
- [ ] **PLAN-03**: Members can participate in Tinder-style card swiping to vote on suggested food/activity options.
- [x] **PLAN-04**: System automatically alerts the group if an added activity conflicts with a member's health profile (e.g., seafood allergy).
- [x] **PLAN-05**: User can invoke "Culinary Routing" to have AI auto-generate the optimal geographical route between selected food spots.

### LOGI: Logistics & Attendance
- [ ] **LOGI-01**: Leader can create packing checklists and to-do items assigned to specific members.
- [x] **LOGI-02**: Leader can use the "Smart Room & Ride Allocation" drag-and-drop UI to distribute members into cars and rooms.
- [x] **LOGI-03**: Members can view available ride/room slots and auto-register themselves.
- [ ] **LOGI-04**: Leader can trigger a "Photo-Proof Check-in" request for a specific gathering point and time.
- [ ] **LOGI-05**: Members must upload a selfie (via browser camera) at the gathering point to be marked "Arrived" on the real-time dashboard.

### FINA: Finances & Fund
- [ ] **FINA-01**: Treasurer can create a centralized "Group Fund" target amount.
- [ ] **FINA-02**: Treasurer can display a unified MoMo/Bank QR code for members to send their fund contributions.
- [ ] **FINA-03**: Members can view the total fund pool and the percentage spent vs. budget (Burn Rate).
- [ ] **FINA-04**: System flags planned expenses if they significantly exceed "Local Cost Benchmarking" data.

### SAFE: Safety & Alerts
- [ ] **SAFE-01**: User can view a 5-day weather forecast specific to the upcoming itinerary locations.
- [ ] **SAFE-02**: User can view real-time crowd predictions for major tourist attractions.
- [ ] **SAFE-03**: User can press a Web-based SOS button to send a high-priority alert to all group members.
- [ ] **SAFE-04**: User can access a localized directory of verified mechanics, pharmacies, and clinics.
- [ ] **SAFE-05**: System flashes browser warnings when the group approaches culturally sensitive locations (e.g., dress codes for temples).

### AIX: Smart AI Features
- [x] **AIX-01**: User can forward booking emails to an app-specific email address; AI auto-parses and slots them into the timeline.
- [x] **AIX-02**: User can ask the "Local Expert AI" to translate menus or suggest hidden local spots.
- [x] **AIX-03**: Leader can request an "AI Outfit Planner" suggestion based on weather and destination aesthetics.
- [ ] **AIX-04**: System generates a humorous 2-minute "AI Daily Podcast" audio summary at the end of each trip day.

### MEMO: Post-Trip Experience
- [ ] **MEMO-01**: Leader can gather ID cards and tickets securely into a temporary "Digital Vault" for rapid hotel check-ins.
- [ ] **MEMO-02**: Members can participate in a fun, anonymous feedback poll at the end of the trip.
- [ ] **MEMO-03**: System auto-sends an e-invite 1 week after the trip ends to organize a reunion dinner based on members' schedules.
- [ ] **MEMO-04**: User receives Souvenir purchase reminders and authentic location suggestions on the final day.

## v2 Requirements (Deferred to Native Mobile Phase)
- **MESH-01**: App falls back to BLE Mesh Network for messaging when cellular data is lost.
- **LOCA-01**: App tracks device location continuously in the background using native APIs and broadcasts to the group map.

## Out of Scope
- **Automated Split-Bill Algorithms**: Focus solely on Group Fund collection to prevent emotional debt disputes.
- **Real-time Timeline Co-editing (CRDT)**: High engineering cost, risks data chaos. Leader maintains sole structural editing permission.
- **Auto-rendered Vlogs & AR Overlays**: Excluded due to heavy processing constraints.

## Traceability
<!-- Populated during roadmap generation -->
