---
phase: 04-finances-safety
plan: "02"
subsystem: safety-overview
tags: [nestjs, react, weather, crowd, directory, provider]
requires: [finance-safety-tab-shell, trip-membership-guards]
provides: [safety-overview-api, normalized-provider-stubs, emergency-directory-ui]
affects: [finance-safety-ui, api-client, safety-module]
tech-stack:
  added: []
  patterns: [provider-normalization, trip-scoped-safety-snapshot, graceful-fallback-copy]
key-files:
  created:
    - apps/api/src/safety/provider/weather.provider.ts
    - apps/api/src/safety/provider/crowd.provider.ts
    - apps/api/src/safety/provider/directory.provider.ts
    - apps/web/src/components/trip/SafetyOverviewPanel.tsx
    - apps/web/src/components/trip/SafetyDirectoryList.tsx
  modified:
    - apps/api/src/safety/safety.service.ts
    - apps/api/src/safety/safety.controller.ts
    - apps/web/src/lib/api-client.ts
    - apps/web/src/components/trip/FinanceSafetyTab.tsx
key-decisions:
  - Weather/crowd/directory đi qua provider wrapper riêng để giữ normalized contract ổn định
  - Nếu chưa có provider thật, service tự bootstraps stubbed directory thay vì rải mock trong React
  - Safety overview ưu tiên itinerary-aware snapshot và fallback copy thay vì dashboard phân tích nặng
requirements-completed:
  - SAFE-01
  - SAFE-02
  - SAFE-04
duration: ~35 min
completed: 2026-03-31
---

# Phase 04 Plan 02: Safety Overview Summary

Đã thêm lớp “theo dõi an toàn” cho trip workspace với dự báo 5 ngày, mức đông và danh bạ khẩn cấp có action ngay.

## Accomplishments

- Tạo wrapper provider chuẩn hóa cho weather, crowd và directory.
- Mở route `overview` và `directory` trong `SafetyModule` với snapshot trip-scoped.
- Dựng `SafetyOverviewPanel` và `SafetyDirectoryList` với copy fallback rõ ràng và action `Gọi ngay` / `Mở bản đồ`.

## Verification

- `npx jest --runInBand src/safety/safety.service.spec.ts` ✅
- `npx jest --config test/jest-e2e.json --runInBand test/phase-04-finance-safety.e2e-spec.ts` ✅
- `npm run -w apps/web test:ui` ✅

## Deviations

None - đi đúng plan, dùng stub provider server-side để giữ contract sạch cho lần tích hợp provider thật sau này.
