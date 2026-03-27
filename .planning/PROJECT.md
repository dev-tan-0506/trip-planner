# Chuyến Đi Tiện Lợi (Trip Planner)

## What This Is

Một ứng dụng/web kết nối lên kế hoạch du lịch toàn diện dành cho cá nhân, nhóm bạn hoặc tập thể lớn. Ứng dụng cung cấp trải nghiệm từ A-Z: chọn địa điểm, lên lịch trình, dự tính chi phí, phân công nhiệm vụ, theo dõi vị trí và chia sẻ kỷ niệm, với định hướng thương mại hóa trong tương lai.

## Core Value

Sự tiện lợi tối đa và loại bỏ hoàn toàn các "nỗi đau" (pain points) khi đi chơi nhóm, thông qua việc quản lý tập trung toàn bộ lịch trình, tài chính, nhiệm vụ và kỷ niệm tại một nơi duy nhất.

## Requirements

### Validated

<!-- Shipped and confirmed valuable. -->

(None yet — ship to validate)

### Active

<!-- Current scope. Building toward these. -->

- [ ] **Lên kế hoạch linh hoạt:** Hỗ trợ tạo chuyến đi cho 1 mình, nhóm bạn, hoặc tập thể lớn. Tích hợp tính năng "Quẹt (Swipe)" kiểu Tinder để khảo sát ý kiến ăn uống/vui chơi trong nhóm.
- [ ] **Lịch trình sống động:** Hiển thị timeline các hoạt động (đã qua, đang diễn ra, sắp tới). Cho phép linh hoạt bổ sung hoặc thay đổi lịch trình ngay cả khi chuyến đi đang lấp đầy hay trống lịch.
- [ ] **Bản đồ & Định vị nhóm:** Hiển thị lịch trình trên bản đồ. Theo dõi vị trí các thành viên (biết ai đã đến điểm tập trung, ai đã về nhà an toàn).
- [ ] **Phân công & Hạ tầng Logistics (Smart To-do & Packing List):** Trưởng nhóm giao việc lớn (thuê xe, book phòng) và đồ dùng dùng chung. Check-list nhiều điểm chạm: Đã giao -> Xác nhận đã ghi nhớ -> Đã hoàn thành (Load minh chứng/ảnh/thông tin booking).
- [ ] **Quản lý Quỹ nhóm & Chi phí:** Cung cấp mẫu dự toán chi phí. Quản lý quỹ bởi thủ quỹ, hiển thị mã QR (MoMo/Ngân hàng) để thu tiền, theo dõi tiến độ đóng quỹ và nhắc nhở thành viên.
- [ ] **Kho lưu trữ số (Media & Digital Wallet):** Cloud chia sẻ ảnh/video siêu nhanh cho nhóm. "Két sắt ảo" để thu thập bản sao giấy tờ (CCCD, vé máy bay/khách sạn) giúp Leader dễ check-in.
- [ ] **Khám phá & Cảnh báo thông minh:** Hiển thị thời tiết cho các điểm đến sắp tới trên timeline. Gợi ý thông minh các trạm y tế, trạm xăng lân cận.
- [ ] **Giải trí & Gắn kết (Gamification):** Tích hợp các mini-game (Truth or Dare, Quiz, Xoay vòng...) trên app để chơi giết thời gian lúc đi xe gường nằm/di chuyển xa.
- [ ] **Cứu hộ khẩn cấp (SOS Alert):** Nút SOS khẩn cấp, khi kích hoạt sẽ phát tín hiệu thiết bị rung cảnh báo và hiển thị vị trí cho tất cả các thành viên trong nhóm.
- [ ] **Mô hình kinh doanh (Phase tiếp theo):** Thành viên đăng bản sao lịch trình (ví dụ: Đà Lạt 3N2Đ) lên cộng đồng; người khác copy lịch trình sẽ giúp người tạo ra hoa hồng (affiliate).

### Out of Scope

<!-- Explicit boundaries. Includes reasoning to prevent re-adding. -->

- [Chia tiền lẻ tẻ (Split bill) tự động] — Tạm thời nằm ngoài phạm vi V1, V1 sẽ tập trung vào quản lý "Quỹ chung" (thu trước, chi sau) để đơn giản hóa luồng tiền. Tích hợp sau.
- [Sửa chung Real-time / Cấp quyền tự do] — V1 chỉ cấp quyền cho Leader tạo/sửa lịch trình và Member nhận việc/vote. Real-time co-editing (như Google Docs) là quá phức tạp cho MVP và sẽ làm sau.

## Context

- Sản phẩm định vị là công cụ tiện ích (utility) cực mạnh ở giai đoạn đầu để thu hút tệp người dùng tự nhiên (organic), trước khi mở khóa các tính năng thương mại (Affiliate booking, Social sharing).
- Thư mục dự án đã có sẵn một số mã nguồn khởi điểm nhưng đã bỏ qua bước lập bản đồ (Skip codebase map), các tính năng sẽ được phát triển tiếp nối vào codebase hiện tại.

## Constraints

- **[Khả năng sử dụng (Usability)]**: Giao diện và luồng thao tác phải cực kỳ tối giản, dễ hiểu — Vì đối tượng người dùng có thể là bất cứ ai trong nhóm (không rành công nghệ cũng phải dùng được để scan QR, vote, xem timeline).
- **[Quyền riêng tư (Privacy)]**: Tính năng chia sẻ vị trí (Live Location Tracking) — Cần tuân thủ quy tắc chỉ bật khi đang diễn ra chuyến đi và có sự đồng ý của người dùng để không vi phạm quyền riêng tư.
- **[Hiệu năng (Performance)]**: Tính năng Album nhóm tải ảnh — Phải tối ưu hóa chi phí lưu trữ và tốc độ tải, tránh tình trạng app bị chậm khi nhóm tải lên lượng lớn hình ảnh/video độ phân giải cao.

## Key Decisions

<!-- Decisions that constrain future work. Add throughout project lifecycle. -->

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| [Chọn "Quỹ chung" thay vì "Split bill"] | Dễ dàng kiểm soát tài chính tập trung trong V1 và đảm bảo mọi người đóng tiền đủ. | — Pending |
| [Phân quyền Leader-driven] | Dễ kiểm soát cấu trúc dữ liệu V1 hơn việc cấp quyền edit ngang hàng cho tất cả mọi người. | — Pending |

---
*Last updated: 2026-03-27 after initialization*
