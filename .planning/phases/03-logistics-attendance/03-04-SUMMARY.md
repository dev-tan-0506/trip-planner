---
phase: 03-logistics-attendance
plan: "04"
subsystem: attendance-leader-checkin-gap
tags: [react, nestjs, attendance, uat, regression]
requires: [attendance-session-api, attendance-tab]
provides: [leader-self-checkin-ui, leader-attendance-regression-tests]
affects: [attendance-tab, attendance-ui-tests, attendance-api-e2e]
tech-stack:
  added: []
  patterns: [shared-attendance-flow, leader-member-parity, targeted-regression-coverage]
key-files:
  modified:
    - apps/web/src/components/trip/AttendanceTab.tsx
    - apps/web/src/components/trip/__tests__/attendance-panel.test.tsx
    - apps/api/test/phase-03-attendance.e2e-spec.ts
key-decisions:
  - Leader giữ quyền mở/đóng phiên check-in nhưng cũng đi qua cùng luồng self check-in như member
  - Không tạo API riêng cho leader vì backend hiện tại đã chấp nhận mọi trip member submit proof
  - Regression được khóa ở cả UI và API để tránh quay lại lỗi role gating
requirements-completed:
  - LOGI-04
  - LOGI-05
duration: ~15 min
completed: 2026-03-30
---

# Phase 03 Plan 04: Leader Self Check-in Gap Summary

Đã đóng gap UAT nơi leader mở được phiên check-in nhưng không thể tự check-in trên UI.

## What Was Built

### Frontend
- Gỡ role gate ở `AttendanceTab` để leader cũng thấy nút `Chụp ảnh check-in` khi phiên đang mở
- Hiển thị `Trạng thái của tôi` cho leader giống như member dựa trên `myRow`
- Giữ nguyên các nút quản lý phiên `Mở check-in` và `Đóng phiên`, không trộn với CTA tự check-in

### Regression Coverage
- Mở rộng `attendance-panel.test.tsx` để xác nhận leader:
  - vẫn thấy nút quản lý phiên
  - thấy CTA tự check-in
  - mở được capture sheet
  - thấy trạng thái cá nhân trong phiên đang mở
- Mở rộng `phase-03-attendance.e2e-spec.ts` để xác nhận:
  - leader mở phiên rồi tự submit proof được
  - session vẫn ở trạng thái `OPEN`
  - member vẫn submit tiếp được trong cùng phiên

## Verification

- `npx vitest run src/components/trip/__tests__/attendance-panel.test.tsx` ✅
- `npx jest --config test/jest-e2e.json --runInBand test/phase-03-attendance.e2e-spec.ts` ✅

## Next Step

Sẵn sàng cho verify lại đúng case UAT của leader check-in trong pha 3.
