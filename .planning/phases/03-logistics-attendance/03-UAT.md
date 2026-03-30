---
status: complete
phase: 03-logistics-attendance
source: [03-01-SUMMARY.md, 03-02-SUMMARY.md, 03-03-SUMMARY.md]
started: 2026-03-29T16:11:00Z
updated: 2026-03-30T00:06:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Cold Start Smoke Test
expected: Kill any running server/service. Clear ephemeral state (temp DBs, caches, lock files). Start the application from scratch. Server boots without errors, any seed/migration completes, and a primary query (health check, homepage load, or basic API call) returns live data.
result: pass

### 2. Tạo Nhóm Phân bổ (Trưởng nhóm)
expected: Với vai trò là trưởng nhóm (leader), khi điều hướng đến tab "Phân phòng/xe" và tạo một Phòng hoặc Xe mới với sức chứa nhất định, hệ thống sẽ thêm thành công mục đó vào lưới.
result: pass

### 3. Thành viên Tự tham gia
expected: Với vai trò là thành viên (member), khi bấm "Tự vào" ở một phòng/xe còn trống, hệ thống lập tức gán thành viên đó vào nhóm, cập nhật số lượng hiển thị và hiện avatar của họ.
result: pass

### 4. Xem Tab Checklist
expected: Khi điều hướng đến tab "Checklist", hệ thống hiển thị danh sách các mục đồ dùng chung ở trên và khu vực công việc cá nhân ("Chỉ xem việc của tôi") ở dưới.
result: pass

### 5. Đánh dấu Checklist
expected: Thành viên có thể tick chọn các công việc được giao cho chính họ (tính trạng checkbox được cập nhật), trong khi trưởng nhóm có thể tick chọn bất kỳ mục nào.
result: pass

### 6. Bắt đầu Điểm danh (Trưởng nhóm)
expected: Với vai trò là trưởng nhóm, khi điều hướng đến tab "Check-in" và mở một phiên điểm danh mới, giao diện bảng điều khiển sẽ chuyển sang trạng thái đang hoạt động đối với tất cả các thành viên.
result: issue
reported: "leader cũng phải checkin chứ không riêng gi f thành viên"
severity: major

### 7. Gửi Điểm danh (Thành viên)
expected: Với vai trò là thành viên, khi mở form check-in, tùy chọn chụp ảnh selfie/vị trí, và bấm gửi thì hệ thống ghi nhận thành viên đó là có mặt và cập nhật bản đồ/danh sách của trưởng nhóm theo thời gian thực (realtime).
result: pass

## Summary

total: 7
passed: 6
issues: 1
pending: 0
skipped: 0

## Gaps

- truth: "Khi leader bắt đầu một phiên điểm danh mới, luồng check-in phải áp dụng cho cả leader lẫn các thành viên liên quan thay vì chỉ riêng thành viên."
  status: failed
  reason: "User reported: leader cũng phải checkin chứ không riêng gi f thành viên"
  severity: major
  test: 6
  root_cause: "Frontend role gating in AttendanceTab only renders the capture CTA and personal attendance state for non-leaders, even though AttendanceService already includes the leader in session rows and allows any trip member to submit proof."
  artifacts:
    - path: "apps/web/src/components/trip/AttendanceTab.tsx"
      issue: "Check-in CTA and personal status card are wrapped in !snapshot.isLeader guards."
    - path: "apps/api/src/attendance/attendance.service.ts"
      issue: "Snapshot and submitProof already treat the leader as a normal trip member for attendance participation."
    - path: "apps/web/src/components/trip/__tests__/attendance-panel.test.tsx"
      issue: "UI coverage verifies leader dashboard rendering but never leader self-check-in."
    - path: "apps/api/test/phase-03-attendance.e2e-spec.ts"
      issue: "E2E coverage only exercises member proof submission after leader opens a session."
  missing:
    - "Show the check-in capture action to the leader when a session is open."
    - "Show the leader's personal attendance status card during an active session."
    - "Add regression tests proving the leader can submit proof while keeping session management controls."
  debug_session: ".planning/debug/03-attendance-leader-checkin.md"
