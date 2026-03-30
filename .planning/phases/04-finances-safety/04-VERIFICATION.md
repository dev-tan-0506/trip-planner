---
status: human_needed
phase: 04-finances-safety
verifier: inline-codex
verified_at: "2026-03-31T00:35:00+07:00"
---

# Phase 04: Finances & Safety — Verification

## Phase Goal

Build the trip's operational trust layer: centralized fund management, unified QR contribution guidance, itinerary-aware safety overview, emergency directory access, contextual cultural warnings, and a web-first SOS flow.

## Requirements Covered

| Requirement | Description | Status |
|-------------|-------------|--------|
| FINA-01 | Tạo quỹ chung có mục tiêu | ✅ Verified |
| FINA-02 | Hiển thị bề mặt QR MoMo/Bank thống nhất | ✅ Verified |
| FINA-03 | Hiển thị tổng quỹ và burn rate | ✅ Verified |
| SAFE-01 | Xem dự báo thời tiết 5 ngày | ✅ Verified |
| SAFE-02 | Xem crowd overview | ✅ Verified |
| SAFE-03 | Gửi Web-based SOS | ✅ Verified |
| SAFE-04 | Xem danh bạ địa phương đã xác minh | ✅ Verified |
| SAFE-05 | Hiển thị warning văn hóa theo ngữ cảnh | ✅ Verified |

## Automated Checks

| Suite | Command | Status |
|-------|---------|--------|
| Prisma schema | `npx dotenv -e ../../.env -- prisma validate` | ✅ |
| API unit | `npx jest --runInBand src/fund/fund.service.spec.ts src/safety/safety.service.spec.ts` | ✅ |
| API e2e | `npx jest --config test/jest-e2e.json --runInBand test/phase-04-finance-safety.e2e-spec.ts` | ✅ |
| Web targeted UI | `npx vitest run src/components/trip/__tests__/finance-safety-panel.test.tsx` | ✅ |
| Web regression UI | `npm run -w apps/web test:ui` | ✅ |

## Must-Haves Verification

- `packages/database/prisma/schema.prisma` có `TripFund`, `FundContribution`, `FundExpense`, `SafetyDirectoryEntry`, `SafetyAlert` cùng `@db.Decimal(12,2)` và QR payload kiểu JSON.
- `apps/api/src/fund/fund.service.ts` có `getFundSnapshot`, `burnRatePercent`, và serialize money bằng `toString()`.
- `apps/api/src/safety/safety.service.ts` có `getSafetyOverview`, `createSosAlert`, `acknowledgeAlert` và quick-dial `113/114/115`.
- `apps/web/src/components/trip/TripWorkspaceShell.tsx` mount tab `Quỹ & an toàn`.
- `apps/web/src/components/trip/FinanceSafetyTab.tsx` mount `FundOverviewPanel`, `SafetyOverviewPanel`, `CulturalWarningBanner`, `SOSPanel` và subscribe `connectSafetySocket`.

## Human Verification Items

1. Leader mở tab `Quỹ & an toàn`, tạo quỹ mới và dán payload QR thật để xác nhận UX cấu hình quỹ ổn trên browser.
2. Member mở cùng tab, dùng `Xem mã góp quỹ` và xác nhận copy/QR surface dễ hiểu trên mobile.
3. Kiểm tra `Gọi ngay` và `Mở bản đồ` mở đúng hành vi trong browser/device thật.
4. Mở 2 tab khác nhau của cùng một chuyến đi rồi gửi `SOS` để xác nhận tab còn lại refresh warning state theo realtime.
5. Kiểm tra path xin Notification permission: grant/deny đều không chặn `Gửi SOS`.

## Verdict

`human_needed` — Phase 4 đã pass automated verification nhưng vẫn cần UAT trình duyệt thật cho các hành vi web/device-sensitive.
