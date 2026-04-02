---
phase: 03
slug: logistics-attendance
status: ready
nyquist_compliant: true
wave_0_complete: false
created: 2026-03-28
---

# Phase 03 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | jest 29.x for API, vitest + Testing Library for web |
| **Config file** | `apps/api/package.json`, `apps/web/package.json` |
| **Quick run command** | `npm run test -w apps/api -- --runInBand` for backend tasks, `npm run lint -w apps/web && npm run check-types -w apps/web` for frontend tasks |
| **Full suite command** | `npm run test -w apps/api -- --runInBand && npm run lint -w apps/web && npm run check-types -w apps/web && npm run test:ui -w apps/web` |
| **Estimated runtime** | ~75 seconds |

---

## Sampling Rate

- **After every backend task commit:** Run `npm run test -w apps/api -- --runInBand`
- **After every frontend task commit:** Run `npm run lint -w apps/web && npm run check-types -w apps/web`
- **After every plan wave:** Run `npm run test -w apps/api -- --runInBand && npm run lint -w apps/web && npm run check-types -w apps/web && npm run test:ui -w apps/web`
- **Before `$gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 75 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 1 | LOGI-02 | unit + e2e | `npm run test -w apps/api -- --runInBand` | ❌ W0 | ⬜ pending |
| 03-01-02 | 01 | 1 | LOGI-03 | interaction + typecheck | `npm run lint -w apps/web && npm run check-types -w apps/web` | ❌ W0 | ⬜ pending |
| 03-01-03 | 01 | 1 | LOGI-02, LOGI-03 | interaction + ui | `npm run lint -w apps/web && npm run check-types -w apps/web && npm run test:ui -w apps/web` | ❌ W0 | ⬜ pending |
| 03-02-01 | 02 | 2 | LOGI-01 | unit + e2e | `npm run test -w apps/api -- --runInBand` | ❌ W0 | ⬜ pending |
| 03-02-02 | 02 | 2 | LOGI-01 | interaction + ui | `npm run lint -w apps/web && npm run check-types -w apps/web && npm run test:ui -w apps/web` | ❌ W0 | ⬜ pending |
| 03-03-01 | 03 | 3 | LOGI-04 | unit + e2e | `npm run test -w apps/api -- --runInBand` | ❌ W0 | ⬜ pending |
| 03-03-02 | 03 | 3 | LOGI-05 | interaction + ui | `npm run lint -w apps/web && npm run check-types -w apps/web && npm run test:ui -w apps/web` | ❌ W0 | ⬜ pending |
| 03-03-03 | 03 | 3 | LOGI-04, LOGI-05 | websocket + e2e + ui | `npm run test -w apps/api -- --runInBand && npm run test:ui -w apps/web` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `apps/api/src/logistics/logistics.service.spec.ts` — capacity, duplicate assignment, self-join, and leader override coverage
- [ ] `apps/api/test/phase-03-logistics.e2e-spec.ts` — room/ride allocation and member self-join flow
- [ ] `apps/api/src/checklists/checklists.service.spec.ts` — group ordering, assignee ownership, and completion-toggle coverage
- [ ] `apps/api/src/attendance/attendance.service.spec.ts` — session window, optional location, and submission-state coverage
- [ ] `apps/api/test/phase-03-attendance.e2e-spec.ts` — leader session creation plus leader/member proof submission flow
- [ ] `apps/web/src/components/trip/__tests__/logistics-board.test.tsx` or equivalent — allocation board rendering, self-join affordance, and leader move controls
- [ ] `apps/web/src/components/trip/__tests__/checklist-panel.test.tsx` or equivalent — shared categories plus personal-task rendering and editing
- [ ] `apps/web/src/components/trip/__tests__/attendance-panel.test.tsx` or equivalent — camera/upload fallback and dashboard-state rendering

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Leader drag-and-drop allocation feels usable on both desktop and touch layouts | LOGI-02 | Pointer interaction quality and mobile ergonomics are hard to prove from unit tests alone | Open the logistics board as leader, move members between room and ride slots on desktop-width and mobile-width layouts, and confirm the board remains understandable and assignments persist |
| Member self-join flow communicates remaining capacity clearly | LOGI-03 | Capacity messaging and affordance clarity are presentation-heavy | Open a trip as member, join an available slot, confirm the slot count changes, then attempt to join a full slot and verify the denial message is clear |
| Photo-proof check-in works with real browser permissions and fallback paths for both leader and member | LOGI-04, LOGI-05 | Camera and geolocation permissions vary by device, browser, and local environment | Create a check-in round, have both leader and a member submit proof across camera/location allowed and denied-or-upload fallback paths, then verify both states render correctly on the leader dashboard |
| Attendance dashboard feels realtime enough for leader monitoring | LOGI-04, LOGI-05 | Perceived freshness and broadcast timing are easier to judge manually than from isolated tests | Keep the leader dashboard open while another member submits proof, and confirm the arrived/missing counts and member rows update without a manual page reload |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 75s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** ready for execution planning
