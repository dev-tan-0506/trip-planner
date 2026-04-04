import Link from "next/link";
import { ArrowRight, LogIn } from "lucide-react";
import {
  getLandingPrimaryHref,
  getLandingSecondaryHref,
} from "./public-entry-cta";
import { PublicEntryBrand } from "./public-entry-brand";

type ModeProps = "landing" | "auth";

interface PublicEntryNavProps {
  isAuthenticated: boolean;
  mode?: ModeProps;
}

const landingLinks = [
  { href: "#kham-pha", label: "Khám phá" },
  { href: "#len-lich", label: "Lên lịch" },
  { href: "#nhom-di", label: "Nhóm đi" },
  { href: "#cong-dong", label: "Cộng đồng" },
];

function renderLandingNav(mode: ModeProps = "landing") {
  if (mode !== "landing") return null;

  return (
    <nav className="hidden items-center gap-7 md:flex">
      {landingLinks.map((item) => (
        <a
          key={item.href}
          href={item.href}
          className="pe-nav-link"
        >
          {item.label}
        </a>
      ))}
    </nav>
  );
}

export function PublicEntryNav({
  isAuthenticated,
  mode = "landing",
}: PublicEntryNavProps) {
  const primaryHref = getLandingPrimaryHref(isAuthenticated);
  const secondaryHref = getLandingSecondaryHref(isAuthenticated);

  return (
    <header className="sticky top-4 z-30">
      <div className="pe-nav-bar">
        <PublicEntryBrand compact />

        {renderLandingNav(mode)}

        <div className="flex items-center gap-2 md:gap-3">
          <Link
            href={secondaryHref}
            className="pe-btn-secondary"
          >
            {isAuthenticated ? "Vào dashboard" : "Tạo tài khoản"}
          </Link>
          <Link
            href={primaryHref}
            className="pe-btn-primary"
          >
            {isAuthenticated ? "Mở chuyến đi" : "Đăng nhập"}
            {isAuthenticated ? <ArrowRight size={16} /> : <LogIn size={16} />}
          </Link>
        </div>
      </div>
    </header>
  );
}
