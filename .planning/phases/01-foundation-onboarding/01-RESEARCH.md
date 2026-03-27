# Phase 1: Foundation & Onboarding - Research

## Context Overview
The goal of Phase 1 is to establish the greenfield project architecture and build the initial user onboarding flow. The tech stack has been pivoted to a robust full-stack solution: Next.js (Frontend) + NestJS (Backend) + PostgreSQL (Database via Prisma). Authentication will use a hybrid approach (Social, Email, Magic Link), likely leveraging Supabase Auth to handle token issuance.

## 1. Monorepo Setup (Next.js + NestJS)
Since there is no existing code, the most effective way to manage a Next.js web app and a NestJS backend is a **Turborepo** monorepo structure:
- `apps/web`: Next.js 14+ (App Router), Tailwind CSS, Shadcn UI, Zustand.
- `apps/api`: NestJS 10+, Prisma ORM, Swagger for REST API docs.
- `packages/config`: ESLint, TypeScript config sharing.
- `packages/database`: Prisma schema and generated client.

## 2. Database & ORM (Prisma + PostgreSQL)
Prisma is ideal for managing the relational complexity of Trips and Users.
**Core Entities needed for Phase 1:**
- `User`: id, email, name, avatarUrl, healthProfile (JSON/String).
- `Trip`: id, name, destination, startDate, endDate, joinCode (URL slug).
- `TripMember`: M-N relation mapping User to Trip with roles (LEADER, MEMBER).

## 3. Authentication (Supabase Auth integration)
Using Supabase Auth as the identity provider is highly recommended because it handles OAuth (Google/Facebook) and Magic Links out of the box.
**Workflow:**
1. Frontend Next.js authenticates user via `@supabase/supabase-js`.
2. Frontend receives JWT.
3. Frontend sends JWT in `Authorization: Bearer <token>` to NestJS backend.
4. NestJS backend uses a custom Passport strategy (`passport-jwt`) or Supabase admin SDK to verify the token and extract user identity.

## 4. Guest Join Flow (Virality)
- Link structure: `/trip/[joinCode]`
- If user is not logged in: Next.js fetches trip details from NestJS public endpoint `/api/trips/[joinCode]` and displays read-only details.
- When user clicks "Join/Vote", popup prompts for Supabase Auth login. Upon successful login, Next.js calls POST `/api/trips/[joinCode]/join`.

## Validation Architecture
- **Frameworks:** Jest (for both Next.js and NestJS). E2E testing for API via Supertest.
- **CI/CD Readiness:** GitHub Actions can run tests on PRs.
- **Key Validation Points:**
  - `apps/api`: Unit tests for Prisma service logic. E2E tests for Auth guards.
  - `apps/web`: Component tests for the Trip Preview read-only page to ensure guests don't crash.
