# Phase 08: Landing & Auth Redesign - Research

**Researched:** 2026-04-04
**Domain:** public-entry redesign for a Next.js web app with existing client-side auth restore
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
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

### Deferred Ideas (OUT OF SCOPE)
- `Track proposal realtime sync follow-up`
- `Wire outfit planner to itinerary and weather context`
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| UI-01 | Landing, login, and register visually match Stitch direction while preserving current navigation and auth behavior | Plan should separate shared public-entry composition from route behavior, then lock CTA/auth regression with UI tests |
</phase_requirements>

## Summary

Phase 08 should be planned as a thin public-entry redesign layer on top of existing auth behavior, not as a full product-entry rewrite. The repo already has the key shared UI ingredients from Phase 07 in `@repo/ui`, while the current public-entry routes are still mostly route-local markup in [`apps/web/app/page.tsx`](../../../apps/web/app/page.tsx), [`apps/web/app/auth/login/page.tsx`](../../../apps/web/app/auth/login/page.tsx), and [`apps/web/app/auth/register/page.tsx`](../../../apps/web/app/auth/register/page.tsx).

The main planning risk is not backend integration. It is letting the redesign sprawl into bespoke markup per screen and accidentally breaking the existing signed-in/signed-out routing and login/register submission flow. The safest plan is to create a small shared public-entry layer first, then redesign landing and auth on top of it in parallel.

**Primary recommendation:** plan Phase 08 as shared public-entry composition first, then split landing and auth redesign into separate execution plans that both reuse the shared layer and keep regression tests close to the changed routes.

## Sequencing

1. **Create a shared public-entry layer in `apps/web`**
   - Introduce shared public-entry blocks under `apps/web/src/components/public-entry/` rather than keeping the redesign inside route files.
   - Centralize CTA destination rules for signed-in vs signed-out users so landing and auth screens do not duplicate route logic.
   - Replace the current auth blob-background layout in [`apps/web/app/auth/layout.tsx`](../../../apps/web/app/auth/layout.tsx) with a shared frame aligned to the Stitch direction.

2. **Redesign the landing route as a thin consumer**
   - Keep [`apps/web/app/page.tsx`](../../../apps/web/app/page.tsx) thin and move the main landing composition into a shared component.
   - Use Phase 07 primitives such as `Button`, `Card`, `HeroPanel`, `SectionFrame`, `Badge`, and shared token classes from `@repo/ui`.
   - Keep landing navigation decisive: signed-out users route into auth, signed-in users route into dashboard.

3. **Redesign login and register around a shared auth shell**
   - Preserve the current client flow: submit through `authApi`, run `checkAuth()`, then `router.push('/')`.
   - Correct all mojibake and malformed Vietnamese user-facing strings while moving to shared `Input` and `Button` primitives.
   - Keep the form card dominant even if the surrounding background becomes more expressive.

4. **Lock behavior with route-adjacent UI tests**
   - Use the existing Vitest + Testing Library setup in `apps/web`.
   - Add focused tests for public-entry CTA routing, landing signed-in/signed-out rendering, and auth form submission/link behavior.
   - Keep tests inside `apps/web/src/components/public-entry/__tests__/` so the redesign is validated through real app consumers rather than a separate package-only test harness.

## Technical Risks

| Risk | Why it matters now | Planning implication |
|------|--------------------|----------------------|
| Route-local duplication | Phase 08 can easily ship three visually related screens with copy-pasted layout code | Make a shared public-entry component layer the first plan, not cleanup after the redesign |
| Auth behavior regression | Login/register are already working and should not be “improved” into a new flow | Keep auth API/store interactions unchanged and isolate redesign to presentation + copy cleanup |
| Hydration flicker or wrong CTA state | The landing route currently waits for `isHydrated` before rendering signed-in/out content | Preserve auth hydration semantics and centralize CTA decisions so loading vs resolved states are explicit |
| Mojibake persists inside new UI | Current auth pages already contain malformed Vietnamese strings | Treat copy cleanup as a first-class acceptance criterion in the auth plan |
| Visual density overwhelms auth tasks | Stitch auth exports use heavy collage/background energy | Keep the card and form hierarchy primary; decorative surfaces must remain secondary |
| Faux “marketing IA” scope creep | The Stitch landing export contains broad nav language that could suggest new public sections | Keep top navigation conversion-oriented and avoid adding new public product branches in this phase |

## Integration Constraints

| Area | Constraint |
|------|------------|
| App runtime | `apps/web` is Next 16 + React 19 and already imports `@repo/ui` from the monorepo workspace |
| Global fonts | [`apps/web/app/layout.tsx`](../../../apps/web/app/layout.tsx) already loads `Be_Vietnam_Pro` and `Plus_Jakarta_Sans`, so Phase 08 should consume those variables rather than adding page-level font wiring |
| Auth restore | [`apps/web/src/components/ui/AuthHydration.tsx`](../../../apps/web/src/components/ui/AuthHydration.tsx) hydrates auth state globally; landing must respect that before switching CTA paths |
| Auth behavior | [`apps/web/src/store/useAuthStore.ts`](../../../apps/web/src/store/useAuthStore.ts) and [`apps/web/src/lib/api-client.ts`](../../../apps/web/src/lib/api-client.ts) already encode the working login/register/logout flow and should remain the source of truth |
| Shared UI baseline | Phase 07 already provides primitives and shell pieces in [`packages/ui/src/components/index.ts`](../../../packages/ui/src/components/index.ts) and tokens in [`packages/ui/src/styles/globals.css`](../../../packages/ui/src/styles/globals.css) |
| Test harness | `apps/web` already has Vitest + Testing Library via [`apps/web/vitest.config.ts`](../../../apps/web/vitest.config.ts) and [`apps/web/src/test/setup.tsx`](../../../apps/web/src/test/setup.tsx) |
| UI-SPEC absence | No Phase 08 UI-SPEC exists yet, so planning must rely on locked context plus Stitch design/code refs already listed in `08-CONTEXT.md` |

## Repo-Specific Setup Needed

1. Create a new `apps/web/src/components/public-entry/` slice for shared landing/auth composition.
2. Make [`apps/web/app/page.tsx`](../../../apps/web/app/page.tsx) a thin consumer rather than the main design surface.
3. Rebuild [`apps/web/app/auth/layout.tsx`](../../../apps/web/app/auth/layout.tsx) around a shared auth frame instead of the current blob-only background.
4. Reuse `@repo/ui` primitives directly for CTA buttons and form inputs where the current auth pages still use hand-written HTML controls.
5. Add a small public-entry test surface under `apps/web/src/components/public-entry/__tests__/` instead of introducing a new package-level runner.

## Validation Architecture

Because `.planning/config.json` does not disable `workflow.nyquist_validation`, Phase 08 should include a validation strategy.

### Existing Harness

| Property | Value |
|----------|-------|
| Framework | Vitest 4 + Testing Library in `apps/web` |
| Config file | [`apps/web/vitest.config.ts`](../../../apps/web/vitest.config.ts) |
| Setup file | [`apps/web/src/test/setup.tsx`](../../../apps/web/src/test/setup.tsx) |
| Quick run command | `npm run -w apps/web test:ui` |
| Typecheck command | `npm run check-types` |
| Full build gate | `npm run build` |

### Recommended Test Split For Planning

| Requirement | Validation target | Command |
|-------------|-------------------|---------|
| UI-01 landing direction without route regression | Landing CTA/render tests through `apps/web` public-entry components | `npx vitest run src/components/public-entry/__tests__/landing-page.test.tsx` |
| UI-01 auth direction without behavior regression | Login/register tests for copy, links, submit states, and handler wiring | `npx vitest run src/components/public-entry/__tests__/auth-pages.test.tsx` |
| Shared public-entry reuse | Shared public-entry helper/frame tests | `npx vitest run src/components/public-entry/__tests__/public-entry-shell.test.tsx` |
| Repo-wide safety gate | Typecheck and build after route rewrites | `npm run check-types` and `npm run build` |

### Wave 0 Gaps

- No public-entry test slice exists yet, so the first plan should create the shared component/test folder structure.
- No Phase 08 UI-SPEC exists; tests should lock behavior and content contracts rather than visual pixel parity.
- Current auth routes do not use shared `@repo/ui/Input`, so field-state coverage needs to be asserted after the redesign instead of assumed from earlier phases.

## Environment Availability

Step 2.6: SKIPPED (no external services or new dependencies are required beyond the existing monorepo toolchain and `apps/web` test harness).

## Sources

### Primary

- [`08-CONTEXT.md`](../../../.planning/phases/08-landing-auth-redesign/08-CONTEXT.md)
- [`ROADMAP.md`](../../../.planning/ROADMAP.md)
- [`REQUIREMENTS.md`](../../../.planning/REQUIREMENTS.md)
- [`STATE.md`](../../../.planning/STATE.md)
- [`SCREEN-INVENTORY.md`](../../../.planning/designs/stitch-v2/SCREEN-INVENTORY.md)
- [`landing-page/DESIGN.md`](../../../.planning/designs/stitch-v2/screens/landing-page/DESIGN.md)
- [`landing-page/code.html`](../../../.planning/designs/stitch-v2/screens/landing-page/code.html)
- [`login/DESIGN.md`](../../../.planning/designs/stitch-v2/screens/login/DESIGN.md)
- [`login/code.html`](../../../.planning/designs/stitch-v2/screens/login/code.html)
- [`register/DESIGN.md`](../../../.planning/designs/stitch-v2/screens/register/DESIGN.md)
- [`register/code.html`](../../../.planning/designs/stitch-v2/screens/register/code.html)
- [`apps/web/app/page.tsx`](../../../apps/web/app/page.tsx)
- [`apps/web/app/auth/layout.tsx`](../../../apps/web/app/auth/layout.tsx)
- [`apps/web/app/auth/login/page.tsx`](../../../apps/web/app/auth/login/page.tsx)
- [`apps/web/app/auth/register/page.tsx`](../../../apps/web/app/auth/register/page.tsx)
- [`apps/web/app/layout.tsx`](../../../apps/web/app/layout.tsx)
- [`apps/web/src/components/ui/AuthHydration.tsx`](../../../apps/web/src/components/ui/AuthHydration.tsx)
- [`apps/web/src/store/useAuthStore.ts`](../../../apps/web/src/store/useAuthStore.ts)
- [`apps/web/src/lib/api-client.ts`](../../../apps/web/src/lib/api-client.ts)
- [`apps/web/package.json`](../../../apps/web/package.json)
- [`apps/web/vitest.config.ts`](../../../apps/web/vitest.config.ts)
- [`apps/web/src/test/setup.tsx`](../../../apps/web/src/test/setup.tsx)
- [`packages/ui/src/components/index.ts`](../../../packages/ui/src/components/index.ts)
- [`packages/ui/src/styles/globals.css`](../../../packages/ui/src/styles/globals.css)
- [`07-CONTEXT.md`](../../../.planning/phases/07-design-system-shared-shell-foundation/07-CONTEXT.md)

## Metadata

**Confidence breakdown:**
- Sequencing: HIGH - grounded in locked Phase 08 decisions and current route/component structure
- Technical risks: HIGH - visible from current auth files, hydration pattern, and route-local markup
- Integration constraints: HIGH - read from live repo config and source files
- Validation architecture: HIGH - existing app test harness and commands are present

**Research date:** 2026-04-04
**Valid until:** 2026-05-04
