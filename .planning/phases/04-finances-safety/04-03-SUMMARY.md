---
phase: 04-finances-safety
plan: "03"
subsystem: sos-alerting
tags: [socket.io, react, sos, cultural-warning, notification]
requires: [safety-overview-api, finance-safety-tab-shell]
provides: [trip-safety-alerts, safety-socket, sos-panel, cultural-warning-banner]
affects: [finance-safety-ui, safety-module, realtime-alerts]
tech-stack:
  added: []
  patterns: [browser-visible-alerting, quick-dial-fallback, notification-optional]
key-files:
  created:
    - apps/api/src/safety/safety.gateway.ts
    - apps/web/src/components/trip/SOSPanel.tsx
    - apps/web/src/components/trip/CulturalWarningBanner.tsx
  modified:
    - packages/database/prisma/schema.prisma
    - apps/api/src/safety/safety.service.ts
    - apps/api/src/safety/safety.controller.ts
    - apps/web/src/lib/api-client.ts
    - apps/web/src/components/trip/FinanceSafetyTab.tsx
key-decisions:
  - SOS là web action nghiêm túc, không phụ thuộc Notification permission để gửi
  - Socket `/safety` chỉ broadcast refresh signal, còn client tự refetch snapshot mới để giảm coupling
  - Quick-dial `113/114/115` luôn hiện như fallback rõ ràng trong urgent zone
requirements-completed:
  - SAFE-03
  - SAFE-05
duration: ~30 min
completed: 2026-03-31
---

# Phase 04 Plan 03: SOS & Cultural Warning Summary

Đã hoàn thiện phần alerting của phase 4 với SOS trip-scoped, banner `Lưu ý văn hóa`, quick-dial fallback và socket `/safety` cho refresh realtime.

## Accomplishments

- Thêm `SafetyAlert` vào schema và route tạo/acknowledge SOS.
- Dựng `SOSPanel` với CTA `Gửi SOS`, sent state, Notification path và quick-dial.
- Dựng `CulturalWarningBanner` để render warning contextual thay vì geofencing/native behavior.

## Verification

- `npx jest --config test/jest-e2e.json --runInBand test/phase-04-finance-safety.e2e-spec.ts` ✅
- `npx vitest run src/components/trip/__tests__/finance-safety-panel.test.tsx` ✅
- `npm run -w apps/web test:ui` ✅

## Deviations

None - implementation giữ đúng boundary web-first và fallback strategy đã chốt trong review/UI-SPEC.
