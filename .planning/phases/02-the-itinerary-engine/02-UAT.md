---
status: complete
phase: 02-the-itinerary-engine
source:
  - 02-01-SUMMARY.md
  - 02-02-SUMMARY.md
  - 02-03-SUMMARY.md
  - 02-04-SUMMARY.md
started: "2026-03-28T08:20:54.1713026Z"
updated: "2026-03-28T19:29:00.0000000+07:00"
---

## Current Test
<!-- OVERWRITE each test - shows where we are -->

[testing complete]

## Tests

### 1. Trip Workspace Access
expected: Mở một chuyến đi với vai trò thành viên. Trang chuyến đi phải hiển thị khu vực làm việc với ba mục "Lich trinh", "Ban do", và "De xuat", còn người không phải thành viên vẫn chỉ thấy phần xem trước dành cho khách thay vì các nút chỉnh sửa.
result: pass

### 2. Leader Timeline CRUD
expected: Là trưởng nhóm, bạn có thể tạo một activity trong lịch trình, chỉnh sửa nó, sắp xếp lại thứ tự trong timeline, rồi xóa nó. Sau khi tải lại trang, thứ tự và nội dung đã cập nhật vẫn phải giữ đúng.
result: pass

### 3. Member Proposal Flow
expected: Là một thành viên không phải trưởng nhóm, bạn có thể gửi đề xuất thay đổi lịch trình bằng form đề xuất, và đề xuất đó sẽ xuất hiện trong inbox với hành động hoặc trạng thái phù hợp.
result: pass

### 4. Leader Proposal Decisions
expected: Là trưởng nhóm, khi bạn chấp nhận hoặc từ chối một đề xuất thì trạng thái của đề xuất phải cập nhật ngay, và nếu chấp nhận thì thay đổi đó cũng phải phản ánh vào itinerary snapshot.
result: pass

### 5. Map Projection And Location Picking
expected: Tab bản đồ cần hiển thị các điểm theo đúng thứ tự itinerary, cho phép lọc theo ngày, giữ lại bộ lọc ngày sau khi tải lại trang, và cho phép chọn một địa điểm rồi xác nhận rõ ràng trước khi lưu cho một activity.
result: pass

### 6. Voting Session Participation
expected: Leader có thể tạo hoặc duyệt một vote session, thành viên có thể vote bằng thao tác vuốt trên thiết bị cảm ứng hoặc bằng nút trên desktop, và màn hình vote phải hiển thị trạng thái lựa chọn hiện tại cùng kết quả tạm thời khi phiên vẫn đang mở.
result: pass

### 7. Template Library Browse And Detail
expected: Dashboard cần có lối vào thư viện template. Trong thư viện, các template đã publish phải hiện thông tin preview, và khi mở trang chi tiết thì phải xem được phần preview theo từng ngày.
result: pass

### 8. Template Publish Privacy
expected: Khi publish một chuyến đi thành template, chỉ leader mới được phép làm việc đó, và template sau khi publish không được lộ tên thành viên, `joinCode`, hay dữ liệu riêng tư liên quan đến vote trong phần preview hoặc payload trả về.
result: pass

### 9. Template Clone Flow
expected: Khi clone một template, hệ thống phải tạo ra một trip mới với `joinCode` riêng, sao chép đúng cấu trúc ngày và nội dung itinerary, đồng thời không còn liên kết sống với trip nguồn.
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
