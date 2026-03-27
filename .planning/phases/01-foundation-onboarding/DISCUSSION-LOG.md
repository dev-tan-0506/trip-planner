# Discuss Phase 1: Audit Log
*Date: 2026-03-28*

**Area 1: Kiến trúc Backend & Database**
- Q: Có backend hay không? Supabase BaaS vs Next.js API vs NestJS tách riêng?
- A: NestJS và REST API. Lựa chọn dài hạn tốt nhất để scale lên App Mobile vòng sau.
- Q: Lựa chọn Database (PostgreSQL vs MongoDB vs Firebase)?
- A: Agent phân tích và đề xuất PostgreSQL + Prisma vì ứng dụng dính tới giao dịch tài chính (chia tiền Group Fund) đòi hỏi tính ACID. User đồng ý.

**Area 2: Chiến lược Đăng nhập (Auth)**
- Q: Dùng Email/Password truyền thống hay Magic Link?
- A: Kết hợp cả hai để bao trọn mọi tệp người dùng (người lớn thích password, GenZ thích social/link).

**Area 3: Luồng Khách Vãng Lai (Guest Join)**
- Q: Chặn link bắt đăng nhập ngay (Sát phạt) hay Mở xem lịch trình trước (Hờ hững)?
- A: Mở xem lịch trình trước. Chỉ bắt đăng nhập (Gatekeeping) khi thực hiện hành động Write/Tương tác (Vote món ăn, vào phòng). Tăng tối đa tính Virality.

**Area 4: Định hướng Thẩm mỹ (UI/UX)**
- Q: Minimalist (tối giản/sang trọng) hay Vibrant/Playful (sống động/màu sắc)?
- A: Vibrant/Playful. Hướng tới phong cách GenZ năng động (Duolingo, Tinder) cho chuyến đi chơi thêm vui vẻ.
