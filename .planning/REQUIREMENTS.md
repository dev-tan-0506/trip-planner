# Requirements: Minh Di Dau The

**Defined:** 2026-04-03
**Milestone:** v2.0 Stitch Redesign & Architecture Refactor
**Core Value:** Maximum convenience and reduced group-travel friction through one seamless web experience.

## v2.0 Requirements

Requirements for the current milestone. Each requirement should map to exactly one roadmap phase.

### Design System Foundation

- [ ] **DSYS-01**: The product exposes a shared token system for typography, color, spacing, radius, elevation, and motion that matches the Stitch direction.
- [x] **DSYS-02**: Shared UI primitives live in `packages/ui` and can be reused across public entry, planner-home, trip-hub, and operational-module surfaces.
- [ ] **DSYS-03**: Shared UI primitives support the interaction states required by the product, including loading, empty, error, disabled, and mobile-responsive states.

### Stitch-Covered UI Redesign

- [ ] **UI-01**: The public entry surfaces that have Stitch exports, namely landing, login, and register, visually match the Stitch direction while preserving current navigation and auth behavior.
- [ ] **UI-02**: The planner-home surfaces that have Stitch exports, namely dashboard, shared library, and trip creation, visually match the Stitch direction while preserving current creation and navigation behavior.
- [ ] **UI-03**: The trip-hub surfaces that have Stitch exports, namely trip detail shell, itinerary hub, and member roster, visually match the Stitch direction while preserving join, routing, and workspace behavior.
- [ ] **UI-04**: The operational workspace surfaces that have Stitch exports, namely suggestions, fund, document vault, checklist, check-in, transport, and stay, visually match the Stitch direction while preserving their current domain behavior.
- [ ] **UI-05**: Shipped surfaces without dedicated Stitch exports remain functional in `v2.0` and adopt the shared shell/system styling where touched, without promising a bespoke one-to-one redesign for those surfaces.

### Frontend Architecture Refactor

- [ ] **FEARCH-01**: Oversized public and planner-home route/screen files are decomposed into smaller modules organized by feature responsibility rather than accumulating page logic in a single file.
- [ ] **FEARCH-02**: Shared frontend transport code is decomposed by domain so one file no longer owns the full API surface and all related types.
- [ ] **FEARCH-03**: The trip workspace frontend is decomposed so shell orchestration, information architecture, and operational view ownership are separated into clearer modules.
- [ ] **FEARCH-04**: The redesign does not depend on copy-pasting visual markup across screens; shared patterns are reused through the design system and feature-level composition.

### Backend Architecture Refactor

- [ ] **BEARCH-01**: Oversized backend service files are decomposed into smaller collaborators grouped by domain meaning, such as orchestration, policy, mapping, helper logic, or persistence support.
- [ ] **BEARCH-02**: Backend modules preserve current API behavior while making domain logic easier to trace and modify without editing a single large service file.
- [ ] **BEARCH-03**: Backend response shaping and domain contracts become clearer and more localized so frontend redesign work is not blocked by unclear service boundaries.

### Quality & Regression Safety

- [ ] **QUAL-01**: Core shipped user flows continue to work after the redesign and refactor, including landing, auth, trip creation, trip join, workspace navigation, and the operational workflows covered by the Stitch exports.
- [ ] **QUAL-02**: Runtime Vietnamese-first copy remains correct and user-facing mojibake or encoding issues are eliminated from redesigned core surfaces.
- [ ] **QUAL-03**: The milestone exits with passing typecheck, test, and build pipelines for the maintained packages/apps.
- [ ] **QUAL-04**: Refactor success is measurable in the codebase through reduced hotspot file concentration across current chokepoints such as the web transport layer, trip workspace shell, and major backend services, not only through unchanged runtime behavior.

## Future Requirements

These are intentionally deferred beyond `v2.0`.

### Product Expansion

- **FUTURE-01**: Introduce new major product bets beyond redesign/refactor, such as new AI capability families or new collaboration paradigms.
- **FUTURE-02**: Revisit mobile-first or native expansion work.
- **FUTURE-03**: Add dedicated Stitch redesign coverage later for currently uncovered shipped surfaces such as vote flows, AI, memories, map detail surfaces, template detail, or a full safety command center.

## Out of Scope

- Native/mobile platform expansion during this milestone
- New large product capability areas unrelated to the redesign/refactor goal
- Deep-tech offline/mobile capabilities previously deferred from the web baseline
- Guessing bespoke redesigns for shipped surfaces that do not yet have Stitch coverage
- Broad behavior changes that intentionally replace the shipped product model instead of modernizing it

## Traceability

Roadmap traceability will be filled after phase planning:

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
| FEARCH-02 | 12 |
| FEARCH-03 | 10 |
| FEARCH-04 | 10 |
| BEARCH-01 | 12 |
| BEARCH-02 | 12 |
| BEARCH-03 | 12 |
| QUAL-01 | 12 |
| QUAL-02 | 12 |
| QUAL-03 | 12 |
| QUAL-04 | 12 |
