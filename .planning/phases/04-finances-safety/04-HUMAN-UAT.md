---
status: complete
phase: 04-finances-safety
source: [04-01-SUMMARY.md, 04-02-SUMMARY.md, 04-03-SUMMARY.md]
started: 2026-03-31T00:35:00+07:00
updated: 2026-03-31T21:15:00+07:00
---

## Current Test

[testing complete]

## Tests

### 1. Tạo quỹ bằng leader
expected: Leader tạo được quỹ, thấy summary cards cập nhật và bề mặt cấu hình QR không lỗi.
result: pass

### 2. Member xem mã góp quỹ
expected: Member thấy flow `Xem mã góp quỹ`, đọc được MoMo/Chuyển khoản và gửi xác nhận khoản góp.
result: pass

### 3. Dùng action danh bạ khẩn cấp
expected: `Gọi ngay` và `Mở bản đồ` hoạt động đúng trên browser/device thật.
result: pass

### 4. SOS realtime giữa hai tab
expected: Một tab gửi SOS thì tab còn lại nhận trạng thái cảnh báo mới sau refresh/broadcast.
result: pass

### 5. Notification permission path
expected: Grant hoặc deny Notification đều không chặn việc gửi SOS.
result: pass
note: Ban đầu UAT nêu gap thiếu action "tắt khẩn cấp" và nguy cơ lặp notification; đã được follow-up fix bằng luồng `RESOLVED` + dedupe browser notification theo `alertId`.

## Summary

total: 5
passed: 5
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps

## Resolution Notes

- Follow-up fix added `resolve` flow for SOS alerts in API/UI and introduced `RESOLVED` status handling.
- `SOSPanel` now dedupes browser notifications per alert id and separates `Đánh dấu đã thấy` from `Đã an toàn, tắt khẩn cấp`.
- Regression coverage added for API unit, API e2e, and targeted web UI tests covering the new resolve path.
