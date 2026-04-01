---
phase: 02
slug: the-itinerary-engine
status: ready
nyquist_compliant: true
wave_0_complete: false
created: 2026-03-28
---

# Phase 02 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | jest 29.x for API, lint/typecheck for web |
| **Config file** | `apps/api/package.json` (embedded Jest config), `apps/web/package.json` scripts |
| **Quick run command** | `npm run test -w apps/api -- --runInBand` for backend tasks, `npm run lint && npm run check-types` for frontend tasks |
| **Full suite command** | `npm run test -w apps/api && npm run lint && npm run check-types && npm run test:ui -w apps/web` |
| **Estimated runtime** | ~25-30 seconds for frontline checks, ~45 seconds for the broader phase suite |

---

## Sampling Rate

- **After every backend task commit:** Run `npm run test -w apps/api -- --runInBand`
- **After every frontend task commit before the UI harness exists:** Run `npm run lint && npm run check-types`
- **After every frontend task commit once the UI harness exists:** Run `npm run lint && npm run check-types && npm run test:ui -w apps/web`
- **After every plan wave:** Run `npm run test -w apps/api && npm run lint && npm run check-types && npm run test:ui -w apps/web`
- **Before `$gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 1 | PLAN-01 | unit + e2e | `npm run test -w apps/api -- --runInBand` | ❌ W0 | ⬜ pending |
| 02-01-02 | 01 | 1 | PLAN-02 | unit + lint | `npm run test -w apps/api -- --runInBand` | ❌ W0 | ⬜ pending |
| 02-01-03 | 01 | 1 | PLAN-01 | interaction + typecheck | `npm run lint && npm run check-types` | ❌ W0 | ⬜ pending |
| 02-02-01 | 02 | 2 | PLAN-03 | unit + websocket integration | `npm run test -w apps/api -- --runInBand` | ❌ W0 | ⬜ pending |
| 02-02-02 | 02 | 2 | PLAN-03 | interaction + lint | `npm run lint && npm run check-types` | ❌ W0 | ⬜ pending |
| 02-03-01 | 03 | 3 | TRIP-03 | unit + e2e | `npm run test -w apps/api -- --runInBand` | ❌ W0 | ⬜ pending |
| 02-03-02 | 03 | 3 | TRIP-03 | interaction + typecheck + ui | `npm run lint && npm run check-types && npm run test:ui -w apps/web` | ❌ W0 | ⬜ pending |
| 02-04-01 | 04 | 4 | TRIP-03 | unit + e2e | `npm run test -w apps/api -- --runInBand` | ❌ W0 | ⬜ pending |
| 02-04-02 | 04 | 4 | TRIP-03 | interaction + typecheck + ui | `npm run lint && npm run check-types && npm run test:ui -w apps/web` | ❌ W0 | ⬜ pending |
| 02-04-03 | 04 | 4 | TRIP-03 | clone/publish e2e + ui | `npm run test -w apps/api -- --runInBand && npm run test:ui -w apps/web` | ❌ W0 | ⬜ pending |
| 02-05-01 | 05 | 5 | PLAN-01 | interaction + typecheck | `npm run -w apps/web check-types` | ✅ | ⬜ pending |
| 02-05-02 | 05 | 5 | PLAN-01, PLAN-02 | interaction + ui regression | `npx vitest run src/components/trip/__tests__/trip-workspace.test.tsx` | ✅ | ⬜ pending |
| 02-05-03 | 05 | 5 | PLAN-01, PLAN-02 | browser checkpoint + automated prerequisites | `npm run -w apps/web check-types && npx vitest run src/components/trip/__tests__/trip-workspace.test.tsx` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `apps/api/src/itinerary/itinerary.service.spec.ts` — unit coverage for ordering, move-between-days logic, and overlap validation
- [ ] `apps/api/src/proposals/proposals.service.spec.ts` — permission and stale-proposal coverage
- [ ] `apps/api/src/votes/votes.service.spec.ts` — vote deadline, tie-break, and latest-ballot coverage
- [ ] `apps/api/test/phase-02-itinerary.e2e-spec.ts` — end-to-end itinerary, proposal, and voting API flow
- [ ] `apps/api/src/templates/templates.service.spec.ts` — template sanitization, deep-copy clone, and leader-only publish coverage
- [ ] `apps/web/src/app/trip/[joinCode]/__tests__/itinerary-workspace.test.tsx` or equivalent interaction test harness — UI coverage for timeline state rendering and map launch behavior
- [ ] `apps/web/src/components/templates/__tests__/template-library.test.tsx` — template preview, publish visibility, and clone-dialog coverage
- [ ] `apps/web` test runner setup — install and configure a frontend test runner if no existing harness is present

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Swipe-first voting experience feels usable on touch and desktop fallback | PLAN-03 | Gesture quality and UX clarity are hard to prove from API tests alone | Open a vote session on mobile-width and desktop-width layouts, cast and change votes, and confirm the same vote state and interim results appear |
| Timeline auto-scroll and current-state highlighting feel clear across long itineraries | PLAN-01, PLAN-02 | Visual emphasis and scroll positioning are presentation-heavy | Seed a multi-day itinerary with past, current, future, and untimed items; open the timeline and confirm the current region is brought into view and states are visually distinct |
| Leader drag-and-drop reorder works in a real browser and persists after refresh | PLAN-01, PLAN-02 | The diagnosed gap is specifically browser-behavioral and cannot be fully closed by static or synthetic assertions alone | As leader, drag one itinerary card within the same day and across days, refresh, and confirm the new position persists; as member, confirm no drag handle appears |
| Map focus from a specific itinerary item is understandable | PLAN-01 | Focus transitions and remembered day filters are interaction-specific | Open the map from a specific item, confirm the correct day filter persists, and verify the chosen marker is highlighted immediately |
| Published templates never leak member data, join codes, vote data, or proposal history | TRIP-03 | Sanitized output quality is easiest to confirm by inspecting the rendered template detail view | Publish a template from a populated trip, open the template preview, and confirm no member names, join codes, vote data, or proposal history are visible anywhere in the UI |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 60s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** ready for execution planning
