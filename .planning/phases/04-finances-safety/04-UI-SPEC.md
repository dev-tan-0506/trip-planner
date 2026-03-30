---
phase: 04
slug: finances-safety
status: approved
shadcn_initialized: false
preset: none
created: 2026-03-30
reviewed_at: 2026-03-30
---

# Phase 04 — UI Design Contract

> Visual and interaction contract for the finance and safety layer inside the trip workspace. This phase must keep the playful trip-planning brand for money coordination, while switching to a calmer, more serious tone for urgent safety actions.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | none |
| Preset | not applicable |
| Component library | none |
| Icon library | `lucide-react` |
| Font | `Plus Jakarta Sans` for all primary UI text, `Geist Mono` only for compact codes or transfer references |

### Existing Brand Alignment

Phase 04 extends the current visual language already established in:
- `apps/web/app/globals.css`
- `apps/web/src/components/trip/TripWorkspaceShell.tsx`
- `.planning/phases/03-logistics-attendance/03-UI-SPEC.md`

Do not introduce an enterprise finance dashboard or a dark emergency console. The new tab still belongs to the same trip workspace, but the urgent zone must feel calmer, firmer, and less playful than itinerary or vote flows.

---

## Information Architecture

Phase 04 appears as one first-class trip tab labeled exactly `Quỹ & an toàn`.

Vertical content order inside the tab:
1. `Tình hình quỹ` summary hero
2. `Góp quỹ` action surface
3. `Theo dõi an toàn` overview cards
4. `Danh bạ khẩn cấp` quick-action list
5. `Lưu ý văn hóa` contextual banner
6. `SOS` urgent block pinned last but visually strongest

Ordering rules:
- Finance appears first because most visits are coordination-oriented, not emergency-oriented.
- Safety overview and directory appear before SOS so users can act on practical context quickly.
- SOS must remain visible without scrolling through dense finance detail; on mobile it should sit within one screen after the directory list or use a sticky reveal cue.

Role contract:
- `Leader` sees fund setup, QR payload configuration, contribution confirmation, expense recording, and all safety information.
- `Member` sees fund progress, contribution guidance, safety overview, directory actions, cultural warnings, and SOS access.
- Never hide trip-health status from members. Hide only structural finance controls they cannot change.

---

## Screen Contracts

### 1. Tình hình quỹ

Primary layout: **summary-first stacked cards**.

Contract:
- The first row must show exactly these signals: `Mục tiêu`, `Đã góp`, `Đã chi`, `Còn lại`.
- Burn-rate appears as a short health sentence near the numbers, not as a separate analytics chart.
- Large values are the focal point of the finance area; rows or ledger detail are secondary and can be collapsed or deferred.
- The section should make one question easy to answer in under 3 seconds: `Cả nhóm còn đủ quỹ cho chuyến đi không?`

Visual contract:
- Use bright white cards on `brand-light` background.
- Progress emphasis may use blue fills or rings; warning states may add yellow support surfaces.
- Avoid red in normal finance states; keep coral reserved for urgent warnings or SOS-related surfaces.

Behavior contract:
- All finance numbers are rendered from server snapshots only.
- If no fund exists yet, the empty state should point the leader to create one and reassure members that progress will appear here after setup.

### 2. Góp quỹ

Primary layout: **one action sheet + one method reveal area**.

Contract:
- There is one obvious entry action: view or configure the contribution surface.
- Members should never choose between multiple competing CTAs on first sight. The main member CTA should be `Xem mã góp quỹ`.
- QR options live under one unified payment surface with two labeled method blocks: `MoMo` and `Chuyển khoản`.
- Contribution state must distinguish `Đang chờ xác nhận` from `Đã xác nhận` without needing users to inspect history detail.

Leader contract:
- Leader configures target, currency, and both QR payloads from the same sheet.
- Structural controls stay grouped in one settings container, never scattered across the summary area.

Member contract:
- Member sees target amount, current progress, instructions, transfer note field if available, and one clear way to mark contribution intent.
- If QR metadata is incomplete, the UI falls back to explanation copy instead of showing broken placeholders.

### 3. Theo dõi an toàn

Primary layout: **forecast cards above contextual insights**.

Contract:
- The weather block heading is exactly `Dự báo 5 ngày`.
- Weather cards are horizontal on mobile and can expand to a compact grid on desktop.
- Crowd pressure is shown as short, scannable highlight rows, not paragraphs.
- The panel must foreground upcoming itinerary context first, such as destination labels or day references.

Fallback contract:
- If provider data is empty or partial, show graceful copy that says the app is still checking and suggest trying again later.
- Empty safety states must feel informative, not broken.

### 4. Danh bạ khẩn cấp

Primary layout: **action list cards**.

Contract:
- Each card contains title, service kind, address, and any quick actions available.
- Action labels are exactly `Gọi ngay` and `Mở bản đồ` where data exists.
- Quick actions are full-text buttons, never icon-only.
- Cards should feel dependable and practical, with minimal decorative treatment.

### 5. Lưu ý văn hóa

Primary layout: **banner strip or stacked caution cards**.

Contract:
- Heading is exactly `Lưu ý văn hóa`.
- Warnings only render when they are tied to destination or itinerary context.
- Tone is respectful and practical, not dramatic or scolding.
- Warnings should sit above the SOS area so the user sees prevention before escalation.

### 6. SOS

Primary layout: **single urgent card with clear follow-up strip**.

Contract:
- The SOS block must be visually distinct from the rest of the tab using darker surfaces, stronger border contrast, and tighter copy.
- One dominant CTA is labeled exactly `Gửi SOS`.
- After activation, the sent state must remain visible with clear next-step guidance and not disappear after a toast.
- The fallback strip must be able to show `Gọi trưởng đoàn`, `113`, `114`, and `115`.
- If browser notifications are available, the permission request is supportive and secondary. Denial must never block sending SOS.

Tone contract:
- This block is serious, compact, and confidence-building.
- No playful gradients, celebratory language, or bouncy motion in the urgent zone.

---

## Interaction Contracts

### Layout And Navigation

- The tab keeps the existing trip-shell rounded card language and mobile-first spacing rhythm.
- Major sections are vertically stacked; avoid nested tabs inside `Quỹ & an toàn`.
- Desktop may use a two-column split only when the reading order still remains clear on collapse to mobile.

### Visual Hierarchy

- Primary focal point for ordinary visits: the fund summary hero.
- Primary focal point for urgent visits: the SOS card.
- Secondary focal points: contribution CTA and weather overview.
- Directory and cultural warnings are supportive but must remain easy to spot during stress.

### Motion

- Finance cards may use soft fade-in or subtle count emphasis matching the existing app tone.
- Safety overview may use light stagger reveals.
- SOS state changes should use restrained transitions only; no bounce animation in urgent interactions.

### Empty States

- Every empty state must include a next step.
- Finance empty states should reassure:
  - `Chưa mở quỹ cho chuyến đi`
  - `Trưởng đoàn có thể tạo quỹ để cả nhóm theo dõi và góp tiền tại đây.`
- Safety empty states should inform:
  - `Đang chờ dữ liệu an toàn`
  - `Bọn mình chưa lấy được dự báo mới. Thử làm mới lại sau ít phút.`

### Error States

- Errors are short, human, and local to the action.
- Use this contract for failed mutations:
  - `Chưa cập nhật được ngay lúc này. Thử lại một lần nữa hoặc làm mới trang.`
- For SOS-specific failure:
  - `Chưa gửi được cảnh báo SOS. Hãy thử lại ngay hoặc dùng số gọi khẩn cấp bên dưới.`

### Responsive Rules

- On mobile, all section cards stack in one column with touch targets at least 44px tall.
- On desktop, finance summary can use a 2x2 stat grid while safety cards remain readable without becoming table-like.
- Never place more than two equal-priority CTAs in the same row on mobile.

---

## Spacing Scale

Declared values (must be multiples of 4):

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Tiny inline gaps, status dots |
| sm | 8px | Icon-label gaps, chip spacing |
| md | 16px | Default card internals and form spacing |
| lg | 24px | Standard section padding |
| xl | 32px | Separation between major cards |
| 2xl | 48px | Major section rhythm |
| 3xl | 64px | Full-page or hero separation |

Exceptions: none

Layout rules:
- Default card padding is `24px` on desktop and `16px` on compact mobile.
- Urgent SOS card may use `20px` internal vertical rhythm only if implemented via `16px` + `4px` grouped tokens rather than new spacing tokens.
- Grid gaps must stay at `16px` or `24px`.

---

## Typography

| Role | Size | Weight | Line Height |
|------|------|--------|-------------|
| Body | 16px | 500 | 1.6 |
| Label | 14px | 700 | 1.4 |
| Heading | 24px | 700 | 1.25 |
| Display | 32px | 700 | 1.15 |

Typography rules:
- Use only two weights in this phase: `500` and `700`.
- Finance amounts use `Display`.
- Section titles such as `Quỹ chung`, `Dự báo 5 ngày`, and `Lưu ý văn hóa` use `Heading`.
- Small helper labels such as method names or warning tags use `Label`.
- Do not introduce uppercase-heavy headings; reserve uppercase for tiny utility labels only.

---

## Color

| Role | Value | Usage |
|------|-------|-------|
| Dominant (60%) | `#F8F9FA` | Page background, quiet section canvas |
| Secondary (30%) | `#FFFFFF` and `#1A1A2E` | Cards, dark urgent surface, tab contrast surfaces |
| Accent (10%) | `#4D96FF` | Finance progress emphasis, active controls, focus rings, primary non-urgent CTA |
| Destructive | `#FF6B6B` | SOS CTA, urgent warnings, destructive confirmations only |

Accent reserved for:
- active `Quỹ & an toàn` tab state
- primary contribution CTA
- finance progress bar or ring
- active form focus state
- one highlighted safety insight per screen

Never use accent for:
- all buttons at once
- generic paragraph text
- all card borders
- SOS container background

Semantic support colors:
- `#6BCB77` for confirmed or safe states such as `Đã xác nhận`
- `#FFD93D` for caution or spending-pressure warnings

---

## Copywriting Contract

| Element | Copy |
|---------|------|
| Primary CTA | `Mở quỹ chuyến đi`, `Xem mã góp quỹ`, `Gửi SOS` |
| Empty state heading | `Chưa mở quỹ cho chuyến đi`, `Đang chờ dữ liệu an toàn` |
| Empty state body | `Trưởng đoàn có thể tạo quỹ để cả nhóm theo dõi và góp tiền tại đây.` / `Bọn mình chưa lấy được dự báo mới. Thử làm mới lại sau ít phút.` |
| Error state | `Chưa cập nhật được ngay lúc này. Thử lại một lần nữa hoặc làm mới trang.` |
| Destructive confirmation | `Đóng cảnh báo`: `Chỉ đóng khi cả nhóm đã nắm tình hình và không còn cần cảnh báo này nữa. Bạn vẫn có thể xem lại thông tin sau đó.` |

Copy rules:
- UI phải 100% tiếng Việt.
- Finance copy should feel minh bạch, nhẹ đầu, không giống ứng dụng kế toán.
- Safety copy should be direct and practical.
- SOS copy must sound calm, serious, and immediate.
- Avoid backend terms such as `snapshot`, `payload`, `provider`, or `acknowledge`.

---

## Component Contract

Required reusable UI pieces for Phase 04:
- `FinanceSafetyTab`
- `FundOverviewPanel`
- `FundContributionSheet`
- `SafetyOverviewPanel`
- `SafetyDirectoryList`
- `CulturalWarningBanner`
- `SOSPanel`

Behavioral component rules:
- `FundOverviewPanel` owns the finance-summary hierarchy and must not be diluted with admin controls.
- `FundContributionSheet` owns all fund setup or contribution interactions and keeps both transfer methods under one flow.
- `SafetyOverviewPanel` handles partial-data fallback locally instead of pushing provider errors into parent layout.
- `SOSPanel` keeps alert state and quick-dial fallback visually grouped.

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | none | not required |
| third-party registry | none | not required |

Phase 04 continues the repo's handcrafted component approach. No third-party registry blocks are approved or required for this phase.

---

## Checker Sign-Off

- [x] Dimension 1 Copywriting: PASS
- [x] Dimension 2 Visuals: PASS
- [x] Dimension 3 Color: PASS
- [x] Dimension 4 Typography: PASS
- [x] Dimension 5 Spacing: PASS
- [x] Dimension 6 Registry Safety: PASS

**Approval:** approved 2026-03-30
