# Phase 08: Landing & Auth Redesign - Context

**Gathered:** 2026-04-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Apply the Stitch direction to the public-entry surfaces for landing, login, and register while preserving today's routing and authentication behavior. This phase modernizes the visual language, copy tone, and shared composition of those entry surfaces, but does not introduce new authentication capabilities, new public-product sections, or behavior changes outside the existing entry flow.

</domain>

<decisions>
## Implementation Decisions

### Landing composition
- **D-01:** The landing page should remain a marketing-rich public entry surface rather than collapsing into a minimal redirect screen.
- **D-02:** Landing composition should follow the exported Stitch direction closely, including editorial hero scale, layered surfaces, and supporting sections beyond the first CTA.
- **D-03:** The landing experience should still prioritize conversion into the product quickly, so primary actions must route directly into signup, login, or the authenticated dashboard instead of introducing exploratory dead ends.

### Public navigation and CTA behavior
- **D-04:** Public navigation should stay simple and conversion-oriented rather than exposing new public information architecture.
- **D-05:** For signed-out users, the primary CTA path should drive into the existing auth flow.
- **D-06:** For signed-in users, primary CTA behavior should route them into the existing planner/dashboard entry instead of sending them through auth again.
- **D-07:** The redesign should not add new capability branches such as new marketing funnels, community sections, or alternate onboarding paths in this phase.

### Auth surface styling
- **D-08:** Login and register should keep the form card as the visual and interaction focal point so the experience remains clear and trustworthy.
- **D-09:** Auth screens should borrow Stitch energy through background treatment, collage/layering, typography, and shared design-system surfaces, but should not become so visually dense that form completion feels secondary.
- **D-10:** Public-entry patterns should be composed from shared design-system primitives and shared page-level blocks rather than bespoke one-off route markup for each screen.

### Copy tone and readability
- **D-11:** Public-entry copy should remain Vietnamese-first and playful, consistent with the product's established tone.
- **D-12:** The landing page may push the energetic Gen Z voice more aggressively than auth.
- **D-13:** Login and register copy should stay warm and youthful but pull back one step from the loudest landing voice so trust, clarity, and readability remain strong.
- **D-14:** Existing mojibake and malformed Vietnamese strings on the auth surfaces must be corrected as part of this redesign work.

### the agent's Discretion
- Exact section count and section ordering on the landing page, as long as the experience remains clearly marketing-forward and conversion-oriented.
- Exact responsive adaptation of Stitch collage/background treatments, as long as mobile safety and form readability remain intact.
- Exact naming and file decomposition strategy for shared public-entry blocks, as long as the result reduces route-local styling duplication and aligns with the shared design-system direction.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Milestone scope
- `.planning/PROJECT.md` - Product framing, Vietnamese-first constraint, and v2 modernization boundary.
- `.planning/REQUIREMENTS.md` - UI-01 requirement for landing, login, and register redesign without behavior regression.
- `.planning/ROADMAP.md` - Defines Phase 08 scope, dependency on Phase 07, and success criteria.
- `.planning/STATE.md` - Current milestone position and active handoff into Phase 08.

### Design source
- `.planning/designs/stitch-v2/SCREEN-INVENTORY.md` - Confirms the exported public-entry surfaces included in this phase.
- `.planning/designs/stitch-v2/screens/landing-page/DESIGN.md` - Shared Stitch design-system guidance for the landing surface.
- `.planning/designs/stitch-v2/screens/landing-page/code.html` - Canonical landing composition and hero direction.
- `.planning/designs/stitch-v2/screens/login/DESIGN.md` - Shared public/auth direction for the login experience.
- `.planning/designs/stitch-v2/screens/login/code.html` - Canonical login composition, collage treatment, and form emphasis.
- `.planning/designs/stitch-v2/screens/register/DESIGN.md` - Shared public/auth direction for the register experience.
- `.planning/designs/stitch-v2/screens/register/code.html` - Canonical register composition, form structure, and background treatment.

### Prior phase decisions
- `.planning/phases/07-design-system-shared-shell-foundation/07-CONTEXT.md` - Locks the shared-system rules around typography scale, extra-round surfaces, layered glass, and desktop-first mobile-safe composition.

### Existing code context
- `apps/web/app/page.tsx` - Current landing route and current signed-in vs signed-out entry behavior.
- `apps/web/app/auth/login/page.tsx` - Current login implementation, auth submission flow, and mojibake cleanup target.
- `apps/web/app/auth/register/page.tsx` - Current register implementation, auth submission flow, and mojibake cleanup target.
- `apps/web/src/lib/api-client.ts` - Existing login/register API calls and behavior that must remain intact.
- `apps/web/src/store/useAuthStore.ts` - Current hydration, auth state, and logout/checkAuth integration.
- `packages/ui/src/styles/globals.css` - Shared token contract established in Phase 07.
- `packages/ui/src/button.tsx` - Shared CTA primitive for public-entry actions.
- `packages/ui/src/components/input.tsx` - Shared input primitive suitable for auth form reuse.
- `packages/ui/src/components/hero-panel.tsx` - Shared editorial hero pattern that can inform landing composition.
- `packages/ui/src/components/app-header.tsx` - Shared shell/header composition reference for public-entry reuse when appropriate.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `packages/ui/src/button.tsx`: Already provides shared CTA treatment that fits the Phase 07 design language and should replace route-local button styling.
- `packages/ui/src/components/input.tsx`: Gives a shared form field foundation for login/register instead of bespoke input wrappers.
- `packages/ui/src/components/hero-panel.tsx`: Provides a strong shared editorial hero primitive that can anchor the landing page direction.
- `packages/ui/src/components/app-header.tsx`: Offers an existing shell/header pattern that may be adapted for public entry if the fit is clean.
- `packages/ui/src/styles/globals.css`: Central token system already encodes the semantic surfaces, gradients, radii, and typography needed for public-entry redesign.

### Established Patterns
- Current public-entry routes are still heavily route-local and visually inconsistent with the new Stitch-covered system.
- Auth behavior is already simple and should stay simple: submit credentials, populate auth state, then route into the product.
- The shared-system direction favors oversized typography, round surfaces, glass layering, and Vietnamese-first copy rather than flat utilitarian forms.
- Current auth files contain mojibake in user-facing strings, so copy cleanup is both a design-quality and product-quality requirement.

### Integration Points
- `apps/web/app/page.tsx` owns the public root entry logic and must continue handling signed-in vs signed-out entry correctly.
- `apps/web/app/auth/login/page.tsx` and `apps/web/app/auth/register/page.tsx` must keep using the existing auth API/store flow while swapping to shared UI composition.
- Shared public-entry building blocks should likely live in `apps/web/src/components` and compose `packages/ui` primitives instead of duplicating full-screen markup per route.
- Planning should expect some public-entry shared wrappers or sections so Phase 09 can extend the same direction without rebuilding route-local chrome again.

</code_context>

<specifics>
## Specific Ideas

- Landing should feel like a real branded entry experience, not a holding page.
- Landing CTAs should stay decisive: signed-out users go to auth, signed-in users go to dashboard.
- Auth should keep a prominent central form card, with Stitch collage/background energy used as supporting atmosphere rather than the primary focus.
- Copy should stay youthful and Vietnamese-first, but auth should be slightly calmer than landing to preserve clarity and trust.
- Cleaning broken Vietnamese encoding on login/register is part of the expected redesign outcome, not optional polish.

</specifics>

<deferred>
## Deferred Ideas

### Reviewed Todos (not folded)
- `Track proposal realtime sync follow-up` - Deferred because realtime proposal sync belongs to later product/workspace scope, not the public entry redesign boundary for Phase 08.
- `Wire outfit planner to itinerary and weather context` - Deferred because outfit-planner integration belongs to trip/workspace feature scope, not landing/auth redesign.

- No additional deferred product ideas surfaced during discussion beyond the reviewed todos above.

</deferred>

---

*Phase: 08-landing-auth-redesign*
*Context gathered: 2026-04-04*
