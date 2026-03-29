---
created: 2026-03-28T11:09:01.075Z
title: Track proposal realtime sync follow-up
area: ui
files:
  - apps/web/src/components/trip/TripWorkspaceShell.tsx
  - apps/web/src/components/trip/ProposalComposerSheet.tsx
---

## Problem

Trong UAT phase 02, user xác nhận luồng accept/reject proposal vẫn chưa realtime. Trạng thái proposal và itinerary snapshot chưa tự đồng bộ ngay cho người đang mở màn hình, nên trải nghiệm cộng tác vẫn còn độ trễ và dễ gây nhầm lẫn.

## Solution

Ưu tiên đưa vào sprint sau nếu chi phí triển khai realtime đầy đủ còn cao ở phase này. Hướng tiếp cận có thể là:
- thêm đồng bộ theo push/subscription cho proposal inbox và itinerary snapshot
- hoặc nâng polling hiện tại thành polling theo ngữ cảnh với refresh chủ động sau mutation
- xác định rõ mức realtime cần thiết cho leader/member trước khi chọn giữa WebSocket/SSE/polling
