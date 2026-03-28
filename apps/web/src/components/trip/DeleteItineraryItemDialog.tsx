'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Loader2, X } from 'lucide-react';
import { itineraryApi, ItinerarySnapshot, ItineraryItem } from '../../lib/api-client';

interface DeleteItineraryItemDialogProps {
  open: boolean;
  onClose: () => void;
  tripId: string;
  item: ItineraryItem;
  onSuccess: (snapshot: ItinerarySnapshot) => void;
}

export function DeleteItineraryItemDialog({
  open,
  onClose,
  tripId,
  item,
  onSuccess,
}: DeleteItineraryItemDialogProps) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setDeleting(true);
    setError(null);
    try {
      const snapshot = await itineraryApi.deleteItem(tripId, item.id);
      onSuccess(snapshot);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể xoá hoạt động');
    } finally {
      setDeleting(false);
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
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-sm w-full space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-brand-coral/10 rounded-xl">
                    <AlertTriangle size={24} className="text-brand-coral" />
                  </div>
                  <h3 className="font-black text-gray-900">Xoá hoạt động này?</h3>
                </div>
                <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg">
                  <X size={18} className="text-gray-400" />
                </button>
              </div>

              <p className="text-gray-500 text-sm">
                Bạn sắp xoá <strong className="text-gray-900">&quot;{item.title}&quot;</strong>.
                Hành động này không thể hoàn tác.
              </p>

              {error && (
                <div className="p-3 bg-brand-coral/10 text-brand-coral rounded-xl text-sm font-medium">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-all"
                >
                  Huỷ
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 py-3 bg-brand-coral hover:bg-brand-coral/90 text-white rounded-xl font-bold transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {deleting && <Loader2 size={16} className="animate-spin" />}
                  Xoa hoat dong nay
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
