# Minh Di Dau The

## What This Is

A web-first collaborative trip planning product for Vietnamese-speaking groups. The product centers around one shared workspace for planning, coordinating, and reviewing a trip across itinerary, logistics, finance, safety, AI helpers, and post-trip memories.

## Core Value

Maximum convenience and reduced group-travel friction through one seamless web experience that people can join instantly by URL.

## Current State

- `v1.0` shipped the working baseline.
- The product is already usable end to end on web.
- `v2.0` is focused on redesigning the Stitch-covered core web surfaces and refactoring FE/BE architecture for maintainability.

## Current Milestone: v2.0 Stitch Redesign & Architecture Refactor

**Goal:** Redesign the exported Stitch core surfaces and refactor both frontend and backend into smaller, clearer modules without breaking existing core behavior.

**Target features:**
- Stitch-aligned redesign for the exported public, planner-home, trip-hub, and operational-module surfaces
- Real shared design system built from `packages/ui`
- Frontend refactor into smaller modules organized by responsibility and feature meaning
- Backend refactor into smaller domain-aligned services, helpers, and mappers
- Regression safety so shipped behavior remains stable while `typecheck`, `test`, and `build` stay green
- Shared shell alignment for shipped surfaces that do not yet have dedicated Stitch exports

## Requirements

### Validated

- [x] **Web-first onboarding:** Users can sign up, log in, create trips, and join via shared links.
- [x] **Shared trip workspace:** Itinerary, logistics, finance/safety, AI helpers, and memories coexist in one connected surface.
- [x] **AI trust model:** AI features draft, warn, or summarize without silently mutating trip structure.
- [x] **Leader-controlled structural edits:** Structural trip changes remain leader-gated by default.

### Active

- [ ] **V2 redesign:** Stitch-exported core screens should align with the design inventory in `.planning/designs/stitch-v2/SCREEN-INVENTORY.md`.
- [ ] **Coverage discipline:** Shipped surfaces without dedicated Stitch exports should be preserved and aligned through shared system styling, not guessed as bespoke redesigns.
- [ ] **Frontend modularization:** Oversized route, screen, and transport files should be split by responsibility.
- [ ] **Backend modularization:** Oversized domain services should be decomposed into clearer collaborators.
- [ ] **Regression safety:** Core product behavior should remain stable through the redesign/refactor.

### Out of Scope

- **Native/mobile expansion in this milestone** - `v2.0` remains web-first.
- **New large product bets unrelated to redesign/refactor** - this milestone is modernization, not product-direction expansion.
- **Deep-tech offline/mobile capabilities** - still deferred beyond the current web milestone.

## Context

- The product remains web-first because URL-based onboarding is still the fastest adoption path.
- Vietnamese-first tone and accessibility remain core product constraints.
- The shared trip workspace remains the architectural center of the product.
- The current `v2.0` roadmap is grounded in real Stitch exports rather than assuming every shipped surface already has design coverage.

## Constraints

- **[Usability & Access]**: Must stay URL-accessible with no app-install requirement for core use.
- **[Language & Tone]**: Runtime UI should remain Vietnamese-first and friendly.
- **[Refactor Discipline]**: File splitting must follow responsibility boundaries, not arbitrary code motion.
- **[Behavior Stability]**: The redesign cannot casually regress core shipped flows.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| [Web App First Strategy] | Optimizes viral onboarding and keeps the product easy to access. | Locked for `v2.0` |
| [Workspace-Centered Product Shape] | The shared trip workspace is already the strongest structural idea in the product. | Locked for `v2.0` |
| [AI trust model] | AI should assist through draft / warn / summarize flows, not silent structural mutation. | Validated in `v1.0`, carried into `v2.0` |
| [V2 milestone shape] | `v2.0` should modernize UI and architecture before taking on unrelated new scope. | Locked for milestone planning |
| [Stitch coverage rule] | Only exported screens should be promised as exact redesign targets; uncovered surfaces stay behavior-first unless more designs arrive. | Locked for `v2.0` |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition:**
1. Requirements invalidated? Move them to Out of Scope with reason.
2. Requirements validated? Move them to Validated with phase reference.
3. New requirements emerged? Add them to Active.
4. Decisions to log? Add them to Key Decisions.
5. Product framing drifted? Update "What This Is" and Context.

**After each milestone:**
1. Review all sections end to end.
2. Re-check whether Core Value still reflects the product strategy.
3. Audit Out of Scope and confirm the reasons still hold.
4. Update Context with the new shipped baseline.

---
*Last updated: 2026-04-03 after Stitch export inventory review*
