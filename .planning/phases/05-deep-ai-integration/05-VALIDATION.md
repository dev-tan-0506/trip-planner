---
phase: 05
slug: deep-ai-integration
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-04-01
---

# Phase 05 - Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | jest + vitest |
| **Config file** | `apps/api/test/jest-e2e.json`, `apps/web/vitest.config.ts` |
| **Quick run command** | `npx vitest run --config apps/web/vitest.config.ts apps/web/src/components/trip/__tests__/phase-05-ai.test.tsx --testNamePattern "culinary|booking|warning|podcast"` |
| **Full suite command** | `npx jest --config apps/api/test/jest-e2e.json --runInBand apps/api/test/phase-05-deep-ai-integration.e2e-spec.ts && npx vitest run --config apps/web/vitest.config.ts apps/web/src/components/trip/__tests__/phase-05-ai.test.tsx` |
| **Estimated runtime** | quick smoke ~15-25 seconds; full suite ~45-60 seconds |

---

## Sampling Rate

- **After every task commit:** Run the task-scoped smoke command from the verification map below
- **After every plan wave:** Run `npx jest --config apps/api/test/jest-e2e.json --runInBand apps/api/test/phase-05-deep-ai-integration.e2e-spec.ts && npx vitest run --config apps/web/vitest.config.ts apps/web/src/components/trip/__tests__/phase-05-ai.test.tsx`
- **Before `$gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 25 seconds for task smoke checks; 60 seconds at wave boundaries

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 05-00-01 | 00 | 0 | scaffold | ui | `npx vitest run --config apps/web/vitest.config.ts apps/web/src/components/trip/__tests__/phase-05-ai.test.tsx` | planned via 05-00 | pending |
| 05-00-02 | 00 | 0 | scaffold | e2e | `npx jest --config apps/api/test/jest-e2e.json --runInBand apps/api/test/phase-05-deep-ai-integration.e2e-spec.ts` | planned via 05-00 | pending |
| 05-01-01 | 01 | 1 | PLAN-04 | e2e/api | `npx jest --config apps/api/test/jest-e2e.json --runInBand apps/api/test/phase-05-deep-ai-integration.e2e-spec.ts --testNamePattern "culinary route|health|non-mutation"` | depends on 05-00 | pending |
| 05-01-02 | 01 | 1 | PLAN-05 | ui smoke | `npx vitest run --config apps/web/vitest.config.ts apps/web/src/components/trip/__tests__/phase-05-ai.test.tsx --testNamePattern "culinary|route"` | depends on 05-00 | pending |
| 05-02-01 | 02 | 2 | AIX-01 | e2e smoke | `npx jest --config apps/api/test/jest-e2e.json --runInBand apps/api/test/phase-05-deep-ai-integration.e2e-spec.ts --testNamePattern "booking import|forwarding"` | depends on 05-00 | pending |
| 05-02-02 | 02 | 2 | AIX-01 | ui smoke | `npx vitest run --config apps/web/vitest.config.ts apps/web/src/components/trip/__tests__/phase-05-ai.test.tsx --testNamePattern "booking import|review sheet"` | depends on 05-00 | pending |
| 05-03-01 | 03 | 3 | AIX-02 | e2e/api | `npx jest --config apps/api/test/jest-e2e.json --runInBand apps/api/test/phase-05-deep-ai-integration.e2e-spec.ts --testNamePattern "menu|hidden spot|local expert"` | depends on 05-00 | pending |
| 05-03-02 | 03 | 3 | AIX-03 | ui | `npx vitest run --config apps/web/vitest.config.ts apps/web/src/components/trip/__tests__/phase-05-ai.test.tsx --testNamePattern "outfit"` | depends on 05-00 | pending |
| 05-04-01 | 04 | 4 | AIX-04 | e2e smoke | `npx jest --config apps/api/test/jest-e2e.json --runInBand apps/api/test/phase-05-deep-ai-integration.e2e-spec.ts --testNamePattern "daily podcast|recap"` | depends on 05-00 | pending |
| 05-04-02 | 04 | 4 | AIX-04 | ui smoke | `npx vitest run --config apps/web/vitest.config.ts apps/web/src/components/trip/__tests__/phase-05-ai.test.tsx --testNamePattern "podcast|recap"` | depends on 05-00 | pending |
| 05-05-01 | 05 | 5 | FINA-04 | e2e smoke | `npx jest --config apps/api/test/jest-e2e.json --runInBand apps/api/test/phase-05-deep-ai-integration.e2e-spec.ts --testNamePattern "benchmark|cost"` | depends on 05-00 | pending |
| 05-05-02 | 05 | 5 | FINA-04 | ui smoke | `npx vitest run --config apps/web/vitest.config.ts apps/web/src/components/trip/__tests__/phase-05-ai.test.tsx --testNamePattern "benchmark|cost"` | depends on 05-00 | pending |

Status legend: `pending`, `green`, `red`, `flaky`

---

## Wave 0 Requirements

- [ ] `05-00-PLAN.md` creates `apps/api/test/phase-05-deep-ai-integration.e2e-spec.ts` for route suggestion, booking review, and warning behaviors
- [ ] `05-00-PLAN.md` creates `apps/web/src/components/trip/__tests__/phase-05-ai.test.tsx` for AI cards, confidence labels, review/apply flows, and fallback states
- [ ] `05-00-PLAN.md` creates shared fixtures/mocks for low-confidence AI responses and draft review payloads

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Culinary route suggestion feels useful before apply | PLAN-05 | Route quality and readability are hard to fully prove with assertions alone | Select multiple food spots, run culinary routing, and confirm the suggested order and short reasoning feel sensible before pressing apply |
| Health conflict warning severity feels trustworthy rather than noisy | PLAN-04 | Human judgment is needed to assess warning tone and whether it over-warns | Add itinerary items with and without obvious health or dietary conflicts, then confirm severity labels feel proportional |
| Booking email import review makes extracted data easy to verify before commit | AIX-01 | Parsing trust depends on review ergonomics and editability | Run the booking import flow with realistic sample content, verify extracted fields are easy to inspect or edit, and confirm nothing auto-inserts without leader approval |
| Local Expert and translator cards stay short and actionable | AIX-02 | Response usefulness depends on content density and CTA clarity | Trigger translation or hidden-gem suggestions and confirm the output is card-like, concise, and easy to act on |
| Outfit suggestion cards feel inspiring but not overcomplicated | AIX-03 | Style recommendation quality is presentation-heavy and taste-sensitive | Trigger outfit suggestions for a destination and weather context and confirm the returned cards are scannable and distinct |
| Daily podcast recap feels lightweight and fun rather than like a media workflow | AIX-04 | Tone, pacing, and perceived usefulness need human evaluation | Generate an end-of-day recap and confirm the audio and text combo feels brief, playful, and easy to consume |
| Cost benchmarking warnings feel cautionary without becoming false-alarm spam | FINA-04 | Benchmark usefulness depends on human judgment around severity and frequency | Review multiple spending contexts and confirm only meaningfully unusual prices trigger stronger warning levels |

---

## Validation Sign-Off

- [x] All tasks have automated verify steps or explicit Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 coverage is planned in `05-00-PLAN.md`; execution still pending
- [x] No watch-mode flags
- [x] Task smoke latency targets stay under 30 seconds; full suite remains reserved for wave boundaries
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
