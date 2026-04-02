---
status: complete
phase: 05-deep-ai-integration
source:
  - 05-00-SUMMARY.md
  - 05-01-SUMMARY.md
  - 05-02-SUMMARY.md
  - 05-03-SUMMARY.md
  - 05-04-SUMMARY.md
  - 05-05-SUMMARY.md
started: 2026-04-02T20:13:30+07:00
updated: 2026-04-02T20:41:12.9911737+07:00
---

## Current Test

[testing complete]

## Tests

### 1. Cold Start Smoke Test
expected: Dung toan bo server/service dang chay cua app, sau do khoi dong lai tu dau. Backend boot khong bao loi, migration/seed neu co van hoat dong on dinh, va mot truy van co ban nhu mo trip workspace hoac goi API chinh tra ve du lieu that.
result: pass

### 2. Draft Tuyến Ẩm Thực AI
expected: Trong tab Trợ lý AI, khi chọn vài điểm ăn và yêu cầu gợi ý, hệ thống hiển thị một bản nháp lộ trình ăn uống có thứ tự điểm dừng, lý do, nhãn độ tin cậy, và chưa tự ý đổi lịch trình hiện tại.
result: pass

### 3. Áp Dụng Lộ Trình Và Cảnh Báo Sức Khỏe
expected: Khi leader bấm áp dụng bản nháp ẩm thực, lịch trình thật mới được cập nhật; các item liên quan hiển thị cảnh báo sức khỏe nội tuyến với mức độ và nội dung dễ hiểu nếu có xung đột hồ sơ ăn uống.
result: pass

### 4. Booking Import Dạng Bản Nháp
expected: Trong tab Trợ lý AI có hiển thị địa chỉ chuyển tiếp booking, cho phép dán nội dung đặt chỗ để tạo bản nháp, và bản nháp mới xuất hiện ở danh sách gần đây với trạng thái độ tin cậy/cần xem lại nếu thông tin thiếu.
result: pass

### 5. Review Sheet Và Xác Nhận Booking
expected: Khi mở review sheet của booking draft, người dùng thấy các trường đã parse, có thể chỉnh sửa dữ liệu còn thiếu, và chỉ sau bước xác nhận rõ ràng của leader thì booking mới được nhập vào lịch trình chính.
result: pass

### 6. Local Expert Dịch Menu
expected: Công cụ Dịch menu trả về các thẻ nội dung gọn, có món gốc, diễn giải/khuyến nghị, nhãn độ tin cậy bằng tiếng Việt, và gợi ý bước tiếp theo thay vì chat tự do.
result: pass

### 7. Gợi Ý Điểm Gần Đây Và Lên Đồ
expected: Các panel gợi ý chỗ chơi quanh đây và Lên đồ cho hôm nay hiển thị thẻ ngắn gọn, có ngữ cảnh rõ ràng, nhãn độ tin cậy, hành động tiếp theo, và phần lên đồ không vượt quá ba gợi ý.
result: pass

### 8. Podcast Ngày Với Fallback Văn Bản
expected: Card Podcast ngày tạo được recap theo ngày, có nút phát recap, phần tóm tắt nhanh đi kèm, và khi không phát audio được thì phần nội dung chữ vẫn đủ để dùng.
result: pass

### 9. Cảnh Báo So Sánh Chi Phí Địa Phương
expected: Trong tab Quỹ & an toàn, các khoản chi liên quan hiển thị cảnh báo so với mặt bằng địa phương ngay cạnh luồng tài chính, bao gồm mức độ cảnh báo, median tham chiếu, nguồn đối chiếu, và fallback mềm khi thiếu dữ liệu.
result: pass

## Summary

total: 9
passed: 9
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps

[none yet]
