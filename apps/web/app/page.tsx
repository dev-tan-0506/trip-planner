'use client';

import { useAuthStore } from '../src/store/useAuthStore';
import Link from 'next/link';
import { LogOut, ArrowRight, Compass } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  const { user, isHydrated, logout } = useAuthStore();

  if (!isHydrated) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="max-w-xl w-full text-center space-y-8"
      >
        <div className="inline-flex items-center justify-center p-4 bg-brand-yellow/20 rounded-full text-brand-yellow mb-4">
          <Compass size={48} className="animate-bounce-soft" />
        </div>
        
        <h1 className="text-5xl font-black text-gray-900 tracking-tight">
          Mình Đi Đâu Thế
        </h1>
        
        {user ? (
          <div className="bg-white p-8 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Chào buổi sáng, {user.name || 'Người lữ hành'}! ☀️
            </h2>
            <p className="text-gray-500">Thêm một chuyến đi, thêm một kỷ niệm đẹp.</p>
            
            <div className="flex gap-4 justify-center">
              <Link
                href="/dashboard"
                className="px-6 py-3 bg-brand-coral hover:bg-brand-coral/90 text-white rounded-2xl font-bold shadow-lg shadow-brand-coral/20 transition-transform active:scale-95"
              >
                Tạo Chuyến Đi Mới
              </Link>
              <button 
                onClick={() => logout()}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl font-bold transition-transform active:scale-95 flex items-center"
              >
                <LogOut className="w-4 h-4 mr-2" /> Đăng xuất
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white p-8 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 space-y-6">
            <p className="text-lg text-gray-600">
              Dễ dàng lên kèo, phân chia chi phí, chốt lịch trình chỉ trong 1 nốt nhạc.
            </p>
            <Link 
              href="/auth/login"
              className="inline-flex items-center px-8 py-4 bg-brand-blue hover:bg-brand-blue/90 text-white rounded-2xl font-black text-lg shadow-lg shadow-brand-blue/20 transition-transform hover:-translate-y-1 active:scale-95"
            >
              Bắt Đầu Ngay <ArrowRight className="ml-2 w-6 h-6" />
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
}
