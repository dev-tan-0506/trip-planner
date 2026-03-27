# Phase 1: Foundation & Onboarding - Context

**Gathered:** 2026-03-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Establishing the core technical foundation and initial user onboarding experience for "Mình Đi Đâu Thế". This includes setting up the Next.js frontend, NestJS backend, PostgreSQL database, authentication flows, and initial trip joining screens via shareable web links.

</domain>

<decisions>
## Implementation Decisions

### Architecture & Tech Stack
- **D-01:** Frontend: **Next.js (Web PWA)**.
- **D-02:** Backend: **NestJS** serving REST APIs. This is a deliberate pivot from the initial "backend-less" Supabase approach to ensure strong structural readiness for Phase 2 mobile apps.
- **D-03:** Database: **PostgreSQL** driven by Prisma ORM. Ensures robust relational modeling and ACID compliance for the Group Fund feature.

### Authentication Strategy
- **D-04:** Multi-modal Login: System will support a hybrid approach combining traditional Email/Password, Social Auth (Google/Facebook), and passwordless Magic Links to maximize conversion.

### Guest Join Experience
- **D-05:** "Lôi kéo kiểu hờ hững" (High Virality): Unauthenticated users clicking a trip link are immediately shown the Trip Itinerary (Read-only mode). They are only prompted to register/login when attempting interactive actions (e.g., voting on food, joining a car, editing).

### UI/UX Aesthetic
- **D-06:** Vibrant & Playful: GenZ-friendly styling. Bright colors, rounded corners (chubbly), and bouncy micro-animations (similar to Tinder or Duolingo). Not a dry, minimalist corporate utility.

### the agent's Discretion
- Concrete monorepo setup (e.g., Turborepo, Nx, or standard directories) for Next.js + NestJS.
- Specific component library choices (e.g., Shadcn UI vs pure Tailwind CSS).
- Initial database schema modeling for Users and Trips in Prisma.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Core Requirements
- `.planning/PROJECT.md` — Core product vision and non-negotiable constraints.
- `.planning/REQUIREMENTS.md` — Specific feature requirements (AUTH-01, AUTH-02, TRIP-01, TRIP-02).
- `.planning/ROADMAP.md` — Phase boundaries.
- `.planning/research/STACK.md` — Tech stack context (Web PWA).

</canonical_refs>
