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

- [ ] **Lên kế hoạch linh hoạt:** Hỗ trợ tạo chuyến đi cho 1 mình, nhóm bạn, hoặc tập thể lớn.
- [ ] **Bản đồ & Định vị nhóm:** Hiển thị lịch trình trên bản đồ tương tác, tự động tính khoảng cách/thời gian. Theo dõi vị trí các thành viên trong chuyến đi (biết ai đã đến điểm tập trung, ai đã về nhà an toàn).
- [ ] **Timeline Lịch trình & Nhắc nhở:** Hiển thị dòng thời gian các hoạt động (đã qua, đang diễn ra, sắp tới). Có hệ thống thông báo nhắc nhở trước chuyến đi, đến ngày đi và kết thúc chuyến đi.
- [ ] **Phân công nhiệm vụ (To-do List):** Trưởng nhóm giao việc (thuê xe, book phòng...). Người được giao có thể xác nhận "Done", tải lên minh chứng/thông tin booking kèm thông báo báo cáo.
- [ ] **Quản lý Quỹ nhóm & Chi phí:** Cung cấp mẫu dự toán chi phí để áp dụng nhanh. Quản lý quỹ tập trung bởi leader/thủ quỹ, hỗ trợ hiển thị mã QR (MoMo/Ngân hàng) để thu tiền, theo dõi tiến độ đóng quỹ và nhắc nhở thành viên.
- [ ] **Kho lưu trữ kỷ niệm:** Album ảnh/video chung trên cloud của chuyến đi. Thành viên có thể chủ động upload và download trực tiếp trên app cực nhanh gọn không cần qua Google Drive.
- [ ] **Khám phá & Cảnh báo thông minh (Contextual Alerts):** Cảnh báo thời tiết cho các điểm đến sắp tới trên timeline để linh hoạt đổi lịch. Gợi ý thông minh các tiện ích xung quanh (trạm xăng, trạm y tế...).
- [ ] **Mô hình kinh doanh (Phase tiếp theo):** Thành viên đăng bản sao lịch trình (ví dụ: Đà Lạt 3N2Đ) lên cộng đồng; người khác copy lịch trình sẽ giúp người tạo ra hoa hồng (affiliate).

### Out of Scope

<!-- Explicit boundaries. Includes reasoning to prevent re-adding. -->

- [Chia tiền lẻ tẻ (Split bill) tự động] — Tạm thời nằm ngoài phạm vi V1, V1 sẽ tập trung vào quản lý "Quỹ chung" (thu trước, chi sau) để đơn giản hóa luồng tiền. Tích hợp sau.
- [Sửa chung Real-time / Cấp quyền tự do] — V1 chỉ cấp quyền cho Leader tạo/sửa lịch trình và Member nhận việc/đề xuất. Real-time co-editing (như Google Docs) là quá phức tạp cho MVP và sẽ làm sau.

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
