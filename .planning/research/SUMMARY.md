# Project Research Summary

**Project:** Mình Đi Đâu Thế
**Domain:** Web-first collaborative trip planning workspace
**Researched:** 2026-04-03
**Confidence:** HIGH

## Executive Summary

`v2.0` should be treated as a modernization milestone, not a product-direction reset. The shipped `v1.0` already proved the current web product shape works: onboarding, trip creation/join, the shared workspace shell, and the main trip surfaces are viable. The biggest problems now are visual consistency and maintainability.

The recommended approach is to keep the existing runtime stack and product thesis, then use the milestone to do two things in lockstep: redesign the full frontend to match Stitch, and refactor both FE and BE so code is organized by responsibility instead of accumulating inside oversized files. This keeps scope coherent and directly supports faster future product work.

The highest-risk failure mode would be attempting a full-app redesign without first establishing a real design system and clearer module boundaries. The safest path is to build tokens and shared primitives first, then redesign app shells and feature surfaces while progressively decomposing the largest frontend and backend files.

## Key Findings

### Recommended Stack

The current stack is sufficient. No major platform migration is needed for this milestone.

**Core technologies:**
- **Next.js 16 + React 19**: continue as the app shell for the web-first product
- **Tailwind CSS 4 + Framer Motion**: sufficient for implementing the Stitch visual system
- **NestJS + Prisma + PostgreSQL**: keep as backend foundation while deepening internal boundaries
- **`packages/ui`**: promote from placeholder package into the real shared design-system package

### Expected Milestone Features

**Must have:**
- Shared design tokens and reusable UI primitives
- Full redesign of core app screens to match Stitch
- Frontend feature decomposition and domain-based API client split
- Backend service decomposition by responsibility
- Regression safety across behavior, typecheck, tests, and builds

**Should avoid in this milestone:**
- new mobile/platform bets
- large new product capabilities unrelated to redesign/refactor
- broad behavior rewrites that are not required for maintainability

## Architecture Implications

The main architectural move is to stop letting central files act as default homes for everything.

Current hotspots:
- `apps/web/src/lib/api-client.ts` (~1539 lines)
- `apps/web/src/components/trip/TripWorkspaceShell.tsx` (~666 lines)
- `apps/web/src/components/votes/VoteSessionLobby.tsx` (~611 lines)
- `apps/api/src/itinerary/itinerary.service.ts` (~953 lines)
- `apps/api/src/memories/memories.service.ts` (~559 lines)

`packages/ui` is also underused, which means the codebase currently lacks a true shared UI layer for a whole-app redesign.

## Watch Out For

- Do not redesign screens one by one without shared tokens and primitives.
- Do not treat file splitting alone as architectural success.
- Do not let workspace shell and giant backend services survive unchanged after the milestone.
- Do not mix redesign/refactor work with unrelated new strategic scope.

## Roadmap Guidance

The roadmap for `v2.0` should likely start with:
1. design system foundation
2. app shell and entry-screen redesign
3. trip workspace redesign and FE decomposition
4. backend domain refactor aligned to redesigned surfaces
5. regression hardening and final cleanup

That sequencing gives the milestone a clear spine and keeps the redesign technically sustainable.
