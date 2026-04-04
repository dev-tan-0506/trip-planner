import type { ReactNode } from "react";
import { Rocket, UserPlus } from "lucide-react";

interface AuthPageShellProps {
  mode: "login" | "register";
  title: string;
  description?: string;
  footer: ReactNode;
  children: ReactNode;
}

const accentMap = {
  login: {
    icon: Rocket,
    label: "Chốt đơn đi quẩy thôi!",
  },
  register: {
    icon: UserPlus,
    label: "Điền sương sương mấy cái này nha bạn iu!",
  },
} as const;

function SocialButton({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <button
      type="button"
      className={`pe-social-btn ${className ?? ""}`}
    >
      {children}
    </button>
  );
}

export function AuthPageShell({ mode, title, description, footer, children }: AuthPageShellProps) {
  const accent = accentMap[mode];
  const AccentIcon = accent.icon;

  return (
    <div className="pe-auth-screen">
      <div className="pe-auth-card">
        <div className="mb-6 text-center">
          <div className="pe-auth-accent-icon">
            <AccentIcon size={30} strokeWidth={2.4} />
          </div>
          <h1 className="mt-4 font-[900] uppercase tracking-[-0.05em] text-[clamp(1.7rem,4vw,2.2rem)] leading-[1.08] text-[var(--text-primary)]">
            Mình Đi Đâu Thế?
          </h1>
          <p className="mt-2 font-[900] text-[1rem] tracking-[-0.02em] text-[var(--accent-primary)]">{accent.label}</p>
          {description ? <p className="mx-auto mt-3 max-w-sm text-[13px] leading-5 text-[var(--text-muted)]">{description}</p> : null}
        </div>

        <div className="mb-6 grid gap-3">
          <SocialButton className="border border-neutral-200 bg-white text-neutral-800 shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:bg-neutral-50 hover:shadow-[0_8px_20px_rgba(0,0,0,0.08)]">
            <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            <span>Google lun đi!</span>
          </SocialButton>
          <SocialButton className="bg-[#1877F2] text-white shadow-[0_12px_24px_rgba(24,119,242,0.2)] hover:-translate-y-[1px] hover:bg-[#166fe5]">
            <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M24 12.073c0-6.627-5.373-12-12-12S0 5.446 0 12.073c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            <span>Facebook nè</span>
          </SocialButton>
        </div>

        <div className="mb-6 flex items-center gap-3">
          <div className="pe-divider" />
          <span className="text-[10px] font-[900] uppercase tracking-[0.22em] text-neutral-500">Hoặc dùng email</span>
          <div className="pe-divider" />
        </div>

        <div>
          <div className="mb-3 text-center">
            <h2 className="text-[1.45rem] font-[900] leading-[1.12] tracking-[-0.03em] text-[var(--text-primary)]">{title}</h2>
          </div>
          {children}
        </div>

        <div className="mt-6 text-center text-sm font-[700] text-neutral-700">{footer}</div>
      </div>

      <footer className="mt-4 flex flex-col items-center gap-3 text-center text-neutral-700">
        <p className="text-[10px] font-[900] uppercase tracking-[0.22em]">© 2024 Mình Đi Đâu Thế? • Một sản phẩm cực chill</p>
      </footer>
    </div>
  );
}
