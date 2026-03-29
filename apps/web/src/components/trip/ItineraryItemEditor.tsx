'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Loader2, MapPin } from 'lucide-react';
import { itineraryApi, ItinerarySnapshot, ItineraryItem, OverlapWarning } from '../../lib/api-client';
import { LocationPicker } from './LocationPicker';

interface ItineraryItemEditorProps {
  open: boolean;
  onClose: () => void;
  tripId: string;
  item: ItineraryItem;
  overlapWarnings: OverlapWarning[];
  onSuccess: (snapshot: ItinerarySnapshot) => void;
}

export function ItineraryItemEditor({
  open,
  onClose,
  tripId,
  item,
  overlapWarnings,
  onSuccess,
}: ItineraryItemEditorProps) {
  const [title, setTitle] = useState(item.title);
  const [startTime, setStartTime] = useState(item.startTime || '');
  const [locationText, setLocationText] = useState(item.locationAddress || item.locationName || '');
  const [shortNote, setShortNote] = useState(item.shortNote || '');
  const [lat, setLat] = useState<number | undefined>(item.lat ?? undefined);
  const [lng, setLng] = useState<number | undefined>(item.lng ?? undefined);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTitle(item.title);
    setStartTime(item.startTime || '');
    setLocationText(item.locationAddress || item.locationName || '');
    setShortNote(item.shortNote || '');
    setLat(item.lat ?? undefined);
    setLng(item.lng ?? undefined);
    setShowLocationPicker(false);
  }, [item]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSaving(true);
    setError(null);

    try {
      const snapshot = await itineraryApi.updateItem(tripId, item.id, {
        title: title.trim(),
        startTime: startTime || undefined,
        locationName: locationText || undefined,
        shortNote: shortNote || undefined,
        locationAddress: locationText || undefined,
        lat,
        lng,
      });
      onSuccess(snapshot);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể cập nhật');
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
              <div className="flex justify-center">
                <div className="w-10 h-1 bg-gray-300 rounded-full" />
              </div>

              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-gray-900">Chỉnh sửa hoạt động</h2>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl">
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              {/* Overlap Warnings */}
              {overlapWarnings.length > 0 && (
                <div className="p-3 bg-brand-yellow/10 border border-brand-yellow/20 rounded-xl space-y-1">
                  {overlapWarnings.map((w, i) => (
                    <div key={i} className="flex items-center gap-2 text-brand-yellow text-xs font-medium">
                      <AlertTriangle size={14} />
                      {w.message}
                    </div>
                  ))}
                </div>
              )}

              {error && (
                <div className="p-3 bg-brand-coral/10 text-brand-coral rounded-xl text-sm font-medium">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Tên hoạt động</label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/30 text-gray-900"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Giờ bắt đầu</label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Địa chỉ / địa điểm</label>
                    <input
                      value={locationText}
                      onChange={(e) => setLocationText(e.target.value)}
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm"
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-gray-800">Ghim địa điểm trên bản đồ</p>
                      <p className="text-xs text-gray-500">Nhập tay hoặc chọn trên bản đồ đều dùng chung một field.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowLocationPicker((value) => !value)}
                      className="rounded-xl border border-brand-blue/20 bg-white px-3 py-2 text-xs font-bold text-brand-blue"
                    >
                      {showLocationPicker ? 'Ẩn bản đồ' : 'Chọn trên bản đồ'}
                    </button>
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
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <MapPin size={12} />
                      {lat.toFixed(5)}, {lng.toFixed(5)}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Ghi chú</label>
                  <textarea
                    value={shortNote}
                    onChange={(e) => setShortNote(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving || !title.trim()}
                  className="w-full py-3.5 bg-brand-blue text-white rounded-xl font-bold shadow-lg transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {saving && <Loader2 size={18} className="animate-spin" />}
                  {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
