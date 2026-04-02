---
status: complete
phase: 06-post-trip-memories
source:
  - 06-01-SUMMARY.md
  - 06-02-SUMMARY.md
  - 06-03-SUMMARY.md
  - 06-04-SUMMARY.md
  - 06-05-SUMMARY.md
started: 2026-04-03T00:09:18.4290683+07:00
updated: 2026-04-03T00:09:18.4290683+07:00
---

## Current Test

[testing complete]

## Tests

### 1. Cold Start Smoke Test Cho Kỷ Niệm
expected: Dừng toàn bộ server/service đang chạy của app, rồi khởi động lại từ đầu. Tab `Kỷ niệm` vẫn mở được bình thường, backend boot không lỗi, và truy vấn snapshot kỷ niệm cơ bản của một trip trả dữ liệu thật thay vì lỗi rỗng/hỏng schema.
result: pass

### 2. Digital Vault Upload Và Danh Sách Tài Liệu
expected: Trong tab `Kỷ niệm`, người dùng tải lên một tài liệu vào Digital Vault, thấy tài liệu mới xuất hiện trong danh sách của trip với tên, loại, trạng thái review phù hợp, và không lẫn sang trip khác.
result: pass

### 3. Review Vault Chỉ Dành Cho Leader
expected: Khi mở thao tác review tài liệu trong Digital Vault, chỉ leader mới có thể xác nhận hoặc đổi trạng thái review; thành viên thường chỉ xem được thông tin mà không sửa được quyết định duyệt.
result: pass

### 4. Feedback Ẩn Danh Gửi Một Lần Và Có Biên Nhận
expected: Trong phần feedback ẩn danh, một thành viên gửi góp ý thành công, nhận được biên nhận rõ ràng, không thấy lộ danh tính trong kết quả leader xem, và không thể gửi lặp lại cho cùng poll nếu rule chỉ cho phép một lần.
result: pass

### 5. Leader Đóng Poll Feedback
expected: Leader có thể đóng poll feedback và sau thời điểm đó thành viên không gửi thêm được nữa; màn hình vẫn giải thích rõ poll đã đóng thay vì lỗi mơ hồ.
result: pass

### 6. Gợi Ý Quà Lưu Niệm Ngày Cuối
expected: Khi trip đang ở ngày cuối hoặc gần kết trip, card quà lưu niệm hiển thị gợi ý phù hợp với bối cảnh chuyến đi, có lý do ngắn gọn, giới hạn số gợi ý hợp lý, và fallback mềm nếu chưa đủ dữ liệu.
result: pass

### 7. Reunion Organizer Tạo Đề Xuất Và Thu Availability
expected: Trong phần reunion, hệ thống đề xuất được một ngày gặp lại hợp lý từ dữ liệu chuyến đi, leader có thể chốt lời mời, thành viên phản hồi được availability, và trạng thái tổng hợp hiển thị rõ ràng theo từng người.
result: pass

### 8. Finalize Reunion Chỉ Leader Và Có Tóm Tắt Cuối
expected: Chỉ leader mới finalize được kế hoạch reunion; sau khi finalize, màn hình hiển thị ngày chốt, trạng thái phản hồi của mọi người, và thành viên thường không thể sửa kết quả cuối.
result: pass

## Summary

total: 8
passed: 8
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps

[none yet]
