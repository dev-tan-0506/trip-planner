# Phase 5: Deep AI Integration - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-01
**Phase:** 05-deep-ai-integration
**Areas discussed:** AI authority, feature entry points, output/action model, trust/fallback behavior

---

## AI Authority

| Option | Description | Selected |
|--------|-------------|----------|
| AI chỉ gợi ý/draft, leader xác nhận mọi thay đổi quan trọng | AI phân tích, gợi ý, tạo draft; dữ liệu cấu trúc chỉ đổi khi người dùng xác nhận | ✓ |
| AI được tự tạo một số item/tuyến rồi leader duyệt sau | Cho AI mạnh tay hơn ở một số flow, nhưng vẫn cần bước duyệt hậu kiểm | |
| Mỗi feature một kiểu khác nhau, không cần rule chung | Linh hoạt theo từng feature nhưng khó giữ trust model thống nhất | |

**User's choice:** AI chỉ gợi ý/draft, leader xác nhận mọi thay đổi quan trọng
**Notes:** Warning advisory như health/cost có thể hiện trực tiếp, nhưng AI không tự sửa dữ liệu canonical.

---

## Entry Points

| Option | Description | Selected |
|--------|-------------|----------|
| AI nằm chủ yếu trong trip workspace, chỉ mở sheet/panel/route phụ khi thật cần | Giữ trip workspace là nhà chính và tránh tách user khỏi ngữ cảnh chuyến đi | ✓ |
| Tạo hẳn một AI Hub riêng cho hầu hết tính năng AI | Tập trung AI vào một chỗ riêng nhưng làm tăng context switching | |
| Hybrid rõ ràng: một số ở workspace, một số ở route riêng theo từng feature | Linh hoạt hơn nhưng cần quyết định riêng cho nhiều feature từ sớm | |

**User's choice:** AI nằm chủ yếu trong trip workspace, chỉ mở sheet/panel/route phụ khi thật cần
**Notes:** Không dựng AI Hub riêng ở giai đoạn này.

---

## Output And Action Model

| Option | Description | Selected |
|--------|-------------|----------|
| Bundle khuyến nghị mặc định | Route ẩm thực trả tuyến gợi ý có apply step; email parse ra draft; translator/local expert dùng card ngắn; outfit ra 1-3 cards; podcast có audio + text recap; cost benchmark gắn warning vào context chi tiêu | ✓ |
| Chỉnh riêng từng feature trước khi lập plan | Đi sâu từng feature ngay trong discuss phase | |

**User's choice:** Giữ bundle khuyến nghị mặc định
**Notes:** User trả lời `ok`, tức là chấp nhận mặc định cho toàn bộ output shape của các feature trong Phase 5.

---

## Trust And Fallback

| Option | Description | Selected |
|--------|-------------|----------|
| AI luôn khiêm tốn, có confidence/fallback rõ ràng, và không tự tin quá mức | Gắn nhãn mức chắc chắn, giữ review/edit step và luôn có đường manual fallback | ✓ |
| Ưu tiên trải nghiệm mượt, ít nói về độ chắc chắn để đỡ rối | Gọn hơn nhưng rủi ro trust cao ở các flow nhạy cảm | |
| Chỉ một số feature có confidence/fallback rõ, còn lại để agent discretion | Ít việc hơn nhưng dễ thiếu nhất quán giữa các feature | |

**User's choice:** AI luôn khiêm tốn, có confidence/fallback rõ ràng, và không tự tin quá mức
**Notes:** Đặc biệt áp dụng cho booking parsing, health/dietary conflict, và local cost benchmarking.

---

## Deferred Ideas

- `Track proposal realtime sync follow-up` — reviewed but not folded into Phase 5 because it is collaboration/realtime debt, not AI feature scope.

## the agent's Discretion

- Planner may choose how to split Phase 5 into execution waves and modules as long as the locked trust model and trip-workspace-first approach are preserved.
