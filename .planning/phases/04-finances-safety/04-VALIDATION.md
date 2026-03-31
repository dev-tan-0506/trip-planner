---
phase: 04
slug: finances-safety
status: updated
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-30
---

# Phase 04 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | jest + vitest |
| **Config file** | `apps/api/test/jest-e2e.json`, `apps/web/vitest.config.ts` |
| **Quick run command** | `npx vitest run src/components/trip/__tests__/finance-safety-panel.test.tsx` |
| **Full suite command** | `npx jest --config test/jest-e2e.json --runInBand test/phase-04-finance-safety.e2e-spec.ts && npx vitest run src/components/trip/__tests__/finance-safety-panel.test.tsx` |
| **Estimated runtime** | ~45-60 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run src/components/trip/__tests__/finance-safety-panel.test.tsx`
- **After every plan wave:** Run `npx jest --config test/jest-e2e.json --runInBand test/phase-04-finance-safety.e2e-spec.ts && npx vitest run src/components/trip/__tests__/finance-safety-panel.test.tsx`
- **Before `$gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 60 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 04-01-01 | 01 | 1 | FINA-01 | unit/e2e | `npx jest --config test/jest-e2e.json --runInBand test/phase-04-finance-safety.e2e-spec.ts` | ✅ | ✅ green |
| 04-01-02 | 01 | 1 | FINA-02 | ui/e2e | `npx vitest run src/components/trip/__tests__/finance-safety-panel.test.tsx` | ✅ | ✅ green |
| 04-01-03 | 01 | 1 | FINA-03 | unit/ui | `npx vitest run src/components/trip/__tests__/finance-safety-panel.test.tsx` | ✅ | ✅ green |
| 04-02-01 | 02 | 2 | SAFE-01 | e2e | `npx jest --config test/jest-e2e.json --runInBand test/phase-04-finance-safety.e2e-spec.ts` | ✅ | ✅ green |
| 04-02-02 | 02 | 2 | SAFE-02 | e2e | `npx jest --config test/jest-e2e.json --runInBand test/phase-04-finance-safety.e2e-spec.ts` | ✅ | ✅ green |
| 04-02-03 | 02 | 2 | SAFE-04 | ui/e2e | `npx vitest run src/components/trip/__tests__/finance-safety-panel.test.tsx` | ✅ | ✅ green |
| 04-03-01 | 03 | 3 | SAFE-03 | e2e | `npx jest --config test/jest-e2e.json --runInBand test/phase-04-finance-safety.e2e-spec.ts` | ✅ | ✅ green |
| 04-03-02 | 03 | 3 | SAFE-05 | ui/e2e | `npx vitest run src/components/trip/__tests__/finance-safety-panel.test.tsx` | ✅ | ✅ green |
| 04-03-03 | 03 | 3 | SAFE-03 follow-up | unit/ui/e2e | `npx jest --runInBand src/safety/safety.service.spec.ts` + `npx jest --config test/jest-e2e.json --runInBand test/phase-04-finance-safety.e2e-spec.ts` + `npx vitest run src/components/trip/__tests__/finance-safety-panel.test.tsx` | ✅ | ✅ green |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] `apps/api/test/phase-04-finance-safety.e2e-spec.ts` — e2e scaffold for fund, safety overview, SOS, and resolve flows
- [x] `apps/web/src/components/trip/__tests__/finance-safety-panel.test.tsx` — shared UI regression coverage for finance/safety tab and SOS resolve/dedupe behavior
- [x] Existing infrastructure covers all framework setup; no new test runner install required

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Finance summary feels understandable on mobile and desktop | FINA-01, FINA-03 | Information hierarchy and trust signals are presentation-heavy | Open the finance/safety tab as leader and member, confirm the target/progress/burn-rate cards remain understandable on phone and desktop widths |
| QR contribution guidance feels clear for real users | FINA-02 | Actual transfer confidence depends on copy, spacing, and scan ergonomics | Open the contribution surface on a real phone, scan or inspect the displayed QR options, and confirm the expected next action is obvious |
| SOS urgency is visually distinct from normal planning UI | SAFE-03 | Severity and emotional clarity are hard to prove from isolated assertions | Trigger SOS in the browser and confirm the CTA, sent state, and follow-up actions feel immediate and serious |
| SOS de-escalation feels clear and non-noisy after the situation is stable | SAFE-03 | Human judgment is needed to assess whether the resolved state actually reduces panic/noise | Trigger SOS, acknowledge it, then use `Đã an toàn, tắt khẩn cấp` and confirm the interface clearly communicates closure without repeated browser nags |
| Cultural warning timing feels relevant rather than noisy | SAFE-05 | Warning usefulness depends on real itinerary context and human judgment | Review warnings against itinerary locations/dates and confirm they appear only when contextually meaningful |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 60s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** updated after Phase 4 completion and SOS follow-up hardening
