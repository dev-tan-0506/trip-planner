---
phase: 05-deep-ai-integration
plan: 04
subsystem: ui
tags: [nestjs, react, ai-recap, browser-tts, vitest, jest, trip-workspace]
requires:
  - phase: 05-01
    provides: AI tab shell, trust-sensitive suggestion patterns, trip-scoped assistant layout
  - phase: 05-03
    provides: compact assistant card surfaces, confidence-labeled lightweight helpers
provides:
  - Per-day recap persistence and generation APIs with browser speech fallback
  - Daily podcast recap card with playback controls and paired text summary
  - Phase 5 automated coverage for recap generation, playback fallback, and transcript guardrails
affects: [05-05, api, ui, testing]
tech-stack:
  added: []
  patterns: [daily recap persistence, browser speech synthesis fallback, playful assistant cards]
key-files:
  created:
    - apps/api/src/daily-podcast/daily-podcast.module.ts
    - apps/api/src/daily-podcast/daily-podcast.controller.ts
    - apps/api/src/daily-podcast/daily-podcast.service.ts
    - apps/web/src/components/trip/DailyPodcastCard.tsx
  modified:
    - packages/database/prisma/schema.prisma
    - apps/api/src/app.module.ts
    - apps/api/test/phase-05-deep-ai-integration.e2e-spec.ts
    - apps/web/src/lib/api-client.ts
    - apps/web/src/components/trip/AiAssistTab.tsx
    - apps/web/src/components/trip/__tests__/phase-05-ai.test.tsx
key-decisions:
  - "Daily recap stays web-first by persisting BROWSER_TTS mode when no dedicated audio asset is available."
  - "Every recap ships with a short text summary so the feature still works when audio playback is unavailable."
patterns-established:
  - "One playful recap is stored per trip day and regenerated on demand instead of creating a heavy media workflow."
  - "Assistant media features always keep a readable text fallback beside playback controls."
requirements-completed: [AIX-04]
duration: 31min
completed: 2026-04-01
---

# Phase 05 Plan 04: AI Daily Podcast Summary

**Per-day playful recap generation with browser playback fallback and paired text recap inside the trip workspace**

## Performance

- **Duration:** 31 min
- **Started:** 2026-04-01T23:00:00+07:00
- **Completed:** 2026-04-01T23:31:00+07:00
- **Tasks:** 2
- **Files modified:** 12

## Accomplishments

- Added a new NestJS `daily-podcast` module that persists one recap per trip day and can regenerate it on demand.
- Generated recap payloads with `recapText`, full transcript, `durationSeconds`, and `BROWSER_TTS` fallback when no dedicated audio asset exists.
- Extended the AI tab with `DailyPodcastCard`, including `Phat recap`, `Tom tat nhanh`, and a browser speech-synthesis-first playback path that still leaves the recap usable as text.

## Task Commits

Each task was committed atomically:

1. **Task 1: Add per-day recap persistence and generation APIs** - `a6a33d0` (feat)
2. **Task 2: Add playback and text recap UI to the AI tab** - `62881d1` (feat)

## Files Created/Modified

- `apps/api/src/daily-podcast/daily-podcast.service.ts` - recap generation, transcript length guardrails, and browser-TTS fallback mode
- `apps/api/src/daily-podcast/daily-podcast.controller.ts` - trip-scoped get/generate recap routes by day
- `apps/api/test/phase-05-deep-ai-integration.e2e-spec.ts` - e2e coverage for recap generation and duration constraints
- `apps/web/src/components/trip/DailyPodcastCard.tsx` - recap playback card with text fallback and speech synthesis branch
- `apps/web/src/components/trip/AiAssistTab.tsx` - mounting the daily recap card under the shared AI assistant surface
- `apps/web/src/lib/api-client.ts` - typed client contracts for daily podcast recap fetch/generate methods
- `apps/web/src/components/trip/__tests__/phase-05-ai.test.tsx` - UI coverage for recap rendering and playback fallback behavior

## Decisions Made

- Kept the recap feature web-first by persisting `BROWSER_TTS` and letting the browser handle speech playback when audio files are unavailable.
- Preserved the product rule that playful AI features still need short readable fallback text, not audio-only UX.

## Deviations from Plan

None - plan executed as intended.

## Issues Encountered

- Backend e2e verification needed to run from `apps/api` with `.env` loaded so DB/JWT config was available.
- UI verification initially exposed a `speechSynthesis` fallback bug, which was fixed before the final Vitest rerun passed.

## User Setup Required

None - recap playback falls back gracefully to text even when speech synthesis is unavailable.

## Next Phase Readiness

- The AI tab now supports a lightweight media-style helper without breaking the trip-workspace-first contract.
- Phase `05-05` can reuse the same confidence-first, warning-oriented assistant card patterns for local cost benchmarking.

## Self-Check: PASSED

- Found `.planning/phases/05-deep-ai-integration/05-04-SUMMARY.md`
- Found task commit `a6a33d0`
- Found task commit `62881d1`

---
*Phase: 05-deep-ai-integration*
*Completed: 2026-04-01*
