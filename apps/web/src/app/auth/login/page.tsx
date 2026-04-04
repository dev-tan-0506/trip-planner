'use client';

import Link from "next/link";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@repo/ui/components";
import { AlertCircle, ArrowRight, Lock, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { AuthPageShell } from "../../../components/public-entry/auth-page-shell";
import { authApi } from "../../../lib/api-client";
import { useAuthStore } from "../../../store/useAuthStore";

const loginSchema = z.object({
  email: z.string().email({ message: "Email không hợp lệ" }),
  password: z.string().min(6, { message: "Mật khẩu ít nhất 6 ký tự" }),
});

type LoginForm = z.infer<typeof loginSchema>;

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export default function LoginPage() {
  const router = useRouter();
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      setGlobalError(null);
      await authApi.login(data.email, data.password);
      await checkAuth();
      router.push("/");
    } catch (error: unknown) {
      setGlobalError(getErrorMessage(error, "Đăng nhập thất bại. Vui lòng thử lại."));
    }
  };

  return (
    <AuthPageShell
      mode="login"
      title="Đăng nhập"
      footer={
        <span>
          Chưa có tài khoản?{" "}
          <Link href="/auth/register" className="font-[900] text-[var(--accent-primary)] hover:underline">
            Đăng ký ngay
          </Link>
        </span>
      }
    >
      {globalError ? (
        <div className="mb-4 flex items-start gap-3 rounded-[1.25rem] bg-[rgba(179,27,37,0.1)] px-4 py-3 text-sm text-[var(--status-destructive)]">
          <AlertCircle size={18} className="mt-[2px] shrink-0" />
          <p>{globalError}</p>
        </div>
      ) : null}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          id="login-email"
          type="email"
          label="Email"
          placeholder="Email của bạn nè..."
          leadingIcon={<Mail size={18} />}
          variant="auth"
          errorText={errors.email?.message}
          wrapperClassName="gap-2.5"
          className="py-1"
          {...register("email")}
        />
        <Input
          id="login-password"
          type="password"
          label="Mật khẩu"
          placeholder="Mật khẩu bí mật..."
          leadingIcon={<Lock size={18} />}
          variant="auth"
          errorText={errors.password?.message}
          wrapperClassName="gap-2.5"
          className="py-1"
          {...register("password")}
        />

        <div className="flex items-center justify-between pt-1 text-sm font-[700] text-neutral-600">
          <label className="flex items-center gap-2.5">
            <input type="checkbox" className="h-5 w-5 rounded-md border-neutral-200 text-[var(--accent-primary)]" />
            <span>Nhớ mặt tui nha</span>
          </label>
          <span className="font-[800] text-[var(--accent-primary)]">Quên mật khẩu?</span>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex min-h-[60px] w-full items-center justify-center gap-3 rounded-full bg-[var(--accent-primary)] px-8 text-lg font-[900] tracking-[-0.03em] text-white transition-all hover:-translate-y-[1px] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none whitespace-nowrap"
        >
          <span>{isSubmitting ? "Đang vào..." : "Đăng nhập"}</span>
          {!isSubmitting ? <ArrowRight size={20} /> : null}
        </button>
      </form>
    </AuthPageShell>
  );
}
