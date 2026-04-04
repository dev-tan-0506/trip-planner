---
phase: 07
slug: design-system-shared-shell-foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-04
---

# Phase 07 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4 + Testing Library in `apps/web` |
| **Config file** | `apps/web/vitest.config.ts` |
| **Quick run command** | `npm run -w apps/web test:ui` |
| **Full suite command** | `npm run check-types && npm run -w apps/web test:ui && npm run build` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run check-types`
- **After every plan wave:** Run `npm run -w apps/web test:ui`
- **Before `$gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 07-01-01 | 01 | 1 | DSYS-02 | typecheck | `npm run check-types` | ✅ | ⬜ pending |
| 07-01-02 | 01 | 1 | DSYS-02 | typecheck | `npm run check-types` | ✅ | ⬜ pending |
| 07-02-01 | 02 | 2 | DSYS-01 | typecheck | `npm run check-types` | ✅ | ⬜ pending |
| 07-02-02 | 02 | 2 | DSYS-01 | typecheck | `npm run check-types` | ✅ | ⬜ pending |
| 07-03-01 | 03 | 3 | DSYS-02 | typecheck | `npm run check-types` | ✅ | ⬜ pending |
| 07-04-01 | 04 | 4 | DSYS-02, DSYS-03 | typecheck | `npm run check-types` | ✅ | ⬜ pending |
| 07-04-02 | 04 | 4 | DSYS-03 | typecheck | `npm run check-types` | ✅ | ⬜ pending |
| 07-05-01 | 05 | 5 | DSYS-02 | typecheck | `npm run check-types` | ✅ | ⬜ pending |
| 07-05-02 | 05 | 5 | DSYS-02 | typecheck | `npm run check-types` | ✅ | ⬜ pending |
| 07-06-01 | 06 | 6 | DSYS-02 | typecheck | `npm run check-types` | ✅ | ⬜ pending |
| 07-06-02 | 06 | 6 | DSYS-02, DSYS-03 | typecheck | `npm run check-types` | ✅ | ⬜ pending |
| 07-07-01 | 07 | 7 | DSYS-01, DSYS-02, DSYS-03 | typecheck | `npm run check-types` | ✅ | ⬜ pending |
| 07-07-02 | 07 | 7 | DSYS-03 | ui | `npm run -w apps/web test:ui` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `packages/ui/src/styles/globals.css` — shared style entry must exist before shadcn-backed components are generated or imported
- [ ] `packages/ui/src/lib/utils.ts` — alias target for `@repo/ui/lib/utils`

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Shared shell visual hierarchy reads correctly on desktop and mobile-safe layouts | DSYS-02, DSYS-03 | Visual emphasis, first-read anchor, and shell composition quality are not fully covered by grep or unit assertions | Open the Phase 07 preview route after execution, confirm `HeroPanel` is the first-read focal point on desktop surfaces, and verify shell actions remain accessible without hover on mobile-sized viewport |
| Icon-only actions expose an accessible name and visible fallback affordance | DSYS-03 | Automated tests can assert presence, but final accessibility review still needs human confirmation | Inspect `IconButton` and `NotificationTrigger` in the preview route, verify an accessible name exists, and confirm tooltip or visible label fallback behavior is present |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
