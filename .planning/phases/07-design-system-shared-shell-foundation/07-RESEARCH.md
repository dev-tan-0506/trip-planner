# Phase 07: Design System & Shared Shell Foundation - Research

**Researched:** 2026-04-04
**Domain:** shared frontend design-system foundation in a Next.js/Turbo monorepo
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
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

### Claude's Discretion
- Exact token naming scheme, as long as semantic tiers remain clear and reusable.
- Exact package structure inside `packages/ui`, as long as primitives and shell blocks have clean ownership.
- Exact implementation details for responsive mechanics, as long as mobile safety is built into the foundations rather than deferred.

### Deferred Ideas (OUT OF SCOPE)
- Feature-specific domain cards such as fund summary or member roster cards belong to later redesign phases unless they are needed as generic shell infrastructure.
- Bespoke redesign decisions for uncovered surfaces such as votes, AI, memories, and map detail remain outside Phase 07.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DSYS-01 | Shared tokens for typography, color, spacing, radius, elevation, motion | Sequence starts with token authority migration and semantic surface contract |
| DSYS-02 | Shared primitives in `packages/ui` reused across app areas | Package/export structure and shell-block ownership are defined before route adoption |
| DSYS-03 | Shared primitives support loading, empty, error, disabled, responsive states | Validation gates require state coverage and consumer tests, not static appearance only |
</phase_requirements>

## Summary

Phase 07 should be planned as foundation work in four ordered slices: package/style infrastructure first, token authority second, primitive layer third, and shared shell blocks last. The repo is not starting from a usable shared system: `packages/ui` is scaffold-level, both shadcn configs point at a shared stylesheet that does not exist, and current visual language still lives in [`apps/web/app/globals.css`](/c:/Users/quoct/OneDrive/Desktop/code/designapp/trip-planner/apps/web/app/globals.css).

The main planning risk is not design exploration. It is integration drift between `apps/web`, shadcn alias assumptions, and `packages/ui` exports. If that setup is not stabilized first, every later primitive/shell task will fight broken imports, duplicated tokens, and unclear ownership.

**Primary recommendation:** plan Phase 07 as infrastructure stabilization -> tokens -> primitives -> shell blocks -> consumer proof, with validation at each step.

## Sequencing

1. **Stabilize shared package wiring**
   - Create the shared style entry currently referenced by both `components.json` files: [`packages/ui/src/styles/globals.css`](/c:/Users/quoct/OneDrive/Desktop/code/designapp/trip-planner/packages/ui/src/styles/globals.css).
   - Add/confirm utility modules required by shadcn aliases, especially `@repo/ui/lib/utils`.
   - Replace the current wildcard export-only assumption in [`packages/ui/package.json`](/c:/Users/quoct/OneDrive/Desktop/code/designapp/trip-planner/packages/ui/package.json) with explicit component/lib/style entrypoints if needed by the implementation plan.

2. **Move token authority into `packages/ui`**
   - Treat [`apps/web/app/globals.css`](/c:/Users/quoct/OneDrive/Desktop/code/designapp/trip-planner/apps/web/app/globals.css) as temporary source material, not the lasting authority.
   - Define semantic surface tiers and design tokens in the shared stylesheet/package first.
   - Reduce app globals to import/wiring and app-only overrides.

3. **Build the primitive layer**
   - Replace placeholder primitives in [`packages/ui/src/button.tsx`](/c:/Users/quoct/OneDrive/Desktop/code/designapp/trip-planner/packages/ui/src/button.tsx) and [`packages/ui/src/card.tsx`](/c:/Users/quoct/OneDrive/Desktop/code/designapp/trip-planner/packages/ui/src/card.tsx).
   - Add the Phase 07 primitive inventory in an order that unlocks shell composition: `button`/`icon-button`, `input`/`search-field`, `card`, `badge`, `avatar`, `dialog`, `tabs`, `sheet`, `skeleton`, `empty-state`, `error-state`.
   - Build state support into the primitive contract immediately; do not defer loading/error/disabled/responsive behavior to later phases.

4. **Compose shared shell blocks**
   - Build only the cross-screen shell pieces named in the context/UI spec: header, search, notification trigger, profile chip, hero panel, section frame, action pill row, glass nav, status banner, floating action surface.
   - Keep domain cards and module-specific surfaces out of scope.

5. **Prove consumption in `apps/web`**
   - Add one thin consumer proof in the web app to verify imports, CSS loading, and state rendering.
   - Do not attempt full landing/dashboard redesign in this phase; that belongs to Phases 08-11.

## Technical Risks

| Risk | Why it matters now | Planning implication |
|------|--------------------|----------------------|
| Missing shared stylesheet | Both shadcn configs reference a CSS file that is absent | Make shared style-file creation a first task, not incidental cleanup |
| Alias/export mismatch | shadcn aliases expect `@repo/ui/components` and `@repo/ui/lib/utils`, but `packages/ui` currently exposes only `./src/*.tsx` and no lib/style surface | Add an early package-boundary task before generating components |
| Token ownership split | Current tokens/utilities live in web app globals, which conflicts with DSYS-01/02 | Plan a dedicated token migration step with a clear “web globals reduced” exit condition |
| Placeholder primitives | Current button/card are create-turbo scaffolds and not reusable production components | Treat all existing UI package primitives as replace/remove, not extend |
| State coverage drift | DSYS-03 requires interactive states, but route work later will expose missing states quickly | Each primitive task needs explicit state matrix acceptance criteria |
| Overbuilding shell blocks | Phase scope can sprawl into feature-specific UI redesign | Keep shell blocks generic and reject domain-specific cards until later phases |

## Integration Constraints

| Area | Constraint |
|------|------------|
| Tooling baseline | Monorepo uses npm workspaces with Turbo from root [`package.json`](/c:/Users/quoct/OneDrive/Desktop/code/designapp/trip-planner/package.json) and [`turbo.json`](/c:/Users/quoct/OneDrive/Desktop/code/designapp/trip-planner/turbo.json) |
| App runtime | Web app is Next 16 + React 19 and already depends on `@repo/ui` in [`apps/web/package.json`](/c:/Users/quoct/OneDrive/Desktop/code/designapp/trip-planner/apps/web/package.json) |
| shadcn preset | Both app and package are initialized with `radix-nova`; planning should preserve that preset instead of introducing a second component source |
| CSS contract | `apps/web/components.json` points shadcn Tailwind CSS at `../../packages/ui/src/styles/globals.css`; the plan must make this path real before using generated blocks |
| Import contract | UI imports are expected to resolve through `@repo/ui/components` and `@repo/ui/lib/utils`; planner should avoid per-route local aliases for shared primitives |
| Scope guard | Later redesign phases depend on this system, so Phase 07 should expose reusable building blocks only, not page-specific layouts |

## Repo-Specific Setup Needed

1. Create the missing shared stylesheet under `packages/ui/src/styles/`.
2. Add the `lib/utils` path expected by shadcn aliases.
3. Decide package structure early:
   - Either keep flat `src/*.tsx` exports and add matching wrappers for `components`/`lib`.
   - Or move to explicit folders and exports that match the alias contract.
4. Confirm `apps/web/app/globals.css` imports the shared UI stylesheet instead of owning the full design language.
5. Add at least one consumer example/test path in `apps/web` so CSS + imports are exercised by the existing web test runner.

## Validation Architecture

Because `.planning/config.json` does not disable `workflow.nyquist_validation`, Phase 07 should include validation planning.

### Existing Harness

| Property | Value |
|----------|-------|
| Framework | Vitest 4 + Testing Library in `apps/web` |
| Config file | [`apps/web/vitest.config.ts`](/c:/Users/quoct/OneDrive/Desktop/code/designapp/trip-planner/apps/web/vitest.config.ts) |
| Setup file | [`apps/web/src/test/setup.tsx`](/c:/Users/quoct/OneDrive/Desktop/code/designapp/trip-planner/apps/web/src/test/setup.tsx) |
| Quick run command | `npm run -w apps/web test:ui` |
| Typecheck command | `npm run check-types` |
| Full build gate | `npm run build` |

### Recommended Test Split For Planning

| Requirement | Validation target | Command |
|-------------|-------------------|---------|
| DSYS-01 | Token/shared-style import smoke test in web consumer | `npm run -w apps/web test:ui` |
| DSYS-02 | Primitive rendering tests through `apps/web` consumer imports | `npm run -w apps/web test:ui` |
| DSYS-03 | State matrix tests for loading, empty, error, disabled, responsive class behavior | `npm run -w apps/web test:ui` |

### Wave 0 Gaps

- No `packages/ui` test harness is visible; planner should choose either consumer-driven tests in `apps/web` or add package-local tests explicitly.
- No shared style file exists yet, so CSS import validation must be added as part of Phase 07, not assumed.
- Current scaffold components are not trustworthy baselines; tests should target new contracts, not preserve current behavior.

## Environment Availability

Step 2.6: SKIPPED (no external dependencies identified beyond the repo's existing Node/npm workspace tooling).

## Sources

### Primary

- [`07-CONTEXT.md`](/c:/Users/quoct/OneDrive/Desktop/code/designapp/trip-planner/.planning/phases/07-design-system-shared-shell-foundation/07-CONTEXT.md)
- [`07-UI-SPEC.md`](/c:/Users/quoct/OneDrive/Desktop/code/designapp/trip-planner/.planning/phases/07-design-system-shared-shell-foundation/07-UI-SPEC.md)
- [`REQUIREMENTS.md`](/c:/Users/quoct/OneDrive/Desktop/code/designapp/trip-planner/.planning/REQUIREMENTS.md)
- [`ROADMAP.md`](/c:/Users/quoct/OneDrive/Desktop/code/designapp/trip-planner/.planning/ROADMAP.md)
- [`STATE.md`](/c:/Users/quoct/OneDrive/Desktop/code/designapp/trip-planner/.planning/STATE.md)
- [`apps/web/components.json`](/c:/Users/quoct/OneDrive/Desktop/code/designapp/trip-planner/apps/web/components.json)
- [`packages/ui/components.json`](/c:/Users/quoct/OneDrive/Desktop/code/designapp/trip-planner/packages/ui/components.json)
- [`apps/web/app/globals.css`](/c:/Users/quoct/OneDrive/Desktop/code/designapp/trip-planner/apps/web/app/globals.css)
- [`packages/ui/package.json`](/c:/Users/quoct/OneDrive/Desktop/code/designapp/trip-planner/packages/ui/package.json)
- [`packages/ui/src/button.tsx`](/c:/Users/quoct/OneDrive/Desktop/code/designapp/trip-planner/packages/ui/src/button.tsx)
- [`packages/ui/src/card.tsx`](/c:/Users/quoct/OneDrive/Desktop/code/designapp/trip-planner/packages/ui/src/card.tsx)
- [`package.json`](/c:/Users/quoct/OneDrive/Desktop/code/designapp/trip-planner/package.json)
- [`apps/web/package.json`](/c:/Users/quoct/OneDrive/Desktop/code/designapp/trip-planner/apps/web/package.json)
- [`apps/web/vitest.config.ts`](/c:/Users/quoct/OneDrive/Desktop/code/designapp/trip-planner/apps/web/vitest.config.ts)
- [`apps/web/src/test/setup.tsx`](/c:/Users/quoct/OneDrive/Desktop/code/designapp/trip-planner/apps/web/src/test/setup.tsx)
- [`turbo.json`](/c:/Users/quoct/OneDrive/Desktop/code/designapp/trip-planner/turbo.json)

## Metadata

**Confidence breakdown:**
- Sequencing: HIGH - directly grounded in current repo state and locked phase decisions
- Technical risks: HIGH - visible from current package/config mismatches
- Integration constraints: HIGH - read from live monorepo config
- Validation architecture: HIGH - existing harness and commands are present in repo

**Research date:** 2026-04-04
**Valid until:** 2026-05-04
