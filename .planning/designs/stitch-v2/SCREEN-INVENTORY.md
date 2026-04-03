# Stitch V2 Screen Inventory

**Generated:** 2026-04-03
**Source:** `.planning/designs/stitch-v2/screens`

## Shared Design Signals

The Stitch exports consistently point to one visual system:

- Bold editorial typography with oversized hero copy
- Layered glass / acrylic surfaces instead of flat panels
- Extra-round cards and action pills
- High-energy Vietnamese-first copy and CTA language
- Search / notifications / account chrome repeated across planner surfaces
- Distinct operational screens instead of one overloaded workspace tab

## Exported Screens

### Public Entry

- `landing-page`
  - Product marketing landing page
  - Closest current surface: `apps/web/app/page.tsx`
- `login`
  - Login surface
  - Current surface: `apps/web/app/auth/login/page.tsx`
- `register`
  - Registration surface
  - Current surface: `apps/web/app/auth/register/page.tsx`

### Planner Home

- `dashboard`
  - Personal trip dashboard / trip list
  - Current surface: `apps/web/app/dashboard/page.tsx`
- `library-planner-shared`
  - Shared planner library / cloneable trip ideas
  - Closest current surface: `apps/web/app/templates/page.tsx`
- `create-new-planner-trip`
  - Trip creation flow
  - Closest current surface: `apps/web/app/dashboard/page.tsx`

### Trip Hub

- `trip-planner-detail`
  - Trip command center / itinerary hub / quick actions
  - Current surface: `apps/web/app/trip/[joinCode]/page.tsx`
  - Current frontend hotspot: `apps/web/src/components/trip/TripWorkspaceShell.tsx`
- `list-member-of-trip`
  - Trip member roster and role summary
  - Closest current surface: trip workspace member-related views

### Operational Modules

- `gop-y`
  - Suggestion / proposal surface
- `quy`
  - Fund contribution and spend summary surface
- `giay-to`
  - Shared document vault surface
- `planner-checklists`
  - Checklist / preparation surface
- `trip-checkin`
  - Attendance / check-in surface
- `trip-planner-car`
  - Transport / vehicle allocation surface
- `trip-planner-room`
  - Stay / room assignment surface

These operational screens map most closely to today's workspace modules under `apps/web/src/components/trip/`.

## Coverage Gaps

The current Stitch bundle does **not** include dedicated exports for:

- Map view
- Vote session flow
- AI assistant tab
- Memories tab
- Full safety command center / warning detail views
- Template detail page

## Planning Implications

- The milestone can promise exact Stitch replication for exported screens.
- Non-exported shipped surfaces should stay functional and visually align through shared tokens, shells, and primitives where touched.
- The current workspace IA likely needs decomposition because Stitch separates operational modules that are currently grouped inside larger combined tabs.
