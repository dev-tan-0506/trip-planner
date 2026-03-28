'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Loader2, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../../src/store/useAuthStore';
import { authApi } from '../../../src/lib/api-client';
import Link from 'next/link';

const loginSchema = z.object({
  email: z.string().email({ message: "Email không hợp lệ" }),
  password: z.string().min(6, { message: "Mật khẩu ít nhất 6 ký tự" }),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const setIsHydrated = useAuthStore((state) => state.setHydrated);
  const checkAuth = useAuthStore((state) => state.checkAuth);
  
  const [globalError, setGlobalError] = useState<string | null>(null);
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      setGlobalError(null);
      await authApi.login(data.email, data.password);
      // Wait for auth string/tokens to be set, then populate zustand
      await checkAuth();
      router.push('/');
    } catch (err: any) {
      setGlobalError(err.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-dark rounded-3xl p-8 shadow-2xl border border-white/10"
    >
      <div className="text-center mb-8">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="inline-block p-3 rounded-2xl bg-brand-coral/20 text-brand-coral mb-4"
        >
          <Lock size={32} />
        </motion.div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Chào mừng trở lại!
        </h1>
        <p className="text-gray-400 mt-2 text-sm">
          Đăng nhập để tiếp tục lên những kèo đi chơi tuyệt vời.
        </p>
      </div>

      <AnimatePresence>
        {globalError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start text-red-400 text-sm"
          >
            <AlertCircle className="w-5 h-5 mr-3 shrink-0" />
            <p>{globalError}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5 ml-1">Email</label>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-brand-coral transition-colors" />
            <input
              {...register('email')}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-coral/50 transition-all"
              placeholder="bancua@nhau.com"
            />
          </div>
          {errors.email && <p className="text-red-400 text-xs mt-1.5 ml-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5 ml-1">Mật khẩu</label>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-brand-coral transition-colors" />
            <input
              {...register('password')}
              type="password"
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-coral/50 transition-all"
              placeholder="••••••••"
            />
          </div>
          {errors.password && <p className="text-red-400 text-xs mt-1.5 ml-1">{errors.password.message}</p>}
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-brand-coral hover:bg-brand-coral/90 text-white font-bold py-4 rounded-2xl flex items-center justify-center transition-colors disabled:opacity-50 mt-4"
        >
          {isSubmitting ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <>
              Đăng Nhập <ArrowRight className="w-5 h-5 ml-2" />
            </>
          )}
        </motion.button>
      </form>

      <div className="mt-8 text-center text-sm text-gray-400">
        Chưa có tài khoản?{' '}
        <Link href="/auth/register" className="text-brand-yellow hover:text-brand-yellow/80 font-semibold transition-colors">
          Tạo tài khoản ngay
        </Link>
      </div>
    </motion.div>
  );
}
