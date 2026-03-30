---
phase: 04-finances-safety
plan: "01"
subsystem: finance
tags: [prisma, nestjs, react, fund, qr, burn-rate]
requires: [trip-workspace-shell, trip-membership-guards]
provides: [trip-fund-schema, fund-snapshot-api, finance-tab-surface]
affects: [trip-workspace, api-client, finance-safety-ui]
tech-stack:
  added: []
  patterns: [server-derived-money-summary, decimal-to-string-serialization, leader-managed-fund]
key-files:
  created:
    - apps/api/src/fund/fund.module.ts
    - apps/api/src/fund/fund.controller.ts
    - apps/api/src/fund/fund.service.ts
    - apps/web/src/components/trip/FundOverviewPanel.tsx
    - apps/web/src/components/trip/FundContributionSheet.tsx
  modified:
    - packages/database/prisma/schema.prisma
    - apps/api/src/app.module.ts
    - apps/web/src/lib/api-client.ts
    - apps/web/src/components/trip/TripWorkspaceShell.tsx
    - apps/web/src/components/trip/FinanceSafetyTab.tsx
key-decisions:
  - Tiền được tính hoàn toàn từ server snapshot và serialize bằng string để tránh lỗi precision ở frontend
  - Leader giữ quyền cấu hình quỹ, còn member đi qua luồng xác nhận góp quỹ bounded trong cùng tab
  - Bề mặt QR được giữ flexible bằng JSON-like payload cho MoMo và Chuyển khoản
requirements-completed:
  - FINA-01
  - FINA-02
  - FINA-03
duration: ~50 min
completed: 2026-03-31
---

# Phase 04 Plan 01: Group Fund Summary

Đã thêm xương sống quỹ chung cho chuyến đi: schema Prisma, API snapshot quỹ, và giao diện `Quỹ & an toàn` với summary cards cùng flow góp quỹ.

## Accomplishments

- Thêm `TripFund`, `FundContribution`, `FundExpense` cùng enum liên quan vào Prisma schema.
- Tạo `FundModule` với các route trip-scoped để tạo quỹ, cập nhật quỹ, submit khoản góp, confirm khoản góp và ghi chi.
- Dựng `FundOverviewPanel` và `FundContributionSheet` để leader/member dùng cùng một surface nhưng khác quyền hành động.

## Verification

- `npx jest --runInBand src/fund/fund.service.spec.ts` ✅
- `npx jest --config test/jest-e2e.json --runInBand test/phase-04-finance-safety.e2e-spec.ts` ✅
- `npx vitest run src/components/trip/__tests__/finance-safety-panel.test.tsx` ✅

## Deviations

None - implementation bám đúng plan, chỉ bổ sung cast `Prisma.InputJsonValue` để TypeScript chấp nhận payload JSON của QR.
