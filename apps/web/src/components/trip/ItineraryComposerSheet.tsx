'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown, Clock, MapPin, StickyNote, Loader2 } from 'lucide-react';
import { itineraryApi, ItinerarySnapshot } from '../../lib/api-client';

interface ItineraryComposerSheetProps {
  open: boolean;
  onClose: () => void;
  tripId: string;
  dayIndex: number;
  insertAfterItemId?: string;
  onSuccess: (snapshot: ItinerarySnapshot) => void;
}

export function ItineraryComposerSheet({
  open,
  onClose,
  tripId,
  dayIndex,
  insertAfterItemId,
  onSuccess,
}: ItineraryComposerSheetProps) {
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('');
  const [locationName, setLocationName] = useState('');
  const [shortNote, setShortNote] = useState('');
  const [showDetailed, setShowDetailed] = useState(false);
  const [locationAddress, setLocationAddress] = useState('');
  const [placeId, setPlaceId] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setTitle('');
    setStartTime('');
    setLocationName('');
    setShortNote('');
    setShowDetailed(false);
    setLocationAddress('');
    setPlaceId('');
    setLat('');
    setLng('');
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
        dayIndex,
        insertAfterItemId,
        startTime: startTime || undefined,
        locationName: locationName || undefined,
        shortNote: shortNote || undefined,
        locationAddress: locationAddress || undefined,
        placeId: placeId || undefined,
        lat: lat ? parseFloat(lat) : undefined,
        lng: lng ? parseFloat(lng) : undefined,
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
                  Thêm hoạt động · Ngày {dayIndex + 1}
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
                <div className="grid grid-cols-2 gap-3">
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
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1 flex items-center gap-1">
                      <MapPin size={12} /> Địa điểm
                    </label>
                    <input
                      value={locationName}
                      onChange={(e) => setLocationName(e.target.value)}
                      placeholder="VD: Quán 123 Hai Bà Trưng"
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/30 text-gray-900 text-sm placeholder:text-gray-400"
                    />
                  </div>
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

                {/* Detailed toggle */}
                <button
                  type="button"
                  onClick={() => setShowDetailed(!showDetailed)}
                  className="flex items-center gap-1.5 text-xs font-bold text-brand-blue hover:text-brand-blue/80 transition-colors"
                >
                  <ChevronDown size={14} className={`transition-transform ${showDetailed ? 'rotate-180' : ''}`} />
                  {showDetailed ? 'Ẩn chi tiết' : 'Thêm chi tiết (địa chỉ, toạ độ...)'}
                </button>

                <AnimatePresence>
                  {showDetailed && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="space-y-3 overflow-hidden"
                    >
                      <input
                        value={locationAddress}
                        onChange={(e) => setLocationAddress(e.target.value)}
                        placeholder="Địa chỉ đầy đủ"
                        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/30 text-gray-900 text-sm placeholder:text-gray-400"
                      />
                      <input
                        value={placeId}
                        onChange={(e) => setPlaceId(e.target.value)}
                        placeholder="Google Place ID"
                        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/30 text-gray-900 text-sm placeholder:text-gray-400"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="number"
                          step="any"
                          value={lat}
                          onChange={(e) => setLat(e.target.value)}
                          placeholder="Lat"
                          className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm placeholder:text-gray-400"
                        />
                        <input
                          type="number"
                          step="any"
                          value={lng}
                          onChange={(e) => setLng(e.target.value)}
                          placeholder="Lng"
                          className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm placeholder:text-gray-400"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

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
