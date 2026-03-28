'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { X, Calendar, MapPin, Sparkles, Loader2 } from 'lucide-react';
import { templatesApi, CommunityTemplate } from '../../lib/api-client';

interface CloneTemplateDialogProps {
  template: CommunityTemplate;
  open: boolean;
  onClose: () => void;
}

export function CloneTemplateDialog({
  template,
  open,
  onClose,
}: CloneTemplateDialogProps) {
  const router = useRouter();
  const [name, setName] = useState(`${template.title} — Bản sao`);
  const [destination, setDestination] = useState(template.destinationLabel);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [timeZone, setTimeZone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone,
  );
  const [cloning, setCloning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  const handleClone = async () => {
    if (!name || !destination || !startDate || !endDate) {
      setError('Vui lòng điền đầy đủ thông tin!');
      return;
    }
    setCloning(true);
    setError(null);
    try {
      const result = await templatesApi.clone(template.id, {
        name,
        destination,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        timeZone,
      });
      router.push(`/trip/${result.joinCode}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Có lỗi xảy ra, thử lại nhé!',
      );
      setCloning(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />

          {/* Dialog */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="fixed inset-x-4 top-[10%] sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-lg bg-white rounded-3xl shadow-2xl z-50 overflow-hidden max-h-[85vh] overflow-y-auto"
          >
            {/* Header gradient */}
            <div className="h-1.5 bg-gradient-to-r from-brand-coral via-brand-yellow to-brand-green" />

            <div className="p-6 space-y-5">
              {/* Title row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-brand-coral/10 rounded-xl">
                    <Sparkles size={20} className="text-brand-coral" />
                  </div>
                  <h2 className="text-xl font-black text-gray-900">
                    Clone hành trình
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X size={20} className="text-gray-400" />
                </button>
              </div>

              {/* Source info */}
              <div className="bg-gray-50 rounded-2xl p-4 space-y-1">
                <p className="text-xs font-bold text-gray-400 uppercase">
                  Mẫu gốc
                </p>
                <p className="font-bold text-gray-900">{template.title}</p>
                <p className="text-xs text-gray-500">
                  {template.destinationLabel} · {template.daysCount} ngày
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="p-3 bg-brand-coral/10 text-brand-coral rounded-xl text-sm font-medium border border-brand-coral/20">
                  {error}
                </div>
              )}

              {/* Form */}
              <div className="space-y-4">
                {/* Trip Name */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Tên chuyến đi mới
                  </label>
                  <div className="relative">
                    <Sparkles
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-all text-gray-900 text-sm"
                    />
                  </div>
                </div>

                {/* Destination */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Điểm đến
                  </label>
                  <div className="relative">
                    <MapPin
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-all text-gray-900 text-sm"
                    />
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Ngày đi
                    </label>
                    <div className="relative">
                      <Calendar
                        size={16}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type="date"
                        min={todayStr}
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-all text-gray-900 text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Ngày về
                    </label>
                    <div className="relative">
                      <Calendar
                        size={16}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type="date"
                        min={startDate || todayStr}
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-all text-gray-900 text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Timezone */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Múi giờ
                  </label>
                  <select
                    value={timeZone}
                    onChange={(e) => setTimeZone(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-all text-gray-900 text-sm"
                  >
                    <option value="Asia/Ho_Chi_Minh">
                      Asia/Ho_Chi_Minh (GMT+7)
                    </option>
                    <option value="Asia/Bangkok">Asia/Bangkok (GMT+7)</option>
                    <option value="Asia/Tokyo">Asia/Tokyo (GMT+9)</option>
                    <option value="Asia/Seoul">Asia/Seoul (GMT+9)</option>
                    <option value="Asia/Singapore">
                      Asia/Singapore (GMT+8)
                    </option>
                    <option value="Europe/London">Europe/London (GMT+0)</option>
                    <option value="America/New_York">
                      America/New_York (GMT-5)
                    </option>
                  </select>
                </div>
              </div>

              {/* Clone Button */}
              <button
                onClick={handleClone}
                disabled={cloning || !name || !startDate || !endDate}
                className="w-full py-4 bg-gradient-to-r from-brand-coral to-brand-yellow text-white rounded-2xl font-black text-lg shadow-lg shadow-brand-coral/20 hover:shadow-xl hover:shadow-brand-coral/30 transition-all hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
              >
                {cloning ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Đang tạo bản sao...
                  </>
                ) : (
                  'Clone về chuyến đi mới 🚀'
                )}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
