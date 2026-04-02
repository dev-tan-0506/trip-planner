---
phase: 05-deep-ai-integration
plan: 05
subsystem: finance-ai
tags: [nestjs, react, fund, advisory-warnings, vitest, jest]
requires:
  - phase: 05-00
    provides: shared phase-05 test harness and trust-language fixtures
  - phase: 05-01
    provides: phase trust model and confidence-label conventions
  - phase: 05-04
    provides: compact AI card patterns inside the trip workspace
provides:
  - Destination-aware cost benchmarking provider and fund warning metadata
  - Inline finance warning card for local cost comparison with severity guidance
  - Phase 05 automated coverage for benchmark severity, fallback copy, and finance-tab rendering
affects: [phase-05, api, ui, testing, finance]
tech-stack:
  added: []
  patterns: [warning-layer benchmarking, destination-aware provider boundary, inline finance advisory cards]
key-files:
  created:
    - apps/api/src/fund/provider/local-cost-benchmark.provider.ts
    - apps/web/src/components/trip/CostBenchmarkWarningCard.tsx
  modified:
    - apps/api/src/fund/fund.service.ts
    - apps/api/src/fund/fund.controller.ts
    - apps/api/src/fund/dto/create-fund-expense.dto.ts
    - apps/api/test/phase-05-deep-ai-integration.e2e-spec.ts
    - apps/web/src/lib/api-client.ts
    - apps/web/src/components/trip/FinanceSafetyTab.tsx
    - apps/web/src/components/trip/__tests__/phase-05-ai.test.tsx
key-decisions:
  - "Cost benchmarking stays advisory-only and lives inside the fund workflow instead of becoming a separate analytics surface."
  - "Missing destination/category data degrades to 'Can xem lai' with non-blocking next-step guidance rather than false certainty."
patterns-established:
  - "Fund expenses now carry benchmark severity, median reference, source label, and trust copy directly in the snapshot contract."
  - "Finance warnings reuse Phase 5 confidence-language patterns through compact cards rendered beside fund context."
requirements-completed: [FINA-04]
duration: 13min
completed: 2026-04-02
---

# Phase 05 Plan 05: Local Cost Benchmarking API

**Destination-aware benchmark warnings attached directly to the finance workflow, with compact UI guidance and full phase e2e coverage**

## Performance

- **Duration:** 13 min
- **Started:** 2026-04-02T19:20:00+07:00
- **Completed:** 2026-04-02T19:33:00+07:00
- **Tasks:** 2
- **Files modified:** 10

## Accomplishments

- Added a dedicated `LocalCostBenchmarkProvider` and wired the fund service/controller to return severity-coded benchmark warnings with `LUU_Y`, `CAN_XEM_LAI`, and `NGUY_CO_CAO`.
- Extended fund expense contracts so finance rows and warning summaries include local median references, source labels, and confidence-aware fallback notes.
- Added `CostBenchmarkWarningCard` to the finance tab so local cost warnings stay close to the spending workflow instead of branching into a separate dashboard.

## Task Commits

Each task was committed atomically:

1. **Task 1: Add destination-aware benchmark evaluation to the fund service** - `8cdc975` (feat)
2. **Task 2: Show cost benchmark warnings inside the finance and safety tab** - `6a5904e` (feat)

## Verification

- `npx jest src/fund/fund.service.spec.ts --runInBand`
- `npx vitest run --config apps/web/vitest.config.ts apps/web/src/components/trip/__tests__/phase-05-ai.test.tsx --testNamePattern "benchmark|cost"`
- `npx dotenv -e ../../.env -- npm run test:e2e -- test/phase-05-deep-ai-integration.e2e-spec.ts`

## Decisions Made

- Kept benchmark guidance Vietnamese-first and non-blocking so the feature warns without pretending to be authoritative market truth.
- Used the finance snapshot itself as the delivery surface for benchmark metadata, which keeps API/UI wiring small and makes the warning card easy to colocate with fund context.

## Issues Encountered

- The initial executor hit a verification blocker because the phase e2e suite needed the local Postgres container running.
- Vitest required an out-of-sandbox rerun on Windows because Vite process spawning failed under sandbox restrictions.

## User Setup Required

None for the feature itself. Automated e2e verification requires the local Postgres service/container to be available at `localhost:5432`.

## Next Phase Readiness

- Phase 05 now includes suggestion, draft, and warning AI patterns that all follow the same confidence-first trust model.
- The remaining work is phase-level bookkeeping and transition into Phase 06.

## Self-Check: PASSED

- Found `.planning/phases/05-deep-ai-integration/05-05-SUMMARY.md`
- Found task commit `8cdc975`
- Found task commit `6a5904e`

---
*Phase: 05-deep-ai-integration*
*Completed: 2026-04-02*
