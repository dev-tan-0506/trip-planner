---
phase: 05
slug: deep-ai-integration
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-04-01
---

# Phase 05 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | jest + vitest |
| **Config file** | `apps/api/test/jest-e2e.json`, `apps/web/vitest.config.ts` |
| **Quick run command** | `npx vitest run src/components/trip/__tests__/phase-05-ai.test.tsx` |
| **Full suite command** | `npx jest --config test/jest-e2e.json --runInBand test/phase-05-deep-ai-integration.e2e-spec.ts && npx vitest run src/components/trip/__tests__/phase-05-ai.test.tsx` |
| **Estimated runtime** | ~60-90 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run src/components/trip/__tests__/phase-05-ai.test.tsx`
- **After every plan wave:** Run `npx jest --config test/jest-e2e.json --runInBand test/phase-05-deep-ai-integration.e2e-spec.ts && npx vitest run src/components/trip/__tests__/phase-05-ai.test.tsx`
- **Before `$gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 90 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 05-01-01 | 01 | TBD | PLAN-04 | unit/ui | `npx vitest run src/components/trip/__tests__/phase-05-ai.test.tsx` | ❌ W0 | ⬜ pending |
| 05-01-02 | 01 | TBD | PLAN-05 | e2e/ui | `npx jest --config test/jest-e2e.json --runInBand test/phase-05-deep-ai-integration.e2e-spec.ts` | ❌ W0 | ⬜ pending |
| 05-02-01 | 02 | TBD | AIX-01 | e2e | `npx jest --config test/jest-e2e.json --runInBand test/phase-05-deep-ai-integration.e2e-spec.ts` | ❌ W0 | ⬜ pending |
| 05-03-01 | 03 | TBD | AIX-02 | ui | `npx vitest run src/components/trip/__tests__/phase-05-ai.test.tsx` | ❌ W0 | ⬜ pending |
| 05-03-02 | 03 | TBD | AIX-03 | ui | `npx vitest run src/components/trip/__tests__/phase-05-ai.test.tsx` | ❌ W0 | ⬜ pending |
| 05-04-01 | 04 | TBD | AIX-04 | unit/ui | `npx vitest run src/components/trip/__tests__/phase-05-ai.test.tsx` | ❌ W0 | ⬜ pending |
| 05-05-01 | 05 | TBD | FINA-04 | unit/ui/e2e | `npx jest --config test/jest-e2e.json --runInBand test/phase-05-deep-ai-integration.e2e-spec.ts && npx vitest run src/components/trip/__tests__/phase-05-ai.test.tsx` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `apps/api/test/phase-05-deep-ai-integration.e2e-spec.ts` — end-to-end scaffold for route suggestion, booking import review, and cost/health warning behaviors
- [ ] `apps/web/src/components/trip/__tests__/phase-05-ai.test.tsx` — UI regression scaffold for AI cards, confidence labels, review/apply flows, and fallback states
- [ ] Add shared fixtures/mocks for AI-generated draft payloads and low-confidence responses if no reusable test helpers exist yet

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Culinary route suggestion feels useful before apply | PLAN-05 | Route quality and readability are hard to fully prove with assertions alone | Select multiple food spots, run culinary routing, and confirm the suggested order and short reasoning feel sensible before pressing apply |
| Health conflict warning severity feels trustworthy rather than noisy | PLAN-04 | Human judgment is needed to assess warning tone and whether it over-warns | Add itinerary items with and without obvious health/dietary conflicts, then confirm severity labels feel proportional |
| Booking email import review makes extracted data easy to verify before commit | AIX-01 | Parsing trust depends on review ergonomics and editability | Run the booking import flow with realistic sample content, verify extracted fields are easy to inspect/edit, and confirm nothing auto-inserts without approval |
| Local Expert / translator cards stay short and actionable | AIX-02 | Response usefulness depends on content density and CTA clarity | Trigger translation or hidden-gem suggestions and confirm the output is card-like, concise, and easy to act on |
| Outfit suggestion cards feel inspiring but not overcomplicated | AIX-03 | Style recommendation quality is presentation-heavy and taste-sensitive | Trigger outfit suggestions for a destination/weather context and confirm the returned cards are scannable and distinct |
| Daily podcast recap feels lightweight and fun rather than like a media workflow | AIX-04 | Tone, pacing, and perceived usefulness need human evaluation | Generate an end-of-day recap and confirm the audio/text combo feels brief, playful, and easy to consume |
| Cost benchmarking warnings feel cautionary without becoming false-alarm spam | FINA-04 | Benchmark usefulness depends on human judgment around severity and frequency | Review multiple spending contexts and confirm only meaningfully unusual prices trigger stronger warning levels |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 90s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
