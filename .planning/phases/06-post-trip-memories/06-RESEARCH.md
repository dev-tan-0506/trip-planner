# Phase 6: Post-trip & Memories - Research

**Date:** 2026-04-02
**Status:** Complete

## Research Question

What does the current codebase already provide, what constraints are locked by prior phases, and what plan shape will deliver Phase 6 in a web-first way without inventing infrastructure the repo does not yet have?

## Executive Summary

Phase 6 should extend the existing trip workspace with one new memories-oriented surface rather than scattering post-trip features across unrelated routes. The codebase already gives us four strong anchors:

1. `TripWorkspaceShell` is still the canonical host for trip-scoped workflows and already carries planning, logistics, finance, safety, and AI tabs.
2. The app already stores `Trip.startDate` and `Trip.endDate`, so final-day and one-week-after-trip eligibility can be derived without adding scheduler infrastructure first.
3. The repo already has a proven local-file pattern for browser-captured evidence via data URLs in checklist and attendance proof storage services.
4. Phase 5 established the rule that lightweight assistant-style surfaces should stay bounded, contextual, and visible inside the main trip workspace.

The two biggest design risks are privacy and false automation promises. Digital Vault and anonymous feedback both handle sensitive data. Reunion invitations and souvenir reminders sound automated, but the repo does not yet have background jobs, queues, email delivery, or object storage. The phase should therefore plan web-first, fetch-time generation and explicit user-visible status instead of pretending that hidden background systems already exist.

## Codebase Findings

### 1. Trip workspace remains the right UI host

Evidence:
- `apps/web/src/components/trip/TripWorkspaceShell.tsx`
- `apps/web/src/components/trip/FinanceSafetyTab.tsx`
- `apps/web/src/components/trip/AiAssistTab.tsx`

What this means:
- Users already expect trip operations to live in one shell with tabs and panels.
- Phase 6 should add one bounded "memories" tab or panel host instead of creating separate dashboard routes for vault, feedback, souvenirs, and reunion flows.
- Plans should treat that host as the reusable integration point that later tasks extend.

Planning implication:
- The first Phase 6 plan should establish the trip-workspace entry point so later plans can mount their panels without re-deciding navigation.

### 2. Time gating can be derived from `Trip.endDate`

Evidence:
- `packages/database/prisma/schema.prisma` -> `Trip.startDate`, `Trip.endDate`
- `apps/web/src/lib/api-client.ts` already exposes trip dates
- `apps/api/src/daily-podcast/daily-podcast.service.ts` and `apps/api/src/itinerary/itinerary.service.ts` already compute day ranges from trip dates

What this means:
- "Final day" souvenir reminders can be unlocked by comparing `now` to the trip end date or last trip day.
- "1 week after the trip ends" reunion logic can be evaluated at read time on the server without introducing cron or queues in Phase 6.

Planning implication:
- Reunion Organizer should be planned as an eligibility-based workflow that auto-appears once the trip is old enough, not as a background email platform.

### 3. There is no general-purpose file storage layer yet, but there is a working proof-storage pattern

Evidence:
- `apps/api/src/checklists/checklist-proof-storage.service.ts`
- `apps/api/src/attendance/proof-storage.service.ts`
- `apps/web/src/components/trip/CheckInCaptureSheet.tsx`
- `apps/web/src/components/trip/ChecklistItemRow.tsx`

What this means:
- The repo already knows how to accept browser-generated data URLs, validate MIME type, write files locally, and return a URL.
- That pattern currently supports image proof uploads and can be extended to handle `application/pdf` for tickets while still supporting image IDs and screenshots.
- Phase 6 should reuse this pattern rather than inventing multipart upload infrastructure or assuming S3.

Planning implication:
- MEMO-01 should explicitly reuse and extend the proof-storage approach into a temporary vault storage service that supports `image/*` and `application/pdf`.

### 4. Anonymous feedback needs data separation, not just hidden UI copy

Evidence:
- The existing permission model is strongly role-based across proposals, finance, attendance, and AI review flows.
- No current module stores "anonymous but one-per-member" submissions.

What this means:
- If the leader can read rows that still point directly to `tripMemberId`, the feature is not truly anonymous.
- The cleanest Phase 6 shape is a split model:
  - a receipt or eligibility record that proves a member already submitted
  - a separate anonymous submission row that contains only response content
- The API snapshot shown to leaders must exclude any member linkage.

Planning implication:
- MEMO-02 should be planned around a receipt table plus anonymous submission table, not a single "feedback row with hidden name".

### 5. Post-trip retention should stay lightweight and believable

Evidence:
- `apps/api/src/daily-podcast/daily-podcast.service.ts` uses deterministic, web-friendly generation rather than heavy media infrastructure
- Phase 5 and prior contexts repeatedly prefer bounded flows over overbuilt subsystems

What this means:
- Souvenir reminders should likely be compact suggestion cards with destination-aware hints, departure timing, and action reminders.
- Reunion Organizer should likely generate one invite draft plus availability collection inside the app, not full outbound messaging automation.

Planning implication:
- MEMO-03 and MEMO-04 fit best as one shared plan because both are time-triggered retention surfaces with lightweight suggestion and coordination UX.

## Product And Privacy Constraints

### Locked by project context

From `.planning/PROJECT.md` and `.planning/STATE.md`:
- The app must stay 100% Vietnamese and web-first.
- Trip workspace remains the primary context and source of truth.
- Leader authority still matters for structurally sensitive actions.
- Prior phases favor bounded flows, visible status, and explicit review.

### Consequences for Phase 6

- Digital Vault must be obviously temporary and scoped to one trip.
- Members should be able to upload their own sensitive documents without exposing other members' raw files.
- Leaders need a group-ready overview for hotel/airport coordination, but not carte blanche to break privacy boundaries silently.
- Anonymous feedback cannot claim anonymity unless the data model enforces it.
- Reunion and souvenir flows should disclose eligibility timing instead of simulating background automation.

## Likely Plan Topology

A clean Phase 6 split is three plans:

1. **Digital Vault + memories tab foundation**
2. **Anonymous Feedback Poll**
3. **Souvenir Planner + Reunion Organizer**

This keeps plans user-workflow shaped and avoids one giant "post-trip" execution file.

## Risks And Pitfalls

### Risk 1: Treating local file storage as if it were permanent secure cloud storage

Why risky:
- The requirement says "temporary Digital Vault".
- Local dev-disk storage is acceptable for V1 web execution, but the UX must not imply permanent archival or cross-device compliance guarantees.

Prevention:
- Plans should include expiry metadata, Vietnamese warning copy, and bounded supported document types.

### Risk 2: Fake anonymity

Why risky:
- Hiding names in the UI but storing member IDs in leader-facing rows would violate the feature promise.

Prevention:
- Separate receipt tracking from anonymous content rows and keep leader snapshots aggregate-only.

### Risk 3: Overpromising automation for reunion invites

Why risky:
- There is no scheduler, email worker, or messaging gateway in the repo today.

Prevention:
- Make reunion invite generation happen on fetch once eligibility time is reached; expose clear status like "đã tới lúc hẹn reunion" rather than claiming that emails were already sent.

### Risk 4: Scattering Phase 6 across many routes

Why risky:
- This would break the product pattern established across phases 2-5.

Prevention:
- Keep the main entry point inside `TripWorkspaceShell` and mount feature-specific panels there.

## Validation Architecture

The phase needs both automated and human validation.

Recommended validation dimensions:

1. **Privacy boundaries**
2. **Time gating**
3. **Workspace integration**
4. **Temporary-storage honesty**
5. **Retention usefulness**

## Recommended Planning Guidance

- Reuse `TripWorkspaceShell` as the only primary entry point for Phase 6.
- Reuse proof-storage patterns from checklist/attendance for MEMO-01 rather than inventing new upload infrastructure.
- Model anonymity explicitly with separate receipt and submission records.
- Plan reunion as eligibility-based invite generation, not hidden background automation.
- Keep each plan anchored to user-visible workflows and verifiable artifacts.

## RESEARCH COMPLETE
