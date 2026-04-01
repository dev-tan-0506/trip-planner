# Phase 5: Deep AI Integration - Research

**Date:** 2026-04-01
**Status:** Complete

## Research Question

What does the codebase already provide, what constraints are already locked by prior phases, and what plan shape will best deliver Phase 5 without breaking the current trip-workspace-first product model?

## Executive Summary

Phase 5 should be planned as a trip-scoped AI augmentation layer, not as a separate AI product surface. The codebase already gives us four strong anchors:

1. `TripWorkspaceShell` is the established home for trip operations and already hosts multiple non-itinerary modules in one place.
2. `User.healthProfile` already exists in the database and auth profile response, so health conflict matching can build on persisted user data instead of introducing a brand-new profile subsystem.
3. The app already favors typed feature modules in `api-client.ts` plus explicit trip-scoped routes and snapshot refreshes, which is a good fit for AI actions that generate drafts or warnings.
4. Timeline and map surfaces already exist, so culinary routing and health/cost signals can attach to existing UX rather than requiring a second planning interface.

The highest-risk area is trust. Phase 5 spans multiple AI-like behaviors with very different confidence profiles: booking parsing, routing, translation, style suggestions, podcast generation, and local-price warnings. The phase plan should therefore separate trustworthy draft/warning flows from more expressive assistant-style outputs, and every plan should preserve manual review before canonical data changes.

## Codebase Findings

### 1. Trip workspace is the canonical UI host

Evidence:
- `apps/web/src/components/trip/TripWorkspaceShell.tsx`
- `apps/web/src/components/trip/FinanceSafetyTab.tsx`
- prior context in `03-CONTEXT.md` and `04-CONTEXT.md`

What this means:
- The product has already converged on one trip-scoped workspace with tabs/cards for timeline, logistics, attendance, finance, and safety.
- AI features should enter through this same shell instead of creating an isolated AI hub.
- Plans should likely include one shell integration task plus feature-specific panels/routes only where needed.

Planning implication:
- Expect at least one plan focused on workspace integration/surface composition, because multiple AI features will need a shared home and navigation pattern.

### 2. Health profile data already exists, but is underused

Evidence:
- `packages/database/prisma/schema.prisma` → `User.healthProfile String?`
- `apps/api/src/auth/auth.service.ts` → `getMe()` returns `healthProfile`
- `apps/web/src/lib/api-client.ts` → `UserProfile.healthProfile`
- `apps/web/src/store/useAuthStore.ts` hydrates the logged-in user profile

What this means:
- The app already persists the raw health-profile payload but does not yet operationalize it anywhere in itinerary logic.
- Health conflict matching can be planned as an overlay on top of itinerary items and trip member data.
- The likely technical work is not profile capture itself, but normalization, rule evaluation, and UI warning presentation.

Planning implication:
- PLAN-04 should be implemented as warning logic attached to itinerary surfaces, not as a separate profile-management feature.
- Planning needs explicit data-shape decisions or normalization steps for `healthProfile` because it is currently a string field and may be loosely structured.

### 3. Timeline + map are already sufficient foundations for culinary routing

Evidence:
- `apps/web/src/components/trip/TimelineDaySection.tsx`
- `apps/web/src/components/trip/TripMapScreen.tsx`
- `apps/web/src/lib/api-client.ts` itinerary snapshot includes `mapItems`
- `02-CONTEXT.md` locked that map is a support surface and timeline remains source of truth

What this means:
- Culinary routing should not become a separate routing product.
- The correct product shape is: user selects relevant food spots, system returns an ordered suggestion, and leader explicitly applies it to the timeline.
- Existing map UI can visualize suggested order; existing timeline UI can host confirmation and final canonical order.

Planning implication:
- PLAN-05 likely needs both backend route-generation logic and frontend review/apply surfaces.
- Because timeline is source of truth, planner should avoid any design that keeps a long-lived parallel “AI route state” separate from itinerary confirmation.

### 4. The app already has a strong pattern for warning-oriented operational modules

Evidence:
- `apps/web/src/components/trip/FinanceSafetyTab.tsx`
- `apps/web/src/components/trip/SOSPanel.tsx`
- `04-CONTEXT.md` decisions around serious warnings, summary-first surfaces, and caution layers

What this means:
- Local cost benchmarking and health conflict signals should behave like contextual warning layers, not giant analytics dashboards.
- The existing UI language already distinguishes between friendly planning UI and more serious risk/caution zones.
- This is a good precedent for `lưu ý` / `cần xem lại` / `nguy cơ cao` severity design.

Planning implication:
- A warning-system plan should likely serve both health conflicts and local cost benchmarking so the app stays consistent.
- Severity labels and copy rules should be specified in plans, not left vague.

### 5. API and client conventions favor trip-scoped modules with typed contracts

Evidence:
- `apps/web/src/lib/api-client.ts`
- current feature modules: itinerary, proposals, votes, logistics, checklists, attendance, fund, safety
- current backend folder structure in `apps/api/src/*`

What this means:
- Phase 5 should follow the same pattern: add clearly scoped API modules rather than sprinkling AI calls into unrelated services.
- Because multiple AI subdomains exist, one monolithic “ai.service.ts” would likely become too broad unless carefully segmented.
- The planner should think in modular slices aligned with product flows, not just “add AI”.

Planning implication:
- Good plan boundaries are likely:
  - routing + health conflict support around itinerary
  - booking import flow
  - local expert / outfit suggestion surfaces
  - podcast generation
  - cost benchmarking
- The exact module split can vary, but the plans should not lump all seven features into one giant execution unit.

## Product And Trust Constraints

### Locked by context

From `05-CONTEXT.md`:
- AI may analyze, recommend, warn, and create drafts.
- AI must not silently rewrite trip structure.
- Trip workspace remains primary.
- Outputs should be card-like, warning-like, or draft-like rather than verbose chatbot transcripts.
- Confidence and fallback language are mandatory.

### Consequences for planning

- Plans must explicitly include review/confirm steps for culinary routing and booking import.
- Plans must explicitly include fallback/manual-edit paths for low-confidence outputs.
- Plans should treat “AI confidence UX” as a real implementation concern, not just copywriting polish.

## Likely Plan Topology

Based on the phase scope and current architecture, a clean plan set would likely split into 4-5 plans:

1. **Culinary routing + health conflict matching**
   - Shared because both attach directly to itinerary items and trip planning surfaces.
2. **Booking email parsing and review/import flow**
   - Separate because it introduces an ingestion pipeline and draft-confirm UX.
3. **Local expert menu translator + outfit planner**
   - Shared because both are suggestion-card style assistant surfaces with lighter canonical-data impact.
4. **AI daily podcast**
   - Separate because it introduces media/script generation and distinct end-of-day UX.
5. **Local cost benchmarking**
   - Separate or paired with a shared warning engine, depending on planner file budget and overlap with health-warning logic.

## Risks And Pitfalls

### Risk 1: Planning too much as “chat UI”

Why risky:
- The product context consistently prefers task-oriented UI embedded in the trip workflow.
- A generic chat interface would ignore the stronger existing pattern of trip-scoped cards, tabs, and warnings.

Prevention:
- Plans should anchor every AI feature to a concrete user task and destination surface.

### Risk 2: AI mutates canonical trip data too early

Why risky:
- Prior phases repeatedly enforce leader authority and explicit structural confirmation.
- Silent auto-apply would conflict with user decisions in `05-CONTEXT.md`.

Prevention:
- Every plan that affects itinerary/fund data must state draft/review/apply behavior explicitly.

### Risk 3: One giant AI backend module

Why risky:
- The codebase currently organizes by feature domain.
- A giant AI module would be hard to test and likely blur product boundaries.

Prevention:
- Keep route/module boundaries aligned to trip workflows even if they share utility code later.

### Risk 4: Confidence language treated as optional polish

Why risky:
- For Phase 5, trust and fallback are part of the product contract, not a cosmetic layer.

Prevention:
- Plans must include explicit acceptance criteria around uncertainty labels, severity states, or review steps.

## Validation Architecture

The phase will require both automated and human validation because the hardest parts are not only correctness, but also trust behavior and review flow safety.

Recommended validation dimensions:

1. **Canonical-data safety**
   - Verify AI outputs do not auto-apply structural changes without confirmation.
2. **Trip-workspace integration**
   - Verify AI entry points live in existing trip surfaces unless intentionally routed out.
3. **Confidence/fallback behavior**
   - Verify ambiguous or partial outputs are labeled as suggestions/estimates and preserve manual override.
4. **Warning semantics**
   - Verify health and cost signals appear with visible severity levels and do not block normal editing unless intentionally designed to.
5. **Draft review flows**
   - Verify booking import and culinary route suggestions are reviewable before becoming canonical.

## Recommended Planning Guidance

- Treat Phase 5 as a multi-wave phase; do not collapse it into one or two oversized plans.
- Keep each plan centered on a user workflow with clear ownership and verification, not on a generic technology bucket.
- Reuse existing trip workspace, timeline, map, and warning patterns aggressively.
- Make trust behavior first-class in acceptance criteria.

## RESEARCH COMPLETE
