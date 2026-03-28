# Phase 2: the-itinerary-engine - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-28
**Phase:** 02-the-itinerary-engine
**Areas discussed:** timeline structure, timeline collaboration, timeline states, map behavior, voting flow, template cloning

---

## Timeline Structure

| Option | Description | Selected |
|--------|-------------|----------|
| Item đơn giản theo mốc thời gian | Giờ, tiêu đề, địa điểm, ghi chú ngắn | ✓ |
| Item chi tiết vừa phải | Thêm mô tả, người phụ trách, chi phí | |
| Item rất đầy đủ | Thêm trạng thái, ảnh, link, checklist con | |

**User's choice:** Timeline item stays simple.
**Notes:** The user prioritized reliability and low error risk over richer modeling.

| Option | Description | Selected |
|--------|-------------|----------|
| Theo từng ngày | Each day is its own timeline group | ✓ |
| Một dòng timeline dài | Whole trip in one list | |
| Theo ngày với sáng/chiều/tối | Additional segmented blocks | |

**User's choice:** Group itinerary by day.
**Notes:** Chosen for clarity and lower implementation risk.

| Option | Description | Selected |
|--------|-------------|----------|
| Kéo-thả trong timeline giữa item/ngày | Reorder and move items across days | ✓ |
| Chỉ trong cùng ngày | Safer but more limited | |
| Kéo-thả rất tự do | Highest flexibility | |

**User's choice:** Allow moving items within and across days.
**Notes:** Leader remains sole structural editor.

| Option | Description | Selected |
|--------|-------------|----------|
| Cho phép không có giờ | Show item as not finalized yet | ✓ |
| Bắt buộc phải có giờ | Force complete scheduling | |
| Chọn khung giờ | Morning/afternoon/evening buckets | |

**User's choice:** Allow untimed items.
**Notes:** Untimed items later became a distinct display state.

| Option | Description | Selected |
|--------|-------------|----------|
| Form ngắn gọn ngay trong timeline | Quick inline create | |
| Mở modal riêng | Separate create surface | |
| Có chế độ nhanh và chế độ chi tiết | Dual-path creation | ✓ |

**User's choice:** Support both quick and detailed creation modes.
**Notes:** Quick mode should remain the default for safety and speed.

| Option | Description | Selected |
|--------|-------------|----------|
| Cuối ngày đang chọn | Default append | |
| Tự chèn theo giờ | Smart placement | |
| Cho người dùng chọn vị trí | Leader chooses insertion point | ✓ |

**User's choice:** Leader chooses insertion position.
**Notes:** Keeps automatic placement ambiguity out of the first version.

| Option | Description | Selected |
|--------|-------------|----------|
| Sửa nhanh inline | Inline editing | |
| Mở panel/modal chỉnh sửa riêng | Dedicated edit UI | ✓ |
| Cả inline và modal | Mixed editing models | |

**User's choice:** Edit in a dedicated modal/panel.
**Notes:** Chosen for stronger validation and fewer UI state bugs.

| Option | Description | Selected |
|--------|-------------|----------|
| Xác nhận trước khi xoá | Explicit confirmation | ✓ |
| Xoá ngay, có hoàn tác | Undo-based deletion | |
| Thùng rác tạm | Trash model | |

**User's choice:** Confirm before delete.
**Notes:** Safety over speed.

## Timeline Collaboration And State

| Option | Description | Selected |
|--------|-------------|----------|
| Chỉ xem toàn bộ timeline | Members are view-only | |
| Được đề xuất chỉnh sửa, leader duyệt | Proposal model | ✓ |
| Được sửa vài trường không cấu trúc | Limited direct edits | |

**User's choice:** Members propose changes, leader approves.
**Notes:** Direct structural editing remains off-limits for members.

| Option | Description | Selected |
|--------|-------------|----------|
| Đề xuất đơn giản | Change time/location/note or add item | ✓ |
| Đề xuất tự do dạng tin nhắn | Unstructured feedback | |
| Đề xuất có form đầy đủ như leader | Full proposal forms | |

**User's choice:** Use simple structured proposals.
**Notes:** Easier to validate and review.

| Option | Description | Selected |
|--------|-------------|----------|
| Hộp thư đề xuất riêng | Central inbox only | |
| Ghim trực tiếp lên item | Timeline-only proposal indicators | |
| Cả hai | Inbox plus per-item indicators | ✓ |

**User's choice:** Use both inbox and timeline indicators.
**Notes:** Inbox is the primary review surface; timeline only signals related proposals.

| Option | Description | Selected |
|--------|-------------|----------|
| Duyệt từng đề xuất một | Explicit accept/reject | ✓ |
| Duyệt hàng loạt | Bulk moderation | |
| Sửa đề xuất trước khi áp dụng | Edit-on-approval | |

**User's choice:** Review proposals one by one.
**Notes:** Prevents accidental mass changes.

| Option | Description | Selected |
|--------|-------------|----------|
| Leader là nguồn đúng cuối cùng | Old proposals become outdated | ✓ |
| Giữ tất cả đề xuất và merge | Merge conflicting changes | |
| Khoá item khi leader đang sửa | Locking model | |

**User's choice:** Leader edits invalidate older stale proposals.
**Notes:** Avoids conflict merging complexity.

| Option | Description | Selected |
|--------|-------------|----------|
| Trạng thái thủ công do leader cập nhật | Manual progress state | |
| Tự động theo thời gian | Automatic progress state | ✓ |
| Kết hợp | Suggested automatic state with manual override | |

**User's choice:** Progress states are automatic.
**Notes:** Then refined to depend on item start times and next-item boundaries.

| Option | Description | Selected |
|--------|-------------|----------|
| Đến giờ bắt đầu là đang đi, qua giờ bắt đầu tiếp theo thì đã đi | Next-item transition model | ✓ |
| Phải có giờ bắt đầu và giờ kết thúc | Requires more data | |
| Dựa vào leader bấm bắt đầu/kết thúc | Manual progression | |

**User's choice:** Use the next item start time to mark completion.
**Notes:** Keeps the data model simple.

| Option | Description | Selected |
|--------|-------------|----------|
| Luôn là sắp tới | Untimed still in progress flow | |
| Hiển thị riêng là chưa chốt giờ | Separate untimed state | ✓ |
| Tự xếp theo vị trí trong ngày | Infer state from order | |

**User's choice:** Untimed items stay separate as `chua chot gio`.
**Notes:** Prevents misleading automatic progression.

| Option | Description | Selected |
|--------|-------------|----------|
| Có cảnh báo nhưng vẫn cho lưu | Warn-only overlaps | ✓ |
| Chặn luôn, không cho lưu | Hard validation | |
| Không cảnh báo | No overlap handling | |

**User's choice:** Warn on same-day overlaps but still allow save.
**Notes:** Maintains flexibility for real-world travel plans.

| Option | Description | Selected |
|--------|-------------|----------|
| Hiển thị trong form và trên timeline | Form + timeline warning | ✓ |
| Chỉ hiện trong form | Form-only warning | |
| Chỉ hiện trên timeline | Timeline-only warning | |

**User's choice:** Show overlap warnings in both places.
**Notes:** Supports both immediate correction and later awareness.

| Option | Description | Selected |
|--------|-------------|----------|
| Chỉ cảnh báo chồng chéo thời gian cùng ngày | Narrow overlap warning | ✓ |
| Cả thời gian và địa điểm quá xa | Add travel plausibility logic | |
| Mọi thứ bất hợp lý | Broad smart warning | |

**User's choice:** Only same-day time overlap warnings for now.
**Notes:** Distance/travel feasibility was intentionally deferred.

| Option | Description | Selected |
|--------|-------------|----------|
| Hiển thị trống thân thiện + nút thêm item | Simple empty state CTA | ✓ |
| Hiển thị gợi ý mẫu | Suggested schedule content | |
| CTA + vài gợi ý nhẹ | Mixed approach | |

**User's choice:** Friendly empty state with add CTA.
**Notes:** Status highlighting was delegated to the agent with a clarity-first requirement.

## Map Behavior

| Option | Description | Selected |
|--------|-------------|----------|
| Chỉ để xem các điểm trong timeline | Read-only visualization | |
| Vừa xem vừa hỗ trợ chọn địa điểm | Support tool for item editing | ✓ |
| Map là công cụ chính để lên itinerary | Map-first planning | |

**User's choice:** Map supports selection and visualization while timeline stays central.
**Notes:** User requested extra exploration before moving on.

| Option | Description | Selected |
|--------|-------------|----------|
| Search là chính, map chỉ preview | Search-driven selection | |
| Search và có thể bấm trực tiếp trên map | Hybrid selection | ✓ |
| Chủ yếu chọn trực tiếp trên map | Map-first selection | |

**User's choice:** Use both search and map click.
**Notes:** Later refined so map click only suggests and still requires place confirmation.

| Option | Description | Selected |
|--------|-------------|----------|
| Chỉ pin từng địa điểm | Markers only | |
| Pin + nối các điểm theo thứ tự timeline | Visual connectors | ✓ |
| Pin + route đường đi thật | Real routing | |

**User's choice:** Show markers and simple connectors in itinerary order.
**Notes:** Real route guidance was explicitly avoided.

| Option | Description | Selected |
|--------|-------------|----------|
| Cập nhật ngay lập tức | Timeline drives instant map updates | ✓ |
| Chỉ cập nhật khi bấm lưu | Delayed sync | |
| Cho người dùng chọn đồng bộ hay không | Optional sync | |

**User's choice:** Map updates immediately when timeline changes.
**Notes:** Reinforces the timeline as source of truth.

| Option | Description | Selected |
|--------|-------------|----------|
| Bỏ qua item đó trên map | Skip locationless items | ✓ |
| Hiển thị marker tạm | Temporary marker | |
| Bắt buộc item muốn lên map phải có địa điểm | Strict location requirement | |

**User's choice:** Omit items without resolved locations from the map.
**Notes:** Keeps the map trustworthy.

| Option | Description | Selected |
|--------|-------------|----------|
| Hiển thị cùng trang với timeline | Embedded map | |
| Có nút mở map riêng | Separate map screen | ✓ |
| Cả embed và mở rộng | Dual presentation | |

**User's choice:** Use a separate map screen.
**Notes:** Safer for layout and responsiveness.

| Option | Description | Selected |
|--------|-------------|----------|
| Chỉ xem ngày đang chọn | Single-day only | |
| Xem toàn bộ chuyến đi | Whole-trip map | |
| Có bộ lọc ngày | Day-filtered map | ✓ |

**User's choice:** Map screen should include day filters.
**Notes:** Later refined to remember the previously selected day.

| Option | Description | Selected |
|--------|-------------|----------|
| Bấm map chỉ để gợi ý tọa độ rồi xác nhận lại địa điểm | Suggest-then-confirm | ✓ |
| Bấm map là chốt luôn địa điểm | Direct place lock-in | |
| Bấm map mở sheet xác nhận | Sheet-confirm model | |

**User's choice:** Map click only suggests; user still confirms the place.
**Notes:** Prevents saving an imprecise point.

| Option | Description | Selected |
|--------|-------------|----------|
| Tự zoom và highlight địa điểm vừa chọn | Immediate visual confirmation | ✓ |
| Chỉ cập nhật ngầm | Silent update | |
| Hiện popup xác nhận riêng | Separate confirm popup | |

**User's choice:** Zoom and highlight the chosen place.
**Notes:** Gives immediate confidence in the selected result.

| Option | Description | Selected |
|--------|-------------|----------|
| Hiển thị tất cả pin, dày quá thì gom cụm nhẹ | Full visibility with light clustering | ✓ |
| Chỉ hiện một phần điểm nổi bật | Partial visibility | |
| Luôn hiện tất cả pin, không gom | No clustering | |

**User's choice:** Show all pins with light clustering when dense.
**Notes:** Balances completeness and readability.

| Option | Description | Selected |
|--------|-------------|----------|
| Chỉ là đường nối trực quan đơn giản | Visual connectors only | ✓ |
| Ước lượng gần đúng theo đường đi | Approximate route | |
| Đường đi thật từ dịch vụ map | Real directions | |

**User's choice:** Simple visual connectors only.
**Notes:** Avoided dependency on directions APIs.

| Option | Description | Selected |
|--------|-------------|----------|
| Cập nhật ngay và vẽ lại pin/đường nối | Immediate redraw | ✓ |
| Chờ refresh màn map | Manual refresh | |
| Hỏi có cập nhật map không | Confirm sync prompt | |

**User's choice:** Redraw map immediately when locations change.
**Notes:** Keeps map faithful to itinerary state.

| Option | Description | Selected |
|--------|-------------|----------|
| Tự focus vào ngày hiện tại nếu có | Current-day default | |
| Nhớ bộ lọc/ngày lần xem trước | Persist previous filter | ✓ |
| Luôn mở toàn bộ chuyến đi | Whole-trip default | |

**User's choice:** Remember the last selected day filter.
**Notes:** Persistence stays limited to simple viewing state.

| Option | Description | Selected |
|--------|-------------|----------|
| Mở map và focus ngay vào item đó | Deep-link focus | ✓ |
| Mở màn map chung như bình thường | Generic open | |
| Hỏi focus item hay xem cả ngày | Prompted behavior | |

**User's choice:** Opening from an item should focus that item on the map.
**Notes:** Strengthens item-to-map navigation context.

## Voting Flow

| Option | Description | Selected |
|--------|-------------|----------|
| Chỉ để chọn địa điểm/hoạt động mới | New candidates only | |
| Vote cho item mới và phương án thay thế item hiện có | New + replacement | ✓ |
| Vote cho cả thêm / thay / bỏ / dời lịch | Fully broad planning vote | |

**User's choice:** Use voting for new options and replacement options.
**Notes:** Broad initial request was narrowed for safety.

| Option | Description | Selected |
|--------|-------------|----------|
| Chỉ leader tạo voting | Leader-only creation | |
| Member đề xuất, leader duyệt | Proposed vote sessions | ✓ |
| Ai cũng tạo được | Open creation | |

**User's choice:** Members may propose votes, leader approves before opening.
**Notes:** Maintains control over what becomes group voting.

| Option | Description | Selected |
|--------|-------------|----------|
| Chỉ tạo kết quả đề xuất, leader xác nhận | Manual apply | |
| Tự động đưa vào timeline nếu đủ phiếu | Fully automatic apply | |
| Tự động với item mới, leader xác nhận với thay thế | Split by vote type | ✓ |

**User's choice:** Split application by vote type.
**Notes:** New winners may auto-create items; replacements still require leader confirmation.

| Option | Description | Selected |
|--------|-------------|----------|
| Vuốt trái/phải kiểu Tinder | Swipe cards | ✓ |
| Bấm thích / không thích | Button-based voting | |
| Cả vuốt lẫn nút bấm | Hybrid interaction | |

**User's choice:** Swipe-first Tinder-style voting.
**Notes:** Desktop fallback still needs to be designed safely.

| Option | Description | Selected |
|--------|-------------|----------|
| Có thời hạn do leader đặt | Leader-set deadline | ✓ |
| Kết thúc khi đủ số người vote | Participation-based closure | |
| Kết hợp | Hybrid closure | |

**User's choice:** Voting ends at a leader-defined deadline.
**Notes:** Prevents votes from hanging open indefinitely.

| Option | Description | Selected |
|--------|-------------|----------|
| Leader quyết định | Leader resolves ties | |
| Ưu tiên lựa chọn tạo sớm hơn | First-created wins | |
| Mở vòng vote mới | Tie-break round | ✓ |

**User's choice:** Run a tie-break round on ties.
**Notes:** Agent added one more safety rule: a second tie falls back to leader decision.

| Option | Description | Selected |
|--------|-------------|----------|
| Ẩn kết quả tới khi hết hạn | Hidden interim results | |
| Hiện kết quả tạm thời realtime | Live trend visibility | ✓ |
| Leader thấy, member không thấy | Leader-only visibility | |

**User's choice:** Show live interim results.
**Notes:** Final result still only locks at deadline.

| Option | Description | Selected |
|--------|-------------|----------|
| Hiển thị rõ item hiện tại đang bị thách đấu | Clear replacement context | ✓ |
| Chỉ hiện phương án mới | Challenger-only display | |
| Hiện như vote bình thường | Generic vote display | |

**User's choice:** Show replacement context explicitly.
**Notes:** Avoids confusion between replacement and addition.

| Option | Description | Selected |
|--------|-------------|----------|
| Chỉ thành viên chính thức của trip | Members only | ✓ |
| Cả guest đã vào link trip cũng được vote | Guest voting | |
| Leader chọn nội bộ hay mở rộng | Per-session access | |

**User's choice:** Only official members can vote.
**Notes:** Keeps permissions clear and limits abuse.

| Option | Description | Selected |
|--------|-------------|----------|
| Không được đổi | Fixed vote | |
| Được đổi tới trước hạn | Replaceable vote | ✓ |
| Leader quyết định theo từng phiên | Per-session rule | |

**User's choice:** Members can change their vote before the deadline.
**Notes:** Only the latest active vote counts.

| Option | Description | Selected |
|--------|-------------|----------|
| Leader chỉ định sẵn ngày/vị trí khi tạo voting | Preplanned insertion | ✓ |
| Thắng rồi mới hỏi leader chèn vào đâu | Post-result placement | |
| Tự chèn vào cuối ngày liên quan | Automatic append | |

**User's choice:** Leader must predefine placement for new-option votes.
**Notes:** Makes auto-addition deterministic.

| Option | Description | Selected |
|--------|-------------|----------|
| Ít lựa chọn, ví dụ 2-5 | Small bounded option set | |
| Không giới hạn | Unbounded option count | ✓ |
| Chỉ 2 lựa chọn đối đầu | Head-to-head only | |

**User's choice:** No hard cap in data model.
**Notes:** Agent constrained the UX to sequential card presentation for safety.

| Option | Description | Selected |
|--------|-------------|----------|
| Chỉ leader thêm lựa chọn | Leader-only option creation | |
| Member đề xuất thêm, leader duyệt | Proposed option additions | ✓ |
| Ai cũng thêm trực tiếp được | Open option injection | |

**User's choice:** Members can propose new options, leader approves them.
**Notes:** Keeps the vote curated without blocking collaboration.

| Option | Description | Selected |
|--------|-------------|----------|
| Cho tham gia luôn từ thời điểm được duyệt | Mid-session join | ✓ |
| Chỉ áp dụng cho vòng vote mới | Next-round only | |
| Leader chọn mỗi lần | Per-instance rule | |

**User's choice:** Approved options join the active vote immediately.
**Notes:** Existing votes are not rewritten; members may re-vote before deadline.

## Template Cloning

| Option | Description | Selected |
|--------|-------------|----------|
| Clone toàn bộ thành bản riêng hoàn toàn | Fully separate copy | ✓ |
| Clone xong vẫn giữ liên kết với template gốc | Linked template | |
| Cho chọn clone toàn bộ hoặc một phần | Partial clone options | |

**User's choice:** Use a fully separate clone.
**Notes:** No live sync back to the source template.

| Option | Description | Selected |
|--------|-------------|----------|
| Chỉ copy timeline và địa điểm | Minimal copy | |
| Copy timeline, địa điểm, ghi chú | Useful planning content | ✓ |
| Copy mọi thứ kể cả voting/history | Full history clone | |

**User's choice:** Copy timeline, locations, and notes.
**Notes:** Workflow state like active votes and proposal history should not be copied.

| Option | Description | Selected |
|--------|-------------|----------|
| Giữ cấu trúc ngày tương đối | Remap Day 1, Day 2 to new trip dates | ✓ |
| Giữ nguyên ngày tháng tuyệt đối | Keep original dates | |
| Clone xong để leader tự gán lại từng ngày | Manual remap | |

**User's choice:** Preserve relative day structure and remap to the new trip.
**Notes:** Makes templates reusable across different trip dates.

| Option | Description | Selected |
|--------|-------------|----------|
| Chỉ leader của trip | Leader-only template publishing | ✓ |
| Bất kỳ thành viên nào cũng đề xuất, leader duyệt | Proposed publishing | |
| Ai cũng tạo được nếu là member | Open publishing | |

**User's choice:** Only the leader can publish a community template.
**Notes:** Preserves clear ownership and authority.

| Option | Description | Selected |
|--------|-------------|----------|
| Tự động bỏ dữ liệu cá nhân | Automatic privacy stripping | ✓ |
| Leader tự chọn từng phần giữ/bỏ | Manual privacy control | |
| Giữ nguyên mọi thứ | No filtering | |

**User's choice:** Automatically strip personal data on publish.
**Notes:** Prioritizes safety and consistency.

## the agent's Discretion

- Final visual treatment for timeline progress-state highlighting.
- Exact CTA copy and iconography for empty day states.
- Exact moderation UI for proposals and vote option approval.
- Exact desktop fallback interaction for swipe-first voting.

## Deferred Ideas

None — the discussion remained within Phase 2 scope.
