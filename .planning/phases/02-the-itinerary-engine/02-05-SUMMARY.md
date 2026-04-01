---
phase: 02-the-itinerary-engine
plan: "05"
subsystem: itinerary-reorder
tags: [dnd-kit, itinerary, timeline, drag-drop, regression]
requires: [itinerary-timeline, trip-workspace-shell]
provides: [leader-sortable-timeline, cross-day-reorder, reorder-regression-tests]
affects: [trip-workspace-ui, itinerary-reorder-flow, phase-02-verification]
tech-stack:
  added: [@dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities]
  patterns: [sortable-handle, canonical-reorder-payload, read-only-member-guard]
key-files:
  created: []
  modified:
    - apps/web/package.json
    - apps/web/src/components/trip/TimelineDaySection.tsx
    - apps/web/src/components/trip/TripWorkspaceShell.tsx
    - apps/web/src/components/trip/__tests__/trip-workspace.test.tsx
key-decisions:
  - Bỏ native HTML drag-and-drop vì không ổn định trên card layout thực tế, chuyển sang `dnd-kit` với drag handle rõ ràng cho leader
  - Giữ `handleReorderItem` và `itineraryApi.reorder` là đường persist duy nhất để không tạo reorder state riêng ở client
  - Member vẫn giữ chế độ read-only hoàn toàn: không sensor, không drag handle, không weaken PLAN-02
requirements-completed:
  - PLAN-01
  - PLAN-02
duration: ~35 min
completed: 2026-03-31
---

# Phase 02 Plan 05: Itinerary Drag-and-Drop Gap Closure

Đã đóng gap UAT còn lại của Phase 2: leader hiện kéo thả được activity trong cùng ngày và sang ngày khác, thứ tự mới vẫn giữ sau refresh, còn member vẫn chỉ xem timeline ở chế độ read-only.

## Accomplishments

- Thay native drag/drop bằng sortable flow dùng `dnd-kit` trong timeline, có drag handle riêng và chấp nhận drop vào cả ngày rỗng.
- Chuẩn hóa payload reorder ở `TripWorkspaceShell` để same-day và cross-day đều đi qua cùng một đường `itineraryApi.reorder`.
- Bổ sung regression test cho same-day reorder, cross-day move, và guardrail `canEdit: false`.

## Verification

- `npm run -w apps/web check-types` ✅
- `npx vitest run src/components/trip/__tests__/trip-workspace.test.tsx` ✅
- Browser UAT 5 bước cho leader/member reorder: `approved` ✅

## Deviations

None - chỉ thay interaction model ở UI reorder, không mở rộng phạm vi sang map, voting, hay API contract mới.
