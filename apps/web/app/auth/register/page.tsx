'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Loader2, Mail, Lock, User, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../../src/store/useAuthStore';
import { authApi } from '../../../src/lib/api-client';
import Link from 'next/link';

const registerSchema = z.object({
  name: z.string().min(2, { message: "TÃªn Ã­t nháº¥t 2 kÃ½ tá»±" }),
  email: z.string().email({ message: "Email khÃ´ng há»£p lá»‡" }),
  password: z.string().min(6, { message: "Máº­t kháº©u Ã­t nháº¥t 6 kÃ½ tá»±" }),
});

type RegisterForm = z.infer<typeof registerSchema>;

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export default function RegisterPage() {
  const router = useRouter();
  const checkAuth = useAuthStore((state) => state.checkAuth);
  
  const [globalError, setGlobalError] = useState<string | null>(null);
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      setGlobalError(null);
      await authApi.register(data.email, data.password, data.name);
      await checkAuth();
      router.push('/');
    } catch (error: unknown) {
      setGlobalError(getErrorMessage(error, 'ÄÄƒng kÃ½ tháº¥t báº¡i. Vui lÃ²ng thá»­ láº¡i.'));
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
          className="inline-block p-3 rounded-2xl bg-brand-yellow/20 text-brand-yellow mb-4"
        >
          <User size={32} />
        </motion.div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Tham gia ngay!
        </h1>
        <p className="text-gray-400 mt-2 text-sm">
          Táº¡o tÃ i khoáº£n MÃ¬nh Äi ÄÃ¢u Tháº¿ cá»±c nhanh.
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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5 ml-1">Há» TÃªn</label>
          <div className="relative group">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-brand-yellow transition-colors" />
            <input
              {...register('name')}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-yellow/50 transition-all"
              placeholder="Nguyá»…n VÄƒn A"
            />
          </div>
          {errors.name && <p className="text-red-400 text-xs mt-1.5 ml-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5 ml-1">Email</label>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-brand-yellow transition-colors" />
            <input
              {...register('email')}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-yellow/50 transition-all"
              placeholder="bancua@nhau.com"
            />
          </div>
          {errors.email && <p className="text-red-400 text-xs mt-1.5 ml-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5 ml-1">Máº­t kháº©u</label>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-brand-yellow transition-colors" />
            <input
              {...register('password')}
              type="password"
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-yellow/50 transition-all"
              placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
            />
          </div>
          {errors.password && <p className="text-red-400 text-xs mt-1.5 ml-1">{errors.password.message}</p>}
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-brand-yellow hover:bg-brand-yellow/90 text-brand-dark font-extrabold py-4 rounded-2xl flex items-center justify-center transition-colors disabled:opacity-50 mt-6"
        >
          {isSubmitting ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <>
              Táº¡o TÃ i Khoáº£n <ArrowRight className="w-5 h-5 ml-2" />
            </>
          )}
        </motion.button>
      </form>

      <div className="mt-8 text-center text-sm text-gray-400">
        ÄÃ£ cÃ³ tÃ i khoáº£n?{' '}
        <Link href="/auth/login" className="text-brand-coral hover:text-brand-coral/80 font-semibold transition-colors">
          ÄÄƒng nháº­p
        </Link>
      </div>
    </motion.div>
  );
}
