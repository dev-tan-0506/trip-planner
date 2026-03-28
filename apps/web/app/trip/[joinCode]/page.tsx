'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { tripsApi, Trip } from '../../../src/lib/api-client';
import { useAuthStore } from '../../../src/store/useAuthStore';
import { motion } from 'framer-motion';
import {
  MapPin,
  Calendar,
  Users,
  Crown,
  Compass,
  Share2,
  Copy,
  Check,
  UserPlus,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';

export default function TripPreviewPage() {
  const params = useParams();
  const joinCode = params.joinCode as string;
  const { user, isHydrated } = useAuthStore();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    async function fetchTrip() {
      try {
        const data = await tripsApi.getByJoinCode(joinCode);
        setTrip(data);

        // Check if current user already joined
        if (user) {
          const isMember = data.members.some((m) => m.user.id === user.id);
          setJoined(isMember);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Không tìm thấy chuyến đi');
      } finally {
        setLoading(false);
      }
    }
    fetchTrip();
  }, [joinCode, user]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJoin = async () => {
    if (!user) return;
    setJoining(true);
    try {
      await tripsApi.join(joinCode);
      setJoined(true);
      // Refresh trip data to show updated member list
      const updated = await tripsApi.getByJoinCode(joinCode);
      setTrip(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tham gia chuyến đi');
    } finally {
      setJoining(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      weekday: 'short',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getDayCount = (start: string, end: string) => {
    const diff = new Date(end).getTime() - new Date(start).getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
  };

  if (!isHydrated || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-light via-white to-brand-blue/5">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 size={40} className="text-brand-blue animate-spin" />
          <p className="text-gray-500 font-medium">Đang tải chuyến đi...</p>
        </motion.div>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-light via-white to-brand-coral/5 p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center space-y-4"
        >
          <div className="inline-flex items-center justify-center p-4 bg-brand-coral/10 rounded-full">
            <Compass size={40} className="text-brand-coral" />
          </div>
          <h1 className="text-2xl font-black text-gray-900">Oops! 😅</h1>
          <p className="text-gray-500">{error || 'Chuyến đi này không tồn tại hoặc link đã hết hạn.'}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-blue text-white rounded-2xl font-bold hover:bg-brand-blue/90 transition-all active:scale-95"
          >
            <ArrowLeft size={18} /> Về trang chủ
          </Link>
        </motion.div>
      </div>
    );
  }

  const leader = trip.members.find((m) => m.role === 'LEADER');
  const dayCount = getDayCount(trip.startDate, trip.endDate);

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-light via-white to-brand-blue/5">
      {/* Floating Background Shapes */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-20 w-72 h-72 bg-brand-yellow/10 rounded-full filter blur-3xl" />
        <div className="absolute top-40 -right-20 w-80 h-80 bg-brand-coral/10 rounded-full filter blur-3xl" />
        <div className="absolute -bottom-20 left-1/3 w-96 h-96 bg-brand-blue/5 rounded-full filter blur-3xl" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-gray-200/50">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="p-2 bg-brand-yellow/20 rounded-xl group-hover:bg-brand-yellow/30 transition-colors">
              <Compass size={22} className="text-brand-yellow" />
            </div>
            <span className="font-black text-lg text-gray-900 hidden sm:inline">
              Mình Đi Đâu Thế
            </span>
          </Link>

          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium text-sm transition-all active:scale-95"
          >
            {copied ? <Check size={16} className="text-brand-green" /> : <Share2 size={16} />}
            {copied ? 'Đã copy!' : 'Chia sẻ'}
          </button>
        </div>
      </header>

      <main className="relative z-10 max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Hero Card */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden bg-gradient-to-br from-brand-dark via-brand-dark/95 to-brand-dark/90 rounded-3xl p-8 text-white"
        >
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-brand-coral/20 rounded-full filter blur-3xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-brand-blue/20 rounded-full filter blur-2xl" />

          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full text-sm backdrop-blur-sm">
              <MapPin size={14} className="text-brand-coral" />
              <span className="text-white/80">{trip.destination}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black leading-tight">{trip.name}</h1>

            <div className="flex flex-wrap items-center gap-4 text-white/60 text-sm">
              <span className="flex items-center gap-1.5">
                <Calendar size={16} className="text-brand-yellow" />
                {dayCount} ngày
              </span>
              <span className="flex items-center gap-1.5">
                <Users size={16} className="text-brand-green" />
                {trip.members.length} thành viên
              </span>
              {leader && (
                <span className="flex items-center gap-1.5">
                  <Crown size={16} className="text-brand-yellow" />
                  {leader.user.name || 'Trưởng đoàn'}
                </span>
              )}
            </div>
          </div>
        </motion.div>

        {/* Trip Details */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 p-6 space-y-6"
        >
          <h2 className="text-lg font-black text-gray-900">📅 Lịch trình</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-brand-green/5 rounded-2xl p-4 border border-brand-green/10">
              <p className="text-xs font-bold text-brand-green uppercase tracking-wider mb-1">
                Ngày đi
              </p>
              <p className="text-lg font-bold text-gray-900">{formatDate(trip.startDate)}</p>
            </div>
            <div className="bg-brand-coral/5 rounded-2xl p-4 border border-brand-coral/10">
              <p className="text-xs font-bold text-brand-coral uppercase tracking-wider mb-1">
                Ngày về
              </p>
              <p className="text-lg font-bold text-gray-900">{formatDate(trip.endDate)}</p>
            </div>
          </div>
        </motion.div>

        {/* Members */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 p-6 space-y-4"
        >
          <h2 className="text-lg font-black text-gray-900">
            👥 Thành viên ({trip.members.length})
          </h2>

          <div className="space-y-3">
            {trip.members.map((member, i) => (
              <motion.div
                key={member.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md ${
                    member.role === 'LEADER'
                      ? 'bg-gradient-to-br from-brand-yellow to-brand-coral'
                      : 'bg-gradient-to-br from-brand-blue to-brand-green'
                  }`}
                >
                  {(member.user.name || '?').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 truncate">
                    {member.user.name || 'Ẩn danh'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {member.role === 'LEADER' ? '👑 Trưởng đoàn' : '🎒 Thành viên'}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Join CTA */}
        {user && !joined && (
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-gradient-to-r from-brand-blue to-brand-green rounded-3xl p-8 text-center text-white space-y-4"
          >
            <h2 className="text-2xl font-black">Muốn đi cùng không? 🙌</h2>
            <p className="text-white/80">Nhấn nút bên dưới để tham gia chuyến đi!</p>
            <button
              onClick={handleJoin}
              disabled={joining}
              className="px-8 py-4 bg-white text-brand-blue rounded-2xl font-black text-lg shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-60 flex items-center gap-2 mx-auto"
            >
              {joining ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <UserPlus size={20} />
              )}
              {joining ? 'Đang tham gia...' : 'Tham gia ngay!'}
            </button>
          </motion.div>
        )}

        {user && joined && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-brand-green/10 border border-brand-green/20 rounded-3xl p-6 text-center"
          >
            <p className="text-brand-green font-bold text-lg">✅ Bạn đã tham gia chuyến đi này!</p>
          </motion.div>
        )}

        {!user && (
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8 text-center space-y-4"
          >
            <h2 className="text-2xl font-black text-gray-900">Muốn đi cùng? 🎒</h2>
            <p className="text-gray-500">Đăng nhập để tham gia chuyến đi này!</p>
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 px-8 py-4 bg-brand-blue hover:bg-brand-blue/90 text-white rounded-2xl font-black text-lg shadow-lg shadow-brand-blue/20 transition-all hover:-translate-y-0.5 active:scale-95"
            >
              Đăng nhập ngay
            </Link>
          </motion.div>
        )}
      </main>
    </div>
  );
}
