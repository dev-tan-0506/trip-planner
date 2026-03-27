---
phase: 1
slug: foundation-onboarding
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-03-28
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Jest (NestJS) + Vitest (Next.js) |
| **Config file** | `apps/api/jest.config.js`, `apps/web/vitest.config.ts` |
| **Quick run command** | `npm run test` (in respective app) |
| **Full suite command** | `npm run test:e2e` (in apps/api) |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run test` in the modified app
- **After every plan wave:** Run full test suite `npm run test:all` from root
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 20 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| TBD     | TBD  | W1   | AUTH-01     | e2e       | `npm run test:e2e`| ❌ W0       | ⬜ pending |
| TBD     | TBD  | W1   | AUTH-02     | unit      | `npm run test`    | ❌ W0       | ⬜ pending |
| TBD     | TBD  | W2   | TRIP-01     | e2e       | `npm run test:e2e`| ❌ W0       | ⬜ pending |
| TBD     | TBD  | W2   | TRIP-02     | unit      | `npm run test`    | ❌ W0       | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `apps/api/test/app.e2e-spec.ts` — E2E test setup for NestJS
- [ ] `apps/web/vitest.config.ts` — Frontend test setup
- [ ] `npx create-turbo@latest` — Initial monorepo scaffolding infrastructure

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| OAuth Google Login | AUTH-01 | Requires real browser redirect and Google consent | 1. Click "Login with Google". 2. Select account. 3. Verify successful redirect. |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 20s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
