---
status: complete
phase: 01-foundation-onboarding
source: [01-01-SUMMARY.md, 01-02-PLAN.md]
started: 2026-03-28T02:52:00Z
updated: 2026-03-28T03:30:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Cold Start Smoke Test
expected: Kill any running dev server. Run `npm run dev` from scratch. Both the NestJS API (port 3001) and Next.js web (port 3000) boot without errors. Visiting http://localhost:3000 shows the styled home page. Visiting http://localhost:3001/api/docs shows Swagger docs.
result: pass

### 2. Register a New Account
expected: Navigate to /auth/register. Fill in name, email, and password. Click register. Should redirect to the home page showing "Chào buổi sáng, [Name]!" greeting with logged-in state.
result: pass

### 3. Login with Existing Account
expected: Navigate to /auth/login. Enter the credentials from the registration. Click login. Should redirect to home page showing the logged-in greeting.
result: pass

### 4. Logout
expected: While logged in on the home page, click the "Đăng xuất" button. Should return to the guest view showing "Bắt Đầu Ngay" CTA.
result: pass

### 5. Dashboard — Create a Trip
expected: Log in, then navigate to /dashboard. Click "Tạo chuyến đi mới". Fill in trip name ("Đà Lạt Mộng Mơ"), destination ("Đà Lạt, Lâm Đồng"), start date, and end date. Click "Tạo chuyến đi 🚀". Should show a success screen with a shareable link and a "Xem chuyến đi" button.
result: pass

### 6. Trip Preview — View via Join Code (Guest)
expected: Copy the shareable link from the success screen. Open it in an incognito/new browser window (not logged in). Should see the trip name, destination, dates, member list (with you as Leader), and a "Đăng nhập ngay" prompt (since the viewer is not logged in).
result: issue
reported: "\"property name should not exist,property destination should not exist,property startDate should not exist,property endDate should not exist\" tôi gặp lỗi này"
severity: major

### 7. Trip Preview — Error for Invalid Join Code
expected: Navigate to /trip/INVALID_CODE. Should show a friendly "Oops! 😅" error page with "Về trang chủ" link.
result: pass

## Summary

total: 7
passed: 6
issues: 1
pending: 0
skipped: 0
blocked: 0

## Gaps

- truth: "Copy the shareable link from the success screen. Open it in an incognito/new browser window (not logged in). Should see the trip name, destination, dates, member list (with you as Leader), and a \"Đăng nhập ngay\" prompt (since the viewer is not logged in)."
  status: failed
  reason: "User reported: \"property name should not exist,property destination should not exist,property startDate should not exist,property endDate should not exist\" tôi gặp lỗi này"
  severity: major
  test: 6
  artifacts: []
  missing: []
