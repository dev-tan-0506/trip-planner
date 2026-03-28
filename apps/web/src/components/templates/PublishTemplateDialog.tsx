'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, Loader2, AlertTriangle, Upload } from 'lucide-react';
import { templatesApi } from '../../lib/api-client';

interface PublishTemplateDialogProps {
  tripId: string;
  tripName: string;
  open: boolean;
  onClose: () => void;
  onPublished: () => void;
}

export function PublishTemplateDialog({
  tripId,
  tripName,
  open,
  onClose,
  onPublished,
}: PublishTemplateDialogProps) {
  const [title, setTitle] = useState(tripName);
  const [summary, setSummary] = useState('');
  const [coverNote, setCoverNote] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePublish = async () => {
    if (!title.trim()) {
      setError('Vui lòng nhập tên mẫu!');
      return;
    }
    setPublishing(true);
    setError(null);
    try {
      await templatesApi.publish(tripId, {
        title: title.trim(),
        summary: summary.trim() || undefined,
        coverNote: coverNote.trim() || undefined,
      });
      onPublished();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Có lỗi xảy ra, thử lại nhé!',
      );
      setPublishing(false);
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
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="fixed inset-x-4 top-[10%] sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-lg bg-white rounded-3xl shadow-2xl z-50 overflow-hidden max-h-[85vh] overflow-y-auto"
          >
            <div className="h-1.5 bg-gradient-to-r from-brand-green to-brand-blue" />

            <div className="p-6 space-y-5">
              {/* Title */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-brand-green/10 rounded-xl">
                    <Upload size={20} className="text-brand-green" />
                  </div>
                  <h2 className="text-xl font-black text-gray-900">
                    Chia sẻ mẫu hành trình
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X size={20} className="text-gray-400" />
                </button>
              </div>

              {/* Privacy Notice */}
              <div className="bg-brand-yellow/10 border border-brand-yellow/20 rounded-2xl p-4 flex gap-3">
                <AlertTriangle
                  size={20}
                  className="text-brand-yellow flex-shrink-0 mt-0.5"
                />
                <div className="space-y-1">
                  <p className="text-sm font-bold text-gray-700">
                    Du lieu ca nhan se duoc loai bo
                  </p>
                  <p className="text-xs text-gray-500">
                    Tên thành viên, mã tham gia, lượt bình chọn, và đề xuất sẽ
                    không được chia sẻ. Chỉ lịch trình được lưu lại.
                  </p>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="p-3 bg-brand-coral/10 text-brand-coral rounded-xl text-sm font-medium border border-brand-coral/20">
                  {error}
                </div>
              )}

              {/* Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Tên mẫu
                  </label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="VD: Đà Lạt 3 ngày mộng mơ ✨"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-all text-gray-900 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Mô tả ngắn (tùy chọn)
                  </label>
                  <textarea
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    rows={2}
                    placeholder="Hành trình khám phá Đà Lạt phiên bản check-in..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-all text-gray-900 text-sm resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Ghi chú cover (tùy chọn)
                  </label>
                  <textarea
                    value={coverNote}
                    onChange={(e) => setCoverNote(e.target.value)}
                    rows={2}
                    placeholder="Tips cho những ai muốn dùng mẫu này..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-all text-gray-900 text-sm resize-none"
                  />
                </div>
              </div>

              {/* Publish Button */}
              <button
                onClick={handlePublish}
                disabled={publishing || !title.trim()}
                className="w-full py-4 bg-gradient-to-r from-brand-green to-brand-blue text-white rounded-2xl font-black text-lg shadow-lg shadow-brand-green/20 hover:shadow-xl transition-all hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
              >
                {publishing ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Đang xuất bản...
                  </>
                ) : (
                  <>
                    <Shield size={18} />
                    Xuất bản mẫu hành trình
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
