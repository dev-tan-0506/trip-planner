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

- [ ] **Lên kế hoạch linh hoạt:** Hỗ trợ tạo chuyến đi đa dạng quy mô. Tích hợp tính năng "Quẹt (Swipe)" kiểu Tinder để khảo sát ý kiến ăn uống/vui chơi trong nhóm.
- [ ] **Trợ lý Thời trang & Dresscode (AI Outfit Planner):** (Optional) Cho phép nhóm thống nhất dresscode chung cho từng ngày. Tích hợp AI gợi ý màu sắc/kiểu dáng dựa trên thời tiết, phong cảnh điểm đến và trend nhằm giúp nhóm có ảnh đẹp. Phối hợp tự động với checklist đóng gói hành lý cá nhân.
- [ ] **Nhập liệu tự động (Auto-parsing Hub):** Tích hợp AI đọc email nội dung vé máy bay, booking khách sạn được forward tới. Tự động bóc tách và xếp thông tin vé/giờ bay, mã booking vào khung giờ đúng trên Timeline.
- [ ] **Lịch trình sống động:** Hiển thị timeline các hoạt động. Cho phép bổ sung/thay đổi lịch trình mọi lúc. Tự động cảnh báo đỏ nếu điểm đến/quán ăn vi phạm hồ sơ dị ứng sức khỏe của nhóm.
- [ ] **Hồ sơ Cá nhân hóa (Health & Dietary Profile):** Thành viên tự khai báo tình trạng dị ứng, say xe... App tự map vào lịch trình chung để cảnh báo hoặc tự động sắp xếp ghế ngồi di chuyển.
- [ ] **Trợ lý AI Bản địa (Local Expert AI):** Tích hợp AI đóng vai trò HDV chuyên sâu bản địa, gợi ý các không gian "núp hẻm" của dân địa phương, dịch menu ngon miệng và thuyết minh lịch sử khi quét camera.
- [ ] **Bản đồ & Định vị nhóm:** Hiển thị lịch trình trên bản đồ. Theo dõi vị trí thiết bị các thành viên.
- [ ] **Tương tác Ngoại tuyến (Offline Mode & Mesh Network):** Dành cho khu vực không có sóng/vùng sâu vùng xa. Tự động chuyển qua kết nối Bluetooth mạng lưới nhóm (Mesh) để nhắn tin và tìm vị trí tầm ngắn.
- [ ] **Phân công & Hạ tầng Logistics (Smart To-do):** Trưởng nhóm giao việc lớn và đồ dùng chung. Tracking trạng thái hoàn thành kèm minh chứng (vé, bill).
- [ ] **Quản lý Quỹ nhóm & Chi phí:** Mẫu dự toán chi phí. Quản lý quỹ tập trung bởi thủ quỹ, hiển thị QR code đóng tiền (MoMo/Bank), nhắc nhở thành viên đóng quỹ.
- [ ] **Kho lưu trữ số:** Cloud chia sẻ media siêu tốc. "Két sắt ảo" để thu thập bản sao giấy tờ (CCCD, vé máy bay) giúp Leader check-in đoàn rút gọn trải nghiệm.
- [ ] **Khám phá & Cảnh báo thông minh:** Hiển thị thời tiết cho các điểm đến sắp tới. Gợi ý trạm y tế, trạm xăng lân cận.
- [ ] **Cứu hộ dã chiến (On-demand Concierge):** Khi gặp sự cố xe cộ (đứt lốp) hoặc cấp cứu y tế, nhóm có thể gọi trực tiếp đội sửa xe/cứu hộ địa phương đã được App xác minh gần tọa độ nhất.
- [ ] **Giải trí & Cứu hộ (Gamification & SOS):** Tích hợp mini-game trên app. Nút SOS khẩn cấp nội bộ báo động rung thiết bị cho tất cả thành viên.
- [ ] **Khảo sát ẩn danh (Anonymous Post-trip Feedback):** Cuối chuyến đi, một bảng review vui vẻ ẩn danh giúp xí xóa tâm lý, rút kinh nghiệm (ví dụ: vote người hay lề mề nhất, khen ngợi thủ quỹ...).
- [ ] **Mô hình kinh doanh (Phase tiếp theo):** Thành viên đăng bản sao lịch trình lên cộng đồng kiếm affiliate.
- [ ] **Định vị vật phẩm (Tag Tracking - Phase tiếp theo):** Hỗ trợ tích hợp Smart Tag Bluetooth để quản lý vali chung/thú cưng.

### Out of Scope

<!-- Explicit boundaries. Includes reasoning to prevent re-adding. -->

- [Kỷ niệm ảo AR/Energy Monitor/Ví điện tử tạm thời] — Ghi nhận ý tưởng mở rộng nhưng không đưa vào V1 để ưu tiên nguồn lực cốt lõi.
- [Nhật ký chạy tự động / Vlog auto-render] — Tạm gác lại do chưa cần thiết ở giai đoạn đầu và chi phí render cao.
- [Chia tiền lẻ tẻ tự động] — Tạm thời nằm ngoài phạm vi V1, V1 sẽ tập trung vào "Quỹ chung".
- [Sửa chung Real-time] — V1 chỉ cấp quyền cho Leader tạo/sửa lịch trình để dễ kiểm soát dữ liệu.

## Context

- Sản phẩm định dạng như một super-utility du lịch siêu mạnh, biến Trưởng Đoàn thành một Tour guide chuyên nghiệp. Các công nghệ nền sâu (Offline Mesh, AI) là năng lực cốt lõi so sánh với thị trường (core-differentiators).
- Thư mục dự án đã có sẵn code nên tính năng phát triển bổ sung/refactor tiếp nối (Skip codebase map).

## Constraints

- **[Khả năng sử dụng]**: Mọi tính năng cao cấp (Mesh Network, AI) phải hoạt động mượt mà ngầm, giữ UI cực kì tối giản cho mẹ bỉm sữa, dân không văn phòng vẫn bấm mượt mà.
- **[Hiệu năng Pin]**: Live Tracking và Bluetooth Mesh bắt buộc giải bài toán tiết kiệm Pin (Battery Drain) khi dùng cho chuyến đi vài ngày.
- **[Quyền riêng tư]**: Dữ liệu Live Location chỉ thu thập với sự đồng thuận rõ ràng khi chuyến đi "On-going" và tự tắt khi kết thúc (End Trip).

## Key Decisions

<!-- Decisions that constrain future work. Add throughout project lifecycle. -->

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| [Chọn "Quỹ chung" thay vì "Split bill"] | Dễ quản lý rủi tự đòi tiền cuối khóa. | — Pending |
| [Phân quyền Leader-driven] | Dễ kiểm soát cấu trúc dữ liệu V1. | — Pending |

---
*Last updated: 2026-03-27 after initialization*
