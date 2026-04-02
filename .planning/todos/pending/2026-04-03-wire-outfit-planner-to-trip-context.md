---
created: 2026-04-03T10:30:00.000Z
title: Wire outfit planner to itinerary and weather context
area: ui
files:
  - apps/web/src/components/trip/OutfitPlannerPanel.tsx
  - apps/web/src/components/trip/AiAssistTab.tsx
  - apps/web/src/components/trip/FinanceSafetyTab.tsx
  - apps/web/src/lib/api-client.ts
  - apps/api/src/local-expert/local-expert.service.ts
---

## Problem

Outfit planner hiện mới là trip-scoped tool nhưng chưa thật sự nối vào foundation đã có của workspace. UI đang hardcode `dayIndex: 0`, yêu cầu người dùng nhập tay `weatherLabel`, và chưa tận dụng snapshot thời tiết/ngày hành trình sẵn có từ các phase trước.

## Solution

Ở vòng tiếp theo, nối outfit planner vào shared trip context để giảm nhập tay và tăng tính đúng ngữ cảnh:
- lấy `dayIndex` từ ngày hành trình đang xem hoặc ngày phù hợp nhất trong itinerary
- ưu tiên dùng weather/safety context đã có thay vì bắt nhập tay thời tiết
- giữ khả năng override thủ công như fallback mềm thay vì là nguồn dữ liệu chính
- bổ sung integration test chứng minh planner dùng đúng context mà không tách thành một surface riêng
