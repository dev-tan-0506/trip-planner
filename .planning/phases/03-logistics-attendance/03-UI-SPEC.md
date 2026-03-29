---
phase: 03
slug: logistics-attendance
status: approved
shadcn_initialized: false
preset: none
created: 2026-03-29
---

# Phase 03 — UI Design Contract

> Visual and interaction contract for frontend phases. Generated for Phase 3 planning after product decisions were locked through discuss and UI questioning.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | none |
| Preset | not applicable |
| Component library | none |
| Icon library | `lucide-react` |
| Font | `Plus Jakarta Sans` for UI text, `Geist Mono` for codes or small technical labels only |

### Existing Brand Alignment

Phase 03 must extend the current trip UI language already present in:
- `apps/web/app/globals.css`
- `apps/web/app/layout.tsx`
- `apps/web/src/components/trip/TripWorkspaceShell.tsx`

Do not introduce a separate dashboard aesthetic. Keep the playful, rounded, travel-friendly visual language already established in Phase 1 and Phase 2.

---

## Information Architecture

Phase 03 appears inside the trip planner as **three ngang hàng tabs**, not as a hidden submodule:

1. `Phân phòng/xe`
2. `Checklist`
3. `Check-in`

Tab rules:
- These three tabs live alongside existing trip-planner navigation patterns, not behind a generic “more” menu.
- The current itinerary/map/proposal area remains intact; Phase 03 adds a logistics layer that still feels part of the same workspace.
- Leader and member use the same top-level tabs, but actions inside each tab differ by role.

Role contract:
- `Leader` sees create, drag/reassign, random-fill, assign-owner, open-session, and close-session controls.
- `Member` sees join-open-slot, mark-item-done when allowed, and submit check-in proof.
- Never hide status from members if the status affects them directly. Hide only structural actions they cannot perform.

---

## Screen Contracts

### 1. Phân phòng/Xe

Primary layout: **card grid**.

Contract:
- Each room or ride unit is a card, not a kanban column.
- Each card contains:
  - unit label
  - type badge (`Phòng` or `Xe`)
  - capacity count (`2/4 chỗ`)
  - optional helper note
  - member chips/list inside the card
- Desktop and mobile both keep the card-grid mental model. Mobile stacks cards vertically; desktop can use 2-3 columns.
- Leader interactions:
  - drag member chips between cards when feasible
  - visible fallback buttons or menus for reassign when drag is weak on touch
  - explicit `Chia nhanh` or `Gợi ý xếp chỗ` action
- Member interactions:
  - open slots must render a clear `Vào chỗ này` CTA
  - full units render disabled occupancy state, not a tappable dead-end

Visual contract:
- Cards use white surfaces, rounded `2xl` or `3xl`, soft border, and small internal color accents by type.
- Room cards lean `brand-blue` / `brand-green`.
- Ride cards can lean `brand-yellow` / `brand-coral`.
- Capacity state is visible immediately in the card header.

Behavior contract:
- Reassign feedback must feel immediate.
- Capacity change must be reflected in-card without needing users to infer from another panel.
- Empty units should still feel actionable, not blank placeholders.

### 2. Checklist

Primary layout: **mixed board**.

Contract:
- The upper section is an accordion of shared categories such as:
  - `Giấy tờ`
  - `Y tế`
  - `Đồ ăn`
  - `Đồ di chuyển`
  - `Khác`
- The lower section is a distinct area for personal tasks and assigned responsibilities.
- Shared category items and personal tasks must feel related but not visually merged into one unreadable list.

Leader interactions:
- create category
- add item into category
- assign person
- edit or delete item
- optionally create a personal task directly

Member interactions:
- see items assigned to self clearly highlighted
- mark completion where allowed
- never need to hunt through all categories just to know “mình phải mang gì”

Visual contract:
- Accordion headers are compact, bold, and color-tinted rather than heavy admin rows.
- Assigned items show owner chip/avatar initial.
- Completed items collapse visually through muted text + success accent, not full disappearance.
- Personal-task area should have its own title and lighter container contrast to separate it from shared categories.

### 3. Check-in

Primary leader layout: **map first, list after**.

Contract:
- The top of the leader view shows:
  - current gathering point summary
  - open/close time window
  - status counts such as `Đã đến`, `Chưa đến`, `Thiếu vị trí`
- The map is the first major content block.
- The detailed member list sits below the map.
- The member list must still be scannable fast even after the map block.

Leader list row contract:
- avatar/initial
- member name
- attendance badge
- time submitted
- location quality indicator when available
- quick way to inspect submitted proof

Member check-in contract:
- one obvious primary CTA: `Chụp ảnh check-in` or `Tải ảnh check-in`
- location permission request comes after or alongside proof intent, not before context
- submission flow must clearly show:
  - photo ready
  - location granted / denied / unavailable
  - final success state

Visual contract:
- Check-in should feel urgent but not alarming.
- Use `brand-green` for arrived, `brand-yellow` for partial proof, `brand-coral` for missing or expired.
- The map block should have rounded corners and a real “situation awareness” feeling, not appear as an afterthought widget.

---

## Interaction Contracts

### Layout And Navigation

- Tabs are horizontally scrollable on narrow screens if needed.
- Important leader actions may use floating buttons or pinned action bars, but only one dominant primary action per screen at a time.
- Do not overload every tab with multiple competing floating actions.

### Drag And Drop / Reassignment

- Drag should be available for leader in allocation UI.
- Because touch drag is fragile, every drag affordance must have a tap-based fallback:
  - `Chuyển chỗ`
  - `Bỏ khỏi xe`
  - `Đổi phòng`
- Assignment transitions should animate lightly so users feel the move happened.

### Empty States

- Empty states should invite the next action with warmth, not sound like a system error.
- Every empty state must include a direct next step:
  - create first room/ride
  - add first checklist item
  - open first check-in round

### Error States

- Errors must be human, short, and actionable.
- Use inline feedback near the action where possible.
- Reserve modal-style blocking errors for destructive or truly blocking failures only.

### Realtime Feedback

- Attendance updates should feel live without requiring manual refresh.
- Member self-join and checklist toggles may use local optimistic feedback plus refetch, but the UI must not imply “global realtime” unless the snapshot truly refreshed.

---

## Spacing Scale

Declared values (must be multiples of 4):

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Tiny badge gaps, inline status dots |
| sm | 8px | Chip spacing, icon-to-label gaps |
| md | 16px | Default card padding inside dense rows |
| lg | 24px | Standard card padding and section spacing |
| xl | 32px | Tab-to-content separation, large card padding |
| 2xl | 48px | Major block separation inside a page |
| 3xl | 64px | Full-screen section rhythm |

Exceptions: none

Layout rules:
- Standard cards use `24px` internal padding on desktop and `16px` on compact mobile.
- Grid gaps should typically be `16px` or `24px`, never irregular values like `14px` or `22px`.
- Floating actions should keep at least `24px` clearance from viewport edges unless mobile safe-area handling requires more.

---

## Typography

| Role | Size | Weight | Line Height |
|------|------|--------|-------------|
| Body | 16px | 500 | 1.6 |
| Label | 13px | 700 | 1.4 |
| Heading | 24px | 800 | 1.25 |
| Display | 32px | 900 | 1.15 |

Typography rules:
- Use bold hierarchy confidently; this product already leans expressive rather than neutral enterprise.
- Small helper text may use `14px / 500 / 1.5`.
- Dense status metadata may use `12px / 700 / 1.4`.
- Do not introduce a second display font.
- Avoid all-caps except tiny utility labels and badges.

---

## Color

| Role | Value | Usage |
|------|-------|-------|
| Dominant (60%) | `#F8F9FA` | Page backgrounds, large surfaces |
| Secondary (30%) | `#FFFFFF` and `#1A1A2E` | Cards, nav pills, dark emphasis surfaces |
| Accent (10%) | `#4D96FF`, `#6BCB77`, `#FFD93D`, `#FF6B6B` | Status accents, focused CTAs, badges, map/list emphasis |
| Destructive | `#FF6B6B` | Destructive actions only |

Accent reserved for:
- active tab emphasis
- capacity and occupancy badges
- assignment state chips
- check-in status chips
- one dominant CTA per view
- subtle gradient headers or highlights

Never use accent colors for:
- every border on the page
- all buttons at once
- generic body text

Color behavior by area:
- `Phân phòng/xe`: prefer cool-light surfaces with selective warm accents for ride cards or full-state warnings.
- `Checklist`: prefer calm surfaces with green/yellow completion cues.
- `Check-in`: map and status colors should communicate urgency hierarchy clearly: green success, yellow partial, coral missing/late.

---

## Copywriting Contract

| Element | Copy |
|---------|------|
| Primary CTA | `Tạo chỗ mới`, `Thêm vật dụng`, `Mở check-in` depending on tab |
| Empty state heading | `Chưa có gì để chia chỗ cả`, `Checklist còn trống`, `Chưa mở check-in nào` |
| Empty state body | `Tạo phòng hoặc xe đầu tiên để cả nhóm bắt đầu vào chỗ.` / `Thêm vật dụng hoặc việc cần chuẩn bị để mọi người biết mình lo phần nào.` / `Mở một đợt check-in để theo dõi ai đã tới điểm hẹn.` |
| Error state | `Không cập nhật được ngay lúc này. Thử lại một lần nữa hoặc làm mới trang.` |
| Destructive confirmation | `Xóa mục này`: `Mục này sẽ biến mất khỏi kế hoạch của cả nhóm. Bạn có chắc muốn xóa không?` |

Copy rules:
- Vietnamese-first only.
- Friendly and practical, not jokey in high-stress moments like attendance.
- Use verbs users can act on immediately.
- Do not use raw backend terms such as `allocation unit`, `submission`, or `attendance session` in visible copy.

---

## Component Contract

Required reusable UI pieces for Phase 03:
- `LogisticsTabNav` or equivalent tab treatment matching trip planner tone
- `AllocationUnitCard`
- `MemberChip`
- `ChecklistCategoryAccordion`
- `ChecklistItemRow`
- `AttendanceMapPanel`
- `AttendanceMemberList`
- `CheckInCaptureSheet` or equivalent bottom sheet/modal

Behavioral component rules:
- Sheets and modals must not auto-close while user is interacting with map, camera, or upload preparation.
- Leader-only actions should be grouped in the card header or sticky action bars, not sprinkled inconsistently through every row.
- Status chips should be reusable across allocation, checklist, and attendance instead of inventing a new style per screen.

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | none | not required |
| third-party registry | none | not required |

Phase 03 should continue using the repo's current handcrafted component approach unless implementation later proves a narrow dependency is necessary.

---

## Checker Sign-Off

- [x] Dimension 1 Copywriting: PASS
- [x] Dimension 2 Visuals: PASS
- [x] Dimension 3 Color: PASS
- [x] Dimension 4 Typography: PASS
- [x] Dimension 5 Spacing: PASS
- [x] Dimension 6 Registry Safety: PASS

**Approval:** approved 2026-03-29
