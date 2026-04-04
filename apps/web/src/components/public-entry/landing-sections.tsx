import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CloudSun,
  HeartHandshake,
  MapPinned,
  ShieldAlert,
  Sparkles,
  WalletCards,
} from "lucide-react";

interface LandingSectionsProps {
  isAuthenticated: boolean;
  primaryHref: "/dashboard" | "/auth/login";
  secondaryHref: "/dashboard" | "/auth/register";
}

const featureCards = [
  {
    icon: <Sparkles size={28} strokeWidth={2.3} />,
    title: "Lên lịch mlem",
    body: "AI tự kéo mood, lên shortlist và gom lịch trình cho cả hội trong một flow đỡ drama hơn hẳn.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBeS_Bm9w7jk0RjQhcF7RweA-_it0aox_yVClz4NsRkcHgF7hTYQsyj-pdnxU3OkoCAZsF8blWm-JH1ETn0avVUfdousfsYMUveXnL5ChbyFezx1TCIZL54Bb7kzWcejoV1TBRrSc-LsgAMM5Ifr5RRC2_gE6rUrw_ryqnsBJU5Lgy2ZXBg9U5iQollMCflZ8wX4ffNHqGazvMJxFuP-8DW3MmlJS9F6vwyIV4H7pKP0qeqkJvqEm3xeTmclaSYB-R_jDGYf_DkuBbT",
    tone: "bg-[rgba(169,48,0,0.12)] text-[var(--accent-primary)]",
    offset: "",
    rotate: "-rotate-2",
  },
  {
    icon: <WalletCards size={28} strokeWidth={2.3} />,
    title: "Quỹ nhóm chốt đơn",
    body: "Góp quỹ, giữ quỹ, đã chi gì đều nằm một chỗ nên chuyến đi bớt cảnh nhắc nhau từng khoản nhỏ.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCpkO2NCeBUUuyuTKOXJWhfJF7tLK8qOmAii5T-DKwtLhms3GKV6wNe0Xtac5O1MWORyU1p1Eqaadq7ewIXYTVeJKV6B9GrDFaL8B9xCzTzrStEhSodl0nbpPe1ATp2G3oLz2mfkiT2tAC38ZszGkO90oUnZCZwq4SkP4rKSMZbh9-oDZWYeyJ5RNpvxA-1M2z_oEJ_TmWTu2qI3FJFGVtAeZNS03KzZpfuCeASjnxIOXbNLRjhzfiwPH85buhO_tWue_mp0TnSijKj",
    tone: "bg-[rgba(0,106,51,0.12)] text-[var(--status-success)]",
    offset: "md:translate-y-10",
    rotate: "rotate-2",
  },
  {
    icon: <HeartHandshake size={28} strokeWidth={2.3} />,
    title: "Quẹt chọn kèo thơm",
    body: "Địa điểm, món ăn, hoạt động đều có thể chốt theo mood chung thay vì tranh luận vô tận trong group chat.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCpo-PG-d_PUgDsGlhWENYSAdNqP18gVAuLLNn52dIk81vsb3K5j3SQisWsvF5bvhI5JNJw3P5_JMUbBQ9doIIxFltB4e43fzLQwS7UqFReSeuPSKZKCFyIQM_2mxpCulGA7NiwGdi60wM2RXgJQszlgFW7D5antz5flu4ZUuASqH1pO0jnhmVYT-7CJePcAKx-qJydqlV7ZIUHSyrx_W0lK894mcngLGBy-4RCTpT2kFYPMqGnDUta143rIeAUWbwlQmMafUhQXAP2",
    tone: "bg-[rgba(90,59,221,0.14)] text-[var(--status-discovery)]",
    offset: "",
    rotate: "-rotate-1",
  },
];

const communityImages = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDqfMzIIEucrYD8Y5Bx5m60wb8_4TMdk19QoYluAryAeFYuExQMSnFTcN-6JN-MqW5HI1zCVRsmMBhzixRCZ2dXl4L4pp0RAEZRotTqImad8b4YoElUieWJQkUIvuy6R4iingyh8w7wE2o2ileGM74uUwZoQYgybIJCbIa36rOF3d8OUrYYA8n7ZPc3ElntypAquizJR89ibgKhuo35g6PQIK164w9q3UBS0k4DWDQ8OI7O9wh6j9snbEYHoMbK_Sf6fCYWKU5Sq1x0",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAYZu7bTF29qR10-ndoq2cLCuECXvgwdkuCG3vsd8kQnfSj90cAarZvklCdpArYvXKo5lDfRYHeXRuIsgxT8hFubPqa00KAE9LYiRXgzYK0AMSZ6YSqEanhFQeereSTSt7ZvVrivxOh42nmhQEaiCRLiraqpiX2IvWw5G3QtBvfbC6HzhKoAn9cLROC2IGWLCdkD0f1Kzzc8P4RLOmiH8l7p2KT0cI6E2r38m0NhoTQ4j0p9bjHNnoqJWOJyM4Q71KjnrR1H05rL03i",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCRrzB6xSH0sARB3xwzkGLe_K3lzlD2IbJVVag1u5UFBXgpOQX16CqTIzrHsEAHsmjK2rLGgnhF3Yj-2jdOnsBYi96oE8X0Ov4alzlykCJ7KXIP0EfCb9tsw8_uKhkY44EFcdQicrCgmDlnwCmpqLoWUH2qzpHddsVA6D8OCK9eISJ_Cpe5ozqa9phz8rPWLoG3Fs7yfYD673BFbiU_zh-Q4cNPP6N5m0p8mr956HxSz0hL_sPanCRAKGDkldOjk08YsbWQLGJs_6YA",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBh1jj5QtxKj5TqqJqHbGCqRZEqulIedicrt0eErYELlN70A8APU5D2EY6M-dMNSsDglp5OdIAEs_4qeia0KWWuKdNNFH9ySJ7Yklorn-U_q8m2AqPH2Ob2hZIViTcUNG4A8OglA6-7o2c3mkFFnI192CJolFb9G1e956J1S0rjzPR0PgZL9JqoXhnv33IZPOL0YwovmlMl9WAcAqlwLHKHh9YphV_HnegFJFumJpNpI3aXI9NRC75LkzcnzCFha3Jo7qnSaFC31Yg2",
];

export function LandingSections({
  isAuthenticated,
  primaryHref,
  secondaryHref,
}: LandingSectionsProps) {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-20 px-4 md:px-6">
      <section id="len-lich" className="pt-6 md:pt-10">
        <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="pe-section-label text-[var(--status-discovery)]">
              Tính năng bao cháy
            </p>
            <h2 className="mt-3 font-[900] italic tracking-[-0.06em] text-[clamp(2.2rem,5vw,4rem)] leading-[1.1] text-[var(--text-primary)]">
              Dẹp bỏ drama, quẩy thả ga!
            </h2>
          </div>
          <p className="max-w-md text-[var(--text-muted)]">
            Dùng app là hết cảnh sao cũng được. Chỉ còn quyết định rõ ràng, lịch
            trình chung và một nhóm đi cùng mood.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {featureCards.map((card) => (
            <div
              key={card.title}
              className={`pe-feature-card ${card.offset}`}
            >
              <div
                className={`pe-feature-card-icon ${card.tone}`}
              >
                {card.icon}
              </div>
              <h3 className="text-[1.75rem] font-[900] leading-[1.14] tracking-[-0.04em] text-[var(--text-primary)]">
                {card.title}
              </h3>
              <p className="mt-4 leading-7 text-[var(--text-muted)]">
                {card.body}
              </p>
              <div className="mt-8 overflow-hidden rounded-[1.35rem]">
                <Image
                  src={card.image}
                  alt={card.title}
                  width={600}
                  height={224}
                  className={`h-56 w-full object-cover transition-transform duration-500 hover:rotate-0 ${card.rotate}`}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section
        id="nhom-di"
        className="relative overflow-hidden rounded-[2.5rem] bg-[#101010] px-6 py-10 text-white md:px-10 md:py-14"
      >
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[rgba(169,48,0,0.24)] blur-[120px]" />
        <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-[rgba(90,59,221,0.18)] blur-[120px]" />

        <div className="relative z-10 grid gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] md:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[rgba(251,81,81,0.18)] px-4 py-2 text-xs font-[900] uppercase tracking-[0.2em] text-[#ffd6d1]">
              <ShieldAlert size={14} />
              Cảnh báo ét ô ét
            </div>
            <h2 className="mt-6 font-[900] tracking-[-0.06em] text-[clamp(2.2rem,5vw,4.4rem)] leading-[1.1] text-white">
              An toàn là trên hết{" "}
              <span className="text-[#fb5151]">(ét ô ét)</span>
            </h2>

            <ul className="mt-8 space-y-6">
              <li className="flex items-start gap-4">
                <div className="pe-safety-item-icon">
                  <CloudSun size={18} />
                </div>
                <div>
                  <h3 className="text-xl font-[800] text-white">
                    Dự báo thời tiết 24/7
                  </h3>
                  <p className="mt-1 text-white/70">
                    Tránh mưa, né bão và biết lúc nào nên đổi mood plan trước
                    khi cả nhóm phi tới nơi.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="pe-safety-item-icon">
                  <MapPinned size={18} />
                </div>
                <div>
                  <h3 className="text-xl font-[800] text-white">
                    Mật độ đám đông thực tế
                  </h3>
                  <p className="mt-1 text-white/70">
                    Biết chỗ nào đang quá tải để không biến một kèo vui thành
                    trải nghiệm chen chúc mệt mỏi.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="pe-safety-item-icon">
                  <HeartHandshake size={18} />
                </div>
                <div>
                  <h3 className="text-xl font-[800] text-white">
                    Nút SOS cho hội bạn
                  </h3>
                  <p className="mt-1 text-white/70">
                    Khi có chuyện, việc báo vị trí và tình huống cho cả nhóm
                    phải nhanh hơn việc lục từng tin nhắn.
                  </p>
                </div>
              </li>
            </ul>
          </div>

          <div className="rounded-[2rem] border border-white/12 bg-white/8 p-5 shadow-[0_24px_48px_-16px_rgba(0,0,0,0.28)] backdrop-blur-[12px]">
            <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#151515]">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBh1jj5QtxKj5TqqJqHbGCqRZEqulIedicrt0eErYELlN70A8APU5D2EY6M-dMNSsDglp5OdIAEs_4qeia0KWWuKdNNFH9ySJ7Yklorn-U_q8m2AqPH2Ob2hZIViTcUNG4A8OglA6-7o2c3mkFFnI192CJolFb9G1e956J1S0rjzPR0PgZL9JqoXhnv33IZPOL0YwovmlMl9WAcAqlwLHKHh9YphV_HnegFJFumJpNpI3aXI9NRC75LkzcnzCFha3Jo7qnSaFC31Yg2"
                alt="Safety panel visual"
                width={600}
                height={340}
                className="h-[340px] w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section id="cong-dong" className="pb-2">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="pe-section-label text-[var(--accent-primary)]">
              Cộng đồng đi chung mood
            </p>
            <h2 className="mt-3 font-[900] tracking-[-0.06em] text-[clamp(2rem,4.8vw,3.8rem)] leading-[1.1] text-[var(--text-primary)]">
              Đi là phải có vibe, có nhóm và có ảnh để nhớ.
            </h2>
          </div>
          <p className="max-w-md text-[var(--text-muted)]">
            Landing vẫn phải cho thấy không khí của sản phẩm: trẻ, có sức sống,
            có hình ảnh thật chứ không chỉ là vài khối card mô tả tính năng.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3 md:grid-rows-2">
          <div className="overflow-hidden rounded-[2rem] md:row-span-2">
            <Image
              src={communityImages[0]!}
              alt="Community gallery 1"
              width={400}
              height={420}
              className="pe-gallery-image h-full min-h-[420px]"
            />
          </div>
          <div className="overflow-hidden rounded-[2rem]">
            <Image
              src={communityImages[1]!}
              alt="Community gallery 2"
              width={400}
              height={220}
              className="pe-gallery-image h-[220px]"
            />
          </div>
          <div className="overflow-hidden rounded-[2rem]">
            <Image
              src={communityImages[2]!}
              alt="Community gallery 3"
              width={400}
              height={220}
              className="pe-gallery-image h-[220px]"
            />
          </div>
          <div className="overflow-hidden rounded-[2rem] md:col-span-2">
            <Image
              src={communityImages[3]!}
              alt="Community gallery 4"
              width={800}
              height={220}
              className="pe-gallery-image h-[220px]"
            />
          </div>
        </div>
      </section>

      <section
        id="bat-dau"
        className="rounded-[2.5rem] bg-white px-6 py-10 shadow-[0_24px_48px_-14px_rgba(47,46,46,0.12)] md:px-10 md:py-12"
      >
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="pe-section-label text-[var(--status-discovery)]">
              Đi tiếp luôn
            </p>
            <h2 className="mt-4 font-[900] tracking-[-0.06em] text-[clamp(2rem,5vw,3.7rem)] leading-[1.12] text-[var(--text-primary)]">
              {isAuthenticated
                ? "Dashboard đang chờ bạn quay lại."
                : "Đủ vibe rồi, giờ vào app thôi."}
            </h2>
            <p className="mt-4 leading-7 text-[var(--text-muted)]">
              {isAuthenticated
                ? "Với người đã đăng nhập, CTA chính phải đưa thẳng về dashboard. Không bắt họ đi vòng qua một landing đẹp nhưng vô nghĩa."
                : "Với người chưa đăng nhập, hướng đi vẫn cực rõ: đăng nhập nếu đã có tài khoản hoặc tạo tài khoản để bắt đầu một kèo mới."}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href={primaryHref}
              className="pe-btn-cta-primary"
            >
              {isAuthenticated ? "Mở dashboard" : "Đăng nhập để chốt kèo"}
              <ArrowRight size={20} />
            </Link>
            <Link
              href={secondaryHref}
              className="pe-btn-cta-secondary border border-black/10 bg-[var(--surface-section)] hover:bg-[rgba(169,48,0,0.06)]"
            >
              {isAuthenticated ? "Xem lại workspace" : "Tạo tài khoản"}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
