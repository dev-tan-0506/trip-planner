# Project Research: Features Dimension

## Target Milestone
`v2.0` - redesign the full web app to match Stitch while refactoring FE and BE structure.

## Feature Categories For This Milestone

### Category A: Design System Foundation
These are table stakes for a full-app redesign.
- Shared tokens for color, spacing, typography, radius, elevation, and motion
- Reusable primitives in `packages/ui`
- Consistent app shell, section headers, cards, forms, dialogs, tabs, and action bars
- Clear responsive behavior across auth, dashboard, trip workspace, and supporting screens

### Category B: Full-App Screen Redesign
These are the visible user-facing surfaces that should align with the Stitch design direction.
- Auth flows
- Dashboard and trip creation flow
- Trip preview and trip workspace shell
- All major workspace tabs: itinerary, proposals, votes, logistics, checklist, attendance, finance/safety, AI, memories
- Supporting screens such as voting and templates

### Category C: Frontend Architecture Refactor
These are maintainability features, not just cleanup.
- Replace oversized route/page files with screen composition patterns
- Replace oversized feature components with smaller view-model / presentational splits
- Split API client by domain
- Introduce stable feature boundaries so redesign work does not keep leaking across unrelated files

### Category D: Backend Architecture Refactor
These are structural features needed so FE redesign does not sit on top of increasingly hard-to-change services.
- Break oversized services into narrower responsibilities
- Make domain contracts easier to follow and test
- Isolate orchestration from pure logic and persistence details
- Preserve current behavior while reducing blast radius of future changes

### Category E: Regression Safety
These are required for confidence during redesign and refactor.
- Existing core behavior remains intact
- Typecheck, tests, and builds stay green
- Critical user flows keep working: auth, trip creation/join, workspace navigation, major tab workflows

## Recommended In-Scope Set

For this milestone, all five categories above should be treated as in scope:
- Design system foundation
- Full-app screen redesign
- Frontend architecture refactor
- Backend architecture refactor
- Regression safety

## What Should Not Become Scope In This Milestone

- New product-direction pivots
- Native/mobile expansion
- New large AI capabilities beyond what is needed to support the redesign or architecture cleanup
- Broad schema/domain rewrites that change shipped product behavior unless strictly required by refactor

## Milestone Shape

This milestone is best treated as a **platform hardening + UX modernization** milestone:
- redesign every core screen
- refactor the structure underneath
- avoid piling on unrelated new product bets

That keeps the milestone coherent and makes success measurable.
