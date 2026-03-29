'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, MapPin, StickyNote, Loader2, CalendarDays } from 'lucide-react';
import { itineraryApi, ItinerarySnapshot } from '../../lib/api-client';
import { LocationPicker } from './LocationPicker';

interface ItineraryComposerSheetProps {
  open: boolean;
  onClose: () => void;
  tripId: string;
  tripStartDate: string;
  tripEndDate: string;
  dayIndex: number;
  insertAfterItemId?: string;
  onSuccess: (snapshot: ItinerarySnapshot) => void;
}

function toInputDate(date: string): string {
  return date.slice(0, 10);
}

function dateToDayIndex(selectedDate: string, tripStartDate: string): number {
  const tripStart = new Date(`${tripStartDate.slice(0, 10)}T00:00:00`);
  const picked = new Date(`${selectedDate}T00:00:00`);
  const diff = picked.getTime() - tripStart.getTime();
  return Math.max(0, Math.round(diff / (1000 * 60 * 60 * 24)));
}

function addDaysToInputDate(startDate: string, dayOffset: number): string {
  const date = new Date(`${startDate.slice(0, 10)}T00:00:00`);
  date.setDate(date.getDate() + dayOffset);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function ItineraryComposerSheet({
  open,
  onClose,
  tripId,
  tripStartDate,
  tripEndDate,
  dayIndex,
  insertAfterItemId,
  onSuccess,
}: ItineraryComposerSheetProps) {
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('');
  const [locationText, setLocationText] = useState('');
  const [shortNote, setShortNote] = useState('');
  const [selectedDate, setSelectedDate] = useState(toInputDate(tripStartDate));
  const [lat, setLat] = useState<number | undefined>();
  const [lng, setLng] = useState<number | undefined>();
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initialDate = useMemo(() => {
    return addDaysToInputDate(tripStartDate, dayIndex);
  }, [dayIndex, tripStartDate]);

  useEffect(() => {
    if (open) {
      setSelectedDate(initialDate);
      setShowLocationPicker(false);
      setError(null);
    }
  }, [initialDate, open]);

  const resetForm = () => {
    setTitle('');
    setStartTime('');
    setLocationText('');
    setShortNote('');
    setSelectedDate(initialDate);
    setLat(undefined);
    setLng(undefined);
    setShowLocationPicker(false);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSaving(true);
    setError(null);

    try {
      const snapshot = await itineraryApi.createItem(tripId, {
        title: title.trim(),
        dayIndex: dateToDayIndex(selectedDate, tripStartDate),
        insertAfterItemId:
          selectedDate === initialDate ? insertAfterItemId : undefined,
        startTime: startTime || undefined,
        locationName: locationText || undefined,
        shortNote: shortNote || undefined,
        locationAddress: locationText || undefined,
        lat,
        lng,
      });
      resetForm();
      onSuccess(snapshot);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể thêm hoạt động');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl max-h-[85vh] overflow-y-auto"
          >
            <div className="p-6 space-y-5">
              {/* Handle */}
              <div className="flex justify-center">
                <div className="w-10 h-1 bg-gray-300 rounded-full" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-gray-900">
                  Thêm hoạt động mới
                </h2>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              {error && (
                <div className="p-3 bg-brand-coral/10 text-brand-coral rounded-xl text-sm font-medium border border-brand-coral/20">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Title — required */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">
                    Tên hoạt động <span className="text-brand-coral">*</span>
                  </label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="VD: Ăn sáng tại Bún bò Huế Bà Loan ☀️"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue text-gray-900 placeholder:text-gray-400"
                    required
                  />
                </div>

                {/* Quick mode fields */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1 flex items-center gap-1">
                      <CalendarDays size={12} /> Ngày
                    </label>
                    <input
                      type="date"
                      min={toInputDate(tripStartDate)}
                      max={toInputDate(tripEndDate)}
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/30 text-gray-900 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1 flex items-center gap-1">
                      <Clock size={12} /> Giờ bắt đầu
                    </label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/30 text-gray-900 text-sm"
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-gray-800">Địa điểm</p>
                      <p className="text-xs text-gray-500">
                        Có thể nhập tay hoặc chọn trực tiếp trên bản đồ
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowLocationPicker((value) => !value)}
                      className="rounded-xl border border-brand-blue/20 bg-white px-3 py-2 text-xs font-bold text-brand-blue"
                    >
                      {showLocationPicker ? 'Ẩn bản đồ' : 'Chọn trên bản đồ'}
                    </button>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1 flex items-center gap-1">
                        <MapPin size={12} /> Tên địa điểm
                      </label>
                      <input
                        value={locationText}
                        onChange={(e) => setLocationText(e.target.value)}
                        placeholder="VD: Chợ đêm Sơn Trà, 123 Hai Bà Trưng"
                        className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/30 text-gray-900 text-sm placeholder:text-gray-400"
                      />
                    </div>
                  </div>

                  {showLocationPicker && (
                    <LocationPicker
                      initialLat={lat}
                      initialLng={lng}
                      value={locationText}
                      onValueChange={setLocationText}
                      onCancel={() => setShowLocationPicker(false)}
                      onConfirm={(location) => {
                        setLat(location.lat);
                        setLng(location.lng);
                        if (location.name) {
                          setLocationText(location.name);
                        }
                        setShowLocationPicker(false);
                      }}
                    />
                  )}

                  {(lat != null && lng != null) && (
                    <p className="text-xs text-gray-500">
                      Đã ghim vị trí: {lat.toFixed(5)}, {lng.toFixed(5)}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1 flex items-center gap-1">
                    <StickyNote size={12} /> Ghi chú
                  </label>
                  <textarea
                    value={shortNote}
                    onChange={(e) => setShortNote(e.target.value)}
                    placeholder="Ghi chú nhanh..."
                    rows={2}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/30 text-gray-900 text-sm placeholder:text-gray-400 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving || !title.trim()}
                  className="w-full py-3.5 bg-gradient-to-r from-brand-coral to-brand-yellow text-white rounded-xl font-bold shadow-lg shadow-brand-coral/20 hover:shadow-xl transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 size={18} className="animate-spin" /> : null}
                  {saving ? 'Đang thêm...' : 'Thêm hoạt động 🚀'}
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
