---
status: testing
phase: 03-logistics-attendance
source: [03-01-SUMMARY.md, 03-02-SUMMARY.md, 03-03-SUMMARY.md]
started: 2026-03-29T16:11:00Z
updated: 2026-03-29T16:24:00Z
---

## Current Test

number: 2
name: Tạo Nhóm Phân bổ (Trưởng nhóm)
expected: |
  Với vai trò là trưởng nhóm (leader), khi điều hướng đến tab "Phân phòng/xe" và tạo một Phòng hoặc Xe mới với sức chứa nhất định, hệ thống sẽ thêm thành công mục đó vào lưới.
awaiting: user response

## Tests

### 1. Cold Start Smoke Test
expected: Kill any running server/service. Clear ephemeral state (temp DBs, caches, lock files). Start the application from scratch. Server boots without errors, any seed/migration completes, and a primary query (health check, homepage load, or basic API call) returns live data.
result: pass

### 2. Tạo Nhóm Phân bổ (Trưởng nhóm)
expected: Với vai trò là trưởng nhóm (leader), khi điều hướng đến tab "Phân phòng/xe" và tạo một Phòng hoặc Xe mới với sức chứa nhất định, hệ thống sẽ thêm thành công mục đó vào lưới.
result: [pending]

### 3. Thành viên Tự tham gia
expected: Với vai trò là thành viên (member), khi bấm "Tự vào" ở một phòng/xe còn trống, hệ thống lập tức gán thành viên đó vào nhóm, cập nhật số lượng hiển thị và hiện avatar của họ.
result: [pending]

### 4. Xem Tab Checklist
expected: Khi điều hướng đến tab "Checklist", hệ thống hiển thị danh sách các mục đồ dùng chung ở trên và khu vực công việc cá nhân ("Chỉ xem việc của tôi") ở dưới.
result: [pending]

### 5. Đánh dấu Checklist
expected: Thành viên có thể tick chọn các công việc được giao cho chính họ (tính trạng checkbox được cập nhật), trong khi trưởng nhóm có thể tick chọn bất kỳ mục nào.
result: [pending]

### 6. Bắt đầu Điểm danh (Trưởng nhóm)
expected: Với vai trò là trưởng nhóm, khi điều hướng đến tab "Check-in" và mở một phiên điểm danh mới, giao diện bảng điều khiển sẽ chuyển sang trạng thái đang hoạt động đối với tất cả các thành viên.
result: [pending]

### 7. Gửi Điểm danh (Thành viên)
expected: Với vai trò là thành viên, khi mở form check-in, tùy chọn chụp ảnh selfie/vị trí, và bấm gửi thì hệ thống ghi nhận thành viên đó là có mặt và cập nhật bản đồ/danh sách của trưởng nhóm theo thời gian thực (realtime).
result: [pending]

## Summary

total: 7
passed: 1
issues: 0
pending: 6
skipped: 0

## Gaps

