# Roadmap: Minh Di Dau The

## Active Milestone

**v2.0 - Stitch Redesign & Architecture Refactor**

**Goal:** Redesign the Stitch-exported core web surfaces and refactor both frontend and backend into smaller, clearer modules without breaking existing core behavior.

**Phase numbering:** Continues from `v1.0`, so this milestone starts at Phase `07`.

**Scope note:** This roadmap is grounded in the exported Stitch inventory under `.planning/designs/stitch-v2/screens`. Screens that do not yet have dedicated Stitch exports remain in scope for behavior preservation and shared-system alignment, but are not promised as bespoke one-to-one redesign targets in this milestone.

## Phases

### Phase 07: Design System & Shared Shell Foundation

**Goal**: Establish the shared token, primitive, and shell foundation that the Stitch-covered redesign will build on.
**Requirements**: DSYS-01, DSYS-02, DSYS-03
**UI hint**: yes
**Dependencies**: none
**Plans:** 2/7 plans executed

Plans:
- [x] 07-01-PLAN.md — Stabilize the shared UI package boundary and style infrastructure.
- [x] 07-02-PLAN.md — Move token authority into `packages/ui` and reduce app globals to wiring.
- [ ] 07-03-PLAN.md — Build the core action, input, and identity primitives.
- [ ] 07-04-PLAN.md — Build the shared surface, overlay, and state primitives.
- [ ] 07-05-PLAN.md — Compose shared planner chrome blocks from the primitive system.
- [ ] 07-06-PLAN.md — Compose shared hero, status, and quick-action shell blocks.
- [ ] 07-07-PLAN.md — Add app consumer proof and validation gates for the new system.

**Success criteria:**
1. A real shared token system exists for typography, color, spacing, radius, elevation, and motion.
2. `packages/ui` contains reusable primitives that can be consumed by multiple app areas.
3. Shared primitives support the loading, empty, error, disabled, and responsive states needed by the product.
4. Shared shell patterns for search, notifications, account affordances, hero cards, and rounded action surfaces no longer need to be rebuilt ad hoc inside feature screens.

### Phase 08: Landing & Auth Redesign

**Goal**: Apply the Stitch direction to the exported public entry surfaces without breaking navigation or auth behavior.
**Requirements**: UI-01
**UI hint**: yes
**Dependencies**: Phase 07

**Success criteria:**
1. The landing page matches the Stitch direction and still routes users into the product correctly.
2. Signup and login flows match the new design direction and keep their current behavior.
3. Public-entry patterns are implemented through the design system rather than screen-specific one-offs.
4. Vietnamese-first copy remains intentional and readable across the new entry surfaces.

### Phase 09: Planner Home & Creation Redesign

**Goal**: Redesign the exported planner-home surfaces and start shrinking oversized route/screen files in that area.
**Requirements**: UI-02, FEARCH-01
**UI hint**: yes
**Dependencies**: Phase 08

**Success criteria:**
1. Dashboard, shared library, and trip creation surfaces align visually with the Stitch direction.
2. Current creation and navigation behavior remains intact across those surfaces.
3. Oversized public/planner-home route and screen files are split into smaller modules grouped by feature responsibility.
4. The redesign avoids re-embedding large layout and card systems directly inside route files.

### Phase 10: Trip Hub IA & Frontend Decomposition

**Goal**: Redesign the exported trip-hub surfaces and decompose the workspace frontend around the new information architecture.
**Requirements**: UI-03, FEARCH-03, FEARCH-04
**UI hint**: yes
**Dependencies**: Phase 09

**Success criteria:**
1. The trip detail shell, itinerary hub, and member roster align visually with the Stitch exports.
2. The current workspace entry route preserves join, routing, and shell behavior.
3. The workspace frontend is decomposed so shell orchestration, information architecture, and operational module ownership are clearer.
4. Shared trip-hub patterns are composed through reusable primitives and feature modules rather than duplicated one-off markup.

### Phase 11: Operational Module Redesign

**Goal**: Redesign the exported operational workspace modules and keep non-exported surfaces usable through shared-system alignment.
**Requirements**: UI-04, UI-05
**UI hint**: yes
**Dependencies**: Phase 10

**Success criteria:**
1. Suggestions, fund, document vault, checklist, check-in, transport, and stay surfaces align with the Stitch exports.
2. The redesigned experience remains usable across desktop and mobile breakpoints for these core operational flows.
3. Non-exported shipped surfaces remain functional and visually coherent where shared shell/system work touches them.
4. The current combined workspace model is no longer forced to hide every operational concern behind one oversized view boundary.

### Phase 12: Contracts, Backend Boundaries & Regression Gates

**Goal**: Split frontend contracts by domain, refactor oversized backend services, and prove the redesigned milestone preserved core behavior.
**Requirements**: FEARCH-02, BEARCH-01, BEARCH-02, BEARCH-03, QUAL-01, QUAL-02, QUAL-03, QUAL-04
**UI hint**: no
**Dependencies**: Phase 11

**Success criteria:**
1. The frontend no longer depends on one monolithic transport/contracts file for the full app surface.
2. Oversized backend services are decomposed into smaller domain-aligned collaborators.
3. Core shipped user flows still work after redesign and refactor, especially the flows covered by the Stitch exports.
4. Vietnamese-first runtime copy is correct across redesigned core surfaces, with mojibake removed.
5. Typecheck, tests, and build pass for the maintained apps/packages.
6. Hotspot file concentration is measurably reduced compared with the `v1.0` baseline.

## Requirement Coverage

| Requirement | Phase |
|-------------|-------|
| DSYS-01 | 07 |
| DSYS-02 | 07 |
| DSYS-03 | 07 |
| UI-01 | 08 |
| UI-02 | 09 |
| UI-03 | 10 |
| UI-04 | 11 |
| UI-05 | 11 |
| FEARCH-01 | 09 |
| FEARCH-03 | 10 |
| FEARCH-04 | 10 |
| FEARCH-02 | 12 |
| BEARCH-01 | 12 |
| BEARCH-02 | 12 |
| BEARCH-03 | 12 |
| QUAL-01 | 12 |
| QUAL-02 | 12 |
| QUAL-03 | 12 |
| QUAL-04 | 12 |

## Milestone Summary

**Total phases:** 6
**Requirements mapped:** 19
**Coverage:** 100%

**Recommended next step:** `$gsd-discuss-phase 07`
