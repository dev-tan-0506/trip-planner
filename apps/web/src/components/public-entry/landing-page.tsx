import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { LandingSections } from "./landing-sections";
import { getLandingPrimaryHref, getLandingSecondaryHref } from "./public-entry-cta";
import { PublicEntryNav } from "./public-entry-nav";

interface LandingPageProps {
  isAuthenticated: boolean;
  userName?: string | null;
}

const heroImage =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBh1jj5QtxKj5TqqJqHbGCqRZEqulIedicrt0eErYELlN70A8APU5D2EY6M-dMNSsDglp5OdIAEs_4qeia0KWWuKdNNFH9ySJ7Yklorn-U_q8m2AqPH2Ob2hZIViTcUNG4A8OglA6-7o2c3mkFFnI192CJolFb9G1e956J1S0rjzPR0PgZL9JqoXhnv33IZPOL0YwovmlMl9WAcAqlwLHKHh9YphV_HnegFJFumJpNpI3aXI9NRC75LkzcnzCFha3Jo7qnSaFC31Yg2";

export function LandingPage({ isAuthenticated, userName }: LandingPageProps) {
  const primaryHref = getLandingPrimaryHref(isAuthenticated);
  const secondaryHref = getLandingSecondaryHref(isAuthenticated);

  return (
    <div className="surface-app min-h-screen overflow-x-hidden">
      <div className="fixed inset-x-0 top-0 z-30 px-4 pt-4 md:px-6">
        <PublicEntryNav isAuthenticated={isAuthenticated} mode="landing" />
      </div>

      <main className="pb-20">
        <section id="kham-pha" className="relative flex min-h-[780px] items-center justify-center overflow-hidden px-4 pt-28 md:px-6 md:pt-32">
          <div className="absolute inset-0">
            <Image src={heroImage} alt="Vietnam travel hero" fill priority className="object-cover" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(249,246,245,0.08),rgba(249,246,245,0.2),rgba(249,246,245,0.95))]" />
          </div>

          <div className="relative z-10 mx-auto flex w-full max-w-5xl justify-center">
            <div className="w-full rounded-[2.6rem] border border-white/35 bg-[rgba(255,255,255,0.7)] px-6 py-8 text-center shadow-[0_32px_64px_-12px_rgba(47,46,46,0.18)] backdrop-blur-[22px] md:px-12 md:py-14">
              <p className="mb-4 text-sm font-[900] uppercase tracking-[0.24em] text-[var(--accent-primary)]">
                {isAuthenticated ? `Chào mừng quay lại, ${userName ?? "bạn mình"}` : "Mình Đi Đâu Thế?"}
              </p>
              <h1 className="font-[900] leading-[1.1] tracking-[-0.07em] text-[clamp(2.6rem,7vw,5.6rem)] text-[var(--text-primary)]">
                CHỐT KÈO ĐI QUẨY,
                <span className="block italic text-[var(--accent-primary)]">KHÔNG ĐỂ AI LẠI PHÍA SAU!</span>
              </h1>
              <p className="mx-auto mt-6 max-w-3xl text-[1rem] leading-7 text-[var(--text-muted)] md:text-[1.15rem]">
                {isAuthenticated
                  ? "Dashboard, lịch trình và workspace của nhóm đang đợi bạn quay lại. CTA chính vẫn đưa thẳng về nơi làm việc để không làm lỡ nhịp chuyến đi."
                  : "App lên lịch trình, gom quỹ nhóm và chốt địa điểm cực cháy dành cho hội bạn thân. Tạm biệt cảnh để mai tính, giờ là chốt đơn rồi đi thôi."}
              </p>

              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  href={primaryHref}
                  className="pe-btn-cta-primary"
                >
                  {isAuthenticated ? "Vào dashboard" : "Đăng nhập"}
                  <ArrowRight size={20} />
                </Link>
                <Link
                  href={secondaryHref}
                  className="pe-btn-cta-secondary"
                >
                  {isAuthenticated ? "Tiếp tục chuyến đi" : "Tạo tài khoản"}
                </Link>
              </div>
            </div>
          </div>
        </section>

        <LandingSections
          isAuthenticated={isAuthenticated}
          primaryHref={primaryHref}
          secondaryHref={secondaryHref}
        />
      </main>
    </div>
  );
}




