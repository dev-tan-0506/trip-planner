'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../../store/useAuthStore';
import { tripsApi } from '../../lib/api-client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Calendar,
  Plus,
  Compass,
  LogOut,
  Sparkles,
  ArrowLeft,
  Copy,
  Check,
  Plane,
} from 'lucide-react';
import Link from 'next/link';

interface CreateTripForm {
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isHydrated, logout } = useAuthStore();
  const [showForm, setShowForm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createdJoinCode, setCreatedJoinCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateTripForm>();

  if (!isHydrated) return null;

  // Redirect unauthenticated users
  if (!user) {
    router.push('/auth/login');
    return null;
  }

  const onSubmit = async (data: CreateTripForm) => {
    setIsCreating(true);
    setError(null);
    try {
      const trip = await tripsApi.create({
        name: data.name,
        destination: data.destination,
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
      });
      setCreatedJoinCode(trip.joinCode);
      reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra, thử lại nhé!');
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopyLink = async () => {
    if (!createdJoinCode) return;
    const link = `${window.location.origin}/trip/${createdJoinCode}`;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGoToTrip = () => {
    if (createdJoinCode) {
      router.push(`/trip/${createdJoinCode}`);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-light via-white to-brand-yellow/10">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-gray-200/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="p-2 bg-brand-yellow/20 rounded-xl group-hover:bg-brand-yellow/30 transition-colors">
              <Compass size={24} className="text-brand-yellow" />
            </div>
            <span className="font-black text-xl text-gray-900 hidden sm:inline">
              Mình Đi Đâu Thế
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-gray-900">{user.name || 'Người lữ hành'}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-brand-coral to-brand-yellow rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-brand-coral/20">
              {(user.name || user.email).charAt(0).toUpperCase()}
            </div>
            <button
              onClick={() => logout()}
              className="p-2 text-gray-400 hover:text-brand-coral hover:bg-brand-coral/10 rounded-xl transition-all"
              title="Đăng xuất"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Welcome Banner */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="relative overflow-hidden bg-gradient-to-r from-brand-dark to-brand-dark/90 rounded-3xl p-8 text-white"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-coral/20 rounded-full filter blur-3xl" />
          <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-brand-yellow/10 rounded-full filter blur-2xl" />

          <div className="relative z-10">
            <h1 className="text-3xl sm:text-4xl font-black mb-2">
              Chào, {user.name || 'bạn'}! 🌴
            </h1>
            <p className="text-white/70 text-lg">
              Sẵn sàng cho chuyến đi tiếp theo chưa?
            </p>
          </div>
        </motion.div>

        {/* Create Trip Section */}
        <AnimatePresence mode="wait">
          {createdJoinCode ? (
            <motion.div
              key="success"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl shadow-xl shadow-brand-green/10 border border-brand-green/20 p-8 text-center space-y-6"
            >
              <div className="inline-flex items-center justify-center p-4 bg-brand-green/10 rounded-full">
                <Sparkles size={48} className="text-brand-green" />
              </div>

              <div>
                <h2 className="text-2xl font-black text-gray-900 mb-2">
                  Chuyến đi đã tạo thành công! 🎉
                </h2>
                <p className="text-gray-500">Gửi link bên dưới cho bạn bè để rủ đi nhé!</p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 flex items-center justify-between gap-3">
                <code className="text-sm text-brand-blue font-mono truncate">
                  {typeof window !== 'undefined'
                    ? `${window.location.origin}/trip/${createdJoinCode}`
                    : `/trip/${createdJoinCode}`}
                </code>
                <button
                  onClick={handleCopyLink}
                  className="flex-shrink-0 p-2 rounded-xl bg-brand-blue text-white hover:bg-brand-blue/80 transition-all active:scale-95"
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={handleGoToTrip}
                  className="px-6 py-3 bg-brand-coral hover:bg-brand-coral/90 text-white rounded-2xl font-bold shadow-lg shadow-brand-coral/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <Plane size={18} /> Xem chuyến đi
                </button>
                <button
                  onClick={() => {
                    setCreatedJoinCode(null);
                    setShowForm(false);
                  }}
                  className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl font-bold transition-all active:scale-95"
                >
                  Tạo chuyến đi khác
                </button>
              </div>
            </motion.div>
          ) : showForm ? (
            <motion.div
              key="form"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <button
                  onClick={() => setShowForm(false)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <ArrowLeft size={20} className="text-gray-500" />
                </button>
                <h2 className="text-2xl font-black text-gray-900">Tạo chuyến đi mới</h2>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-brand-coral/10 text-brand-coral rounded-2xl text-sm font-medium border border-brand-coral/20">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Trip Name */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Tên chuyến đi
                  </label>
                  <div className="relative">
                    <Sparkles
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      {...register('name', { required: 'Đặt tên cho chuyến đi đi nào!' })}
                      placeholder="VD: Đà Lạt Mộng Mơ ✨"
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-all text-gray-900 placeholder:text-gray-400"
                    />
                  </div>
                  {errors.name && (
                    <p className="mt-1.5 text-sm text-brand-coral">{errors.name.message}</p>
                  )}
                </div>

                {/* Destination */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Điểm đến</label>
                  <div className="relative">
                    <MapPin
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      {...register('destination', { required: 'Đi đâu thế bạn ơi?' })}
                      placeholder="VD: Đà Lạt, Lâm Đồng"
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-all text-gray-900 placeholder:text-gray-400"
                    />
                  </div>
                  {errors.destination && (
                    <p className="mt-1.5 text-sm text-brand-coral">{errors.destination.message}</p>
                  )}
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Ngày đi</label>
                    <div className="relative">
                      <Calendar
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type="date"
                        min={todayStr}
                        {...register('startDate', { required: 'Chọn ngày đi nhé!' })}
                        className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-all text-gray-900"
                      />
                    </div>
                    {errors.startDate && (
                      <p className="mt-1.5 text-sm text-brand-coral">{errors.startDate.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Ngày về</label>
                    <div className="relative">
                      <Calendar
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type="date"
                        min={todayStr}
                        {...register('endDate', { required: 'Chọn ngày về nhé!' })}
                        className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-all text-gray-900"
                      />
                    </div>
                    {errors.endDate && (
                      <p className="mt-1.5 text-sm text-brand-coral">{errors.endDate.message}</p>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isCreating}
                  className="w-full py-4 bg-gradient-to-r from-brand-coral to-brand-yellow text-white rounded-2xl font-black text-lg shadow-lg shadow-brand-coral/20 hover:shadow-xl hover:shadow-brand-coral/30 transition-all hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  {isCreating ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      Đang tạo...
                    </span>
                  ) : (
                    'Tạo chuyến đi 🚀'
                  )}
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.button
              key="cta"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              onClick={() => setShowForm(true)}
              className="w-full group relative overflow-hidden bg-white rounded-3xl shadow-lg shadow-gray-200/50 border-2 border-dashed border-gray-200 hover:border-brand-coral/40 p-10 transition-all hover:shadow-xl"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-brand-coral/5 to-brand-yellow/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex flex-col items-center gap-4">
                <div className="p-4 bg-brand-coral/10 rounded-full group-hover:bg-brand-coral/20 transition-colors group-hover:scale-110 transform duration-300">
                  <Plus size={32} className="text-brand-coral" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900 mb-1">Tạo chuyến đi mới</h3>
                  <p className="text-gray-500">Bắt đầu lắp kèo, rủ rê bạn bè thôi nào!</p>
                </div>
              </div>
            </motion.button>
          )}
        </AnimatePresence>

        {/* Template Library Link */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Link
            href="/templates"
            className="block w-full group relative overflow-hidden bg-white rounded-3xl shadow-sm border border-gray-100 hover:border-brand-green/40 p-6 transition-all hover:shadow-lg"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-brand-green/5 to-brand-blue/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative flex items-center gap-4">
              <div className="p-3 bg-brand-green/10 rounded-2xl group-hover:bg-brand-green/20 transition-colors">
                <Compass size={24} className="text-brand-green" />
              </div>
              <div>
                <h3 className="font-black text-gray-900">Khám phá mẫu hành trình 🌍</h3>
                <p className="text-sm text-gray-500">Clone hành trình từ cộng đồng, chỉnh sửa theo ý bạn!</p>
              </div>
            </div>
          </Link>
        </motion.div>
      </main>
    </div>
  );
}
