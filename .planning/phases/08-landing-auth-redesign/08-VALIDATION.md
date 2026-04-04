---
phase: 08
slug: landing-auth-redesign
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-04-04
---

# Phase 08 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest + Testing Library |
| **Config file** | `apps/web/vitest.config.ts` |
| **Quick run command** | `npm run -w apps/web test:ui` |
| **Full suite command** | `npm run build` |
| **Estimated runtime** | ~45 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run -w apps/web test:ui`
- **After every plan wave:** Run `npm run check-types`
- **Before `$gsd-verify-work`:** Full suite must be green via `npm run build`
- **Max feedback latency:** 90 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 08-01-01 | 01 | 1 | UI-01 | component | `npx vitest run src/components/public-entry/__tests__/public-entry-shell.test.tsx` | ❌ W0 | ⬜ pending |
| 08-02-01 | 02 | 2 | UI-01 | route/component | `npx vitest run src/components/public-entry/__tests__/landing-page.test.tsx` | ❌ W0 | ⬜ pending |
| 08-03-01 | 03 | 2 | UI-01 | route/component | `npx vitest run src/components/public-entry/__tests__/auth-pages.test.tsx` | ❌ W0 | ⬜ pending |
| 08-03-02 | 03 | 2 | UI-01 | integration/typecheck | `npm run check-types` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `apps/web/src/components/public-entry/__tests__/public-entry-shell.test.tsx` — shared public-entry helper and frame tests
- [ ] `apps/web/src/components/public-entry/__tests__/landing-page.test.tsx` — landing signed-in/signed-out CTA coverage
- [ ] `apps/web/src/components/public-entry/__tests__/auth-pages.test.tsx` — login/register copy and submission-flow coverage

*If none: "Existing infrastructure covers all phase requirements."*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Landing hero, collage, and section rhythm remain readable across desktop and mobile widths | UI-01 | Visual density and responsive hierarchy are not fully captured by DOM assertions alone | Open landing in browser at desktop and narrow-mobile widths, confirm hero copy stays readable, CTA buttons remain visible without overlap, and supporting sections do not collapse into clipped content |
| Login/register card remains the dominant focus even with expressive background treatment | UI-01 | Trust/readability balance is a visual judgment beyond unit assertions | Open both auth pages, confirm the card is visually foregrounded, labels remain readable, and decorative background does not compete with inputs or error messages |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 90s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
