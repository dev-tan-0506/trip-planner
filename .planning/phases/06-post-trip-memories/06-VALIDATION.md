---
phase: 06
slug: post-trip-memories
status: complete
nyquist_compliant: true
wave_0_complete: true
created: 2026-04-02
---

# Phase 06 - Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | jest + vitest |
| **Config file** | `apps/api/test/jest-e2e.json`, `apps/web/vitest.config.ts` |
| **Quick run command** | `npx vitest run --config apps/web/vitest.config.ts apps/web/src/components/trip/__tests__/post-trip-memories.test.tsx` |
| **Full suite command** | `cd apps/api && npx dotenv -e ../../.env -- npm run test:e2e -- test/phase-06-post-trip-memories.e2e-spec.ts` plus `npx vitest run --config apps/web/vitest.config.ts apps/web/src/components/trip/__tests__/post-trip-memories.test.tsx` |
| **Estimated runtime** | quick smoke ~20-30 seconds; full suite ~45-70 seconds |

---

## Sampling Rate

- **After every task commit:** Run the task-scoped smoke command from the verification map below
- **After every plan wave:** Run `cd apps/api && npx dotenv -e ../../.env -- npm run test:e2e -- test/phase-06-post-trip-memories.e2e-spec.ts` and `npx vitest run --config apps/web/vitest.config.ts apps/web/src/components/trip/__tests__/post-trip-memories.test.tsx`
- **Before `$gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds for task smoke checks; 70 seconds at wave boundaries

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 06-01-01 | 01 | 1 | MEMO-01 | prisma/service smoke | `cd apps/api && npx jest src/memories/memories.service.spec.ts --runInBand --testNamePattern "vault|document"` | implemented in 06-01 | green |
| 06-01-02 | 01 | 1 | MEMO-01 | e2e/api | `cd apps/api && npx dotenv -e ../../.env -- npm run test:e2e -- test/phase-06-post-trip-memories.e2e-spec.ts` | implemented in 06-01 | green |
| 06-02-01 | 02 | 2 | MEMO-01 | ui smoke | `npx vitest run --config apps/web/vitest.config.ts apps/web/src/components/trip/__tests__/post-trip-memories.test.tsx --testNamePattern "vault|Kỷ niệm"` | implemented in 06-02 | green |
| 06-03-01 | 03 | 3 | MEMO-02 | service/unit | `cd apps/api && npx jest src/memories/memories.service.spec.ts --runInBand --testNamePattern "anonymous feedback|receipt"` | implemented in 06-03 | green |
| 06-03-02 | 03 | 3 | MEMO-02 | e2e/api | `cd apps/api && npx dotenv -e ../../.env -- npm run test:e2e -- test/phase-06-post-trip-memories.e2e-spec.ts` | implemented in 06-03 | green |
| 06-03-03 | 03 | 3 | MEMO-02 | ui smoke | `npx vitest run --config apps/web/vitest.config.ts apps/web/src/components/trip/__tests__/post-trip-memories.test.tsx --testNamePattern "ẩn danh|feedback"` | implemented in 06-03 | green |
| 06-04-01 | 04 | 4 | MEMO-03, MEMO-04 | service/unit | `cd apps/api && npx jest src/memories/memories.service.spec.ts --runInBand --testNamePattern "souvenir|reunion|dispatch|final day"` | implemented in 06-04 | green |
| 06-05-01 | 05 | 5 | MEMO-03, MEMO-04 | e2e/api | `cd apps/api && npx dotenv -e ../../.env -- npm run test:e2e -- test/phase-06-post-trip-memories.e2e-spec.ts` | implemented in 06-05 | green |
| 06-05-02 | 05 | 5 | MEMO-03, MEMO-04 | ui smoke | `npx vitest run --config apps/web/vitest.config.ts apps/web/src/components/trip/__tests__/post-trip-memories.test.tsx --testNamePattern "souvenir|reunion"` | implemented in 06-05 | green |

Status legend: `pending`, `green`, `red`, `flaky`

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Digital Vault feels safe but not scary | MEMO-01 | Privacy trust depends on copy, hierarchy, and permission cues | Upload one member document and verify the UI clearly explains temporary storage, who can view it, and supported document types |
| Anonymous feedback really feels anonymous to members | MEMO-02 | Perceived trust depends on wording and response confidence, not only schema design | Open the feedback flow as a member and confirm the UX never asks for public identity confirmation in the submission content itself |
| Souvenir reminders feel timely rather than spammy | MEMO-04 | Reminder usefulness depends on tone and timing | View the final-day reminder flow and confirm the suggestions are concise, destination-aware, and easy to act on |
| Reunion organizer feels like a natural follow-up, not an admin chore | MEMO-03 | Retention quality depends on lightness and clarity | Open the reunion flow after eligibility and confirm invite drafting plus availability collection feel playful and low-friction |

---

## Validation Sign-Off

- [x] All planned tasks have automated verify steps
- [x] Sampling continuity keeps every plan covered by e2e or UI smoke checks
- [x] No watch-mode flags
- [x] `nyquist_compliant: true` set in frontmatter
- [x] Execution completed and Phase 06 UAT passed in [06-UAT.md](./06-UAT.md)

**Approval:** approved on 2026-04-03
