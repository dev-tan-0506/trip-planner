# Phase 07: Design System & Shared Shell Foundation - Context

**Gathered:** 2026-04-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Establish the shared token, primitive, and shell foundation that the Stitch-covered redesign will build on. This phase defines the system language and reusable UI building blocks for later redesign phases. It does not redesign every shipped screen in detail.

</domain>

<decisions>
## Implementation Decisions

### Foundation depth
- **D-01:** Phase 07 should ship a real token system plus semantic surface tiers, not only base tokens.
- **D-02:** The system should explicitly define semantic layers such as app background, section surface, lifted card, glass overlay, CTA emphasis, and urgency state so later phases do not re-invent surface meaning screen by screen.

### Primitive scope
- **D-03:** Phase 07 should ship both low-level primitives and shared shell blocks.
- **D-04:** In addition to primitives such as button, input, card, badge, dialog, tabs, avatar, and icon button, the phase should establish shared shell blocks that match repeated Stitch patterns such as app header, search field, notification trigger, profile chip, hero panel, section frame, action-pill row, and glass navigation.

### Brand fidelity rules
- **D-05:** Stitch visual rules are the default system contract, not soft inspiration.
- **D-06:** The system should treat mega-scale typography, extra-round corners, layered or glass surfaces, no-divider-by-default composition, and playful Vietnamese-first copy as baseline rules.
- **D-07:** Later phases may deviate from those defaults only when accessibility, readability, or behavior clarity clearly requires it.

### Responsive philosophy
- **D-08:** Phase 07 should be desktop-first, mobile-safe.
- **D-09:** Primary composition may follow the desktop-oriented Stitch exports, but tokens, primitives, and shared shell blocks must be designed to support mobile usage safely from the start.

### the agent's Discretion
- Exact token naming scheme, as long as semantic tiers remain clear and reusable.
- Exact package structure inside `packages/ui`, as long as primitives and shell blocks have clean ownership.
- Exact implementation details for responsive mechanics, as long as mobile safety is built into the foundations rather than deferred.

</decisions>

<specifics>
## Specific Ideas

- The Stitch exports should be treated as the visual source of truth for the shared system language.
- The repeated planner chrome across Stitch screens is important enough to be elevated into reusable shell blocks, not left as page-level markup.
- This phase should reduce the amount of styling that currently lives directly inside `apps/web/app/globals.css` and large route files.

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Milestone scope
- `.planning/PROJECT.md` - Current milestone framing, redesign constraints, and Stitch coverage rule.
- `.planning/REQUIREMENTS.md` - DSYS-01, DSYS-02, and DSYS-03 requirements for the shared system.
- `.planning/ROADMAP.md` - Defines Phase 07 boundary and downstream dependency chain.
- `.planning/STATE.md` - Current milestone state and active phase position.

### Design source
- `.planning/designs/stitch-v2/SCREEN-INVENTORY.md` - Inventory of exported Stitch screens and coverage gaps.
- `.planning/designs/stitch-v2/screens/dashboard/DESIGN.md` - Shared Stitch design-system guidance that appears across the exported screens.
- `.planning/designs/stitch-v2/screens/landing-page/code.html` - Public-entry shell and hero patterns.
- `.planning/designs/stitch-v2/screens/dashboard/code.html` - Planner-home shell, header, hero, and card patterns.
- `.planning/designs/stitch-v2/screens/trip-planner-detail/code.html` - Trip-hub shell, quick-action, and layered operational surface patterns.

### Prior decisions
- `.planning/phases/01-foundation-onboarding/01-CONTEXT.md` - Carries forward the playful, web-first, Vietnamese-first UI direction.
- `.planning/phases/03-logistics-attendance/03-CONTEXT.md` - Confirms the workspace remains the operational center and UI should feel practical, interactive, and mobile-friendly.
- `.planning/phases/04-finances-safety/04-CONTEXT.md` - Reinforces urgency-aware operational surfaces and the principle that important trip actions should stay obvious and scannable.

### Existing code context
- `packages/ui/src/button.tsx` - Current UI package is still scaffold-level and needs real design-system ownership.
- `packages/ui/src/card.tsx` - Confirms current `packages/ui` primitives are placeholders rather than production-ready shared components.
- `apps/web/app/globals.css` - Current token and utility definitions are concentrated in the app instead of a reusable system package.
- `apps/web/app/page.tsx` - Current landing page uses ad hoc styling that Phase 07 should replace with shared system primitives and shell patterns.
- `apps/web/app/auth/login/page.tsx` - Current auth surface shows direct page-level styling and copy handling that later redesign phases should consume from the shared system.
- `apps/web/app/dashboard/page.tsx` - Current planner-home surface demonstrates the route-level styling concentration that Phase 07 should reduce.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `apps/web/app/globals.css`: Already contains the first generation of brand colors, font wiring, motion helpers, and glass utilities, so Phase 07 can evolve this into a formal token source rather than inventing from zero.
- `apps/web/src/components`: Existing feature components provide concrete consumers for the design system once the shared package becomes real.
- Stitch export HTML files: Useful as structural references for repeated shell and surface patterns even though they are not implementation-ready code.

### Established Patterns
- Styling is currently concentrated in route files and app-level CSS rather than owned by `packages/ui`.
- The product already leans on rounded cards, colorful gradients, glass surfaces, and motion, but the language is inconsistent and duplicated.
- Shared operational chrome such as search, notifications, account affordances, hero bands, and card stacks is repeated across the exported Stitch screens.

### Integration Points
- `packages/ui` should become the home for both primitives and shared shell blocks used by the web app.
- `apps/web/app/globals.css` should likely be reduced to app wiring and system imports rather than owning the full design language directly.
- Later redesign phases for landing/auth, planner home, trip hub, and operational modules will all depend on the outputs of this phase.

</code_context>

<deferred>
## Deferred Ideas

- Feature-specific domain cards such as fund summary or member roster cards belong to later redesign phases unless they are needed as generic shell infrastructure.
- Bespoke redesign decisions for uncovered surfaces such as votes, AI, memories, and map detail remain outside Phase 07.

</deferred>

---

*Phase: 07-design-system-shared-shell-foundation*
*Context gathered: 2026-04-03*
