---
status: partial
phase: 04-finances-safety
source: [04-VERIFICATION.md]
started: 2026-03-31T00:35:00+07:00
updated: 2026-03-31T00:35:00+07:00
---

## Current Test

Chờ human verification cho Phase 04.

## Tests

### 1. Tạo quỹ bằng leader
expected: Leader tạo được quỹ, thấy summary cards cập nhật và bề mặt cấu hình QR không lỗi.
result: pending

### 2. Member xem mã góp quỹ
expected: Member thấy flow `Xem mã góp quỹ`, đọc được MoMo/Chuyển khoản và gửi xác nhận khoản góp.
result: pending

### 3. Dùng action danh bạ khẩn cấp
expected: `Gọi ngay` và `Mở bản đồ` hoạt động đúng trên browser/device thật.
result: pending

### 4. SOS realtime giữa hai tab
expected: Một tab gửi SOS thì tab còn lại nhận trạng thái cảnh báo mới sau refresh/broadcast.
result: pending

### 5. Notification permission path
expected: Grant hoặc deny Notification đều không chặn việc gửi SOS.
result: pending

## Summary

total: 5
passed: 0
issues: 0
pending: 5
skipped: 0
blocked: 0

## Gaps
