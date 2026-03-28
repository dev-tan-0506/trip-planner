'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, MapPin, StickyNote, Plus, Loader2 } from 'lucide-react';
import { proposalsApi, ProposalType } from '../../lib/api-client';

const proposalTypes: { value: ProposalType; label: string; icon: React.ReactNode; description: string }[] = [
  { value: 'ADD_ITEM', label: 'Thêm hoạt động', icon: <Plus size={16} />, description: 'Đề xuất hoạt động mới' },
  { value: 'UPDATE_TIME', label: 'Đổi giờ', icon: <Clock size={16} />, description: 'Đề xuất đổi giờ bắt đầu' },
  { value: 'UPDATE_LOCATION', label: 'Đổi địa điểm', icon: <MapPin size={16} />, description: 'Đề xuất đổi địa điểm' },
  { value: 'UPDATE_NOTE', label: 'Sửa ghi chú', icon: <StickyNote size={16} />, description: 'Đề xuất sửa ghi chú' },
];

interface ProposalComposerSheetProps {
  open: boolean;
  onClose: () => void;
  tripId: string;
  targetItemId?: string;
  targetVersion?: number;
  onSuccess: () => void;
}

export function ProposalComposerSheet({
  open,
  onClose,
  tripId,
  targetItemId,
  targetVersion,
  onSuccess,
}: ProposalComposerSheetProps) {
  const [selectedType, setSelectedType] = useState<ProposalType>(
    targetItemId ? 'UPDATE_TIME' : 'ADD_ITEM',
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ADD_ITEM fields
  const [newTitle, setNewTitle] = useState('');
  const [newDayIndex, setNewDayIndex] = useState(0);
  const [newStartTime, setNewStartTime] = useState('');
  const [newLocationName, setNewLocationName] = useState('');
  const [newNote, setNewNote] = useState('');

  // UPDATE_TIME fields
  const [proposedStartMinute, setProposedStartMinute] = useState('');

  // UPDATE_LOCATION fields
  const [proposedLocationName, setProposedLocationName] = useState('');
  const [proposedLocationAddress, setProposedLocationAddress] = useState('');

  // UPDATE_NOTE fields
  const [proposedNote, setProposedNote] = useState('');

  const resetForm = () => {
    setNewTitle('');
    setNewDayIndex(0);
    setNewStartTime('');
    setNewLocationName('');
    setNewNote('');
    setProposedStartMinute('');
    setProposedLocationName('');
    setProposedLocationAddress('');
    setProposedNote('');
    setError(null);
  };

  const buildPayload = (): Record<string, unknown> => {
    switch (selectedType) {
      case 'ADD_ITEM':
        return {
          title: newTitle,
          dayIndex: newDayIndex,
          startMinute: newStartTime ? timeToMinutes(newStartTime) : undefined,
          locationName: newLocationName || undefined,
          shortNote: newNote || undefined,
        };
      case 'UPDATE_TIME':
        return {
          startMinute: proposedStartMinute ? timeToMinutes(proposedStartMinute) : undefined,
        };
      case 'UPDATE_LOCATION':
        return {
          locationName: proposedLocationName || undefined,
          locationAddress: proposedLocationAddress || undefined,
        };
      case 'UPDATE_NOTE':
        return {
          shortNote: proposedNote || undefined,
        };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await proposalsApi.createProposal(tripId, {
        type: selectedType,
        targetItemId: selectedType !== 'ADD_ITEM' ? targetItemId : undefined,
        payload: buildPayload(),
        baseVersion: selectedType !== 'ADD_ITEM' ? targetVersion : undefined,
      });
      resetForm();
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể gửi đề xuất');
    } finally {
      setSaving(false);
    }
  };

  // Filter available types based on whether we have a target item
  const availableTypes = targetItemId
    ? proposalTypes.filter((t) => t.value !== 'ADD_ITEM')
    : proposalTypes;

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
                <h2 className="text-xl font-black text-gray-900">Gửi đề xuất</h2>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl">
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              {error && (
                <div className="p-3 bg-brand-coral/10 text-brand-coral rounded-xl text-sm font-medium border border-brand-coral/20">
                  {error}
                </div>
              )}

              {/* Type Selector */}
              <div className="grid grid-cols-2 gap-2">
                {availableTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setSelectedType(type.value)}
                    className={`flex items-center gap-2 p-3 rounded-xl border-2 text-sm font-bold transition-all ${
                      selectedType === type.value
                        ? 'border-brand-blue bg-brand-blue/5 text-brand-blue'
                        : 'border-gray-100 text-gray-500 hover:border-gray-200'
                    }`}
                  >
                    {type.icon}
                    {type.label}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Dynamic fields per type */}
                {selectedType === 'ADD_ITEM' && (
                  <>
                    <input
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="Tên hoạt động *"
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">Ngày</label>
                        <input
                          type="number"
                          min={0}
                          value={newDayIndex}
                          onChange={(e) => setNewDayIndex(parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">Giờ</label>
                        <input
                          type="time"
                          value={newStartTime}
                          onChange={(e) => setNewStartTime(e.target.value)}
                          className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                        />
                      </div>
                    </div>
                    <input
                      value={newLocationName}
                      onChange={(e) => setNewLocationName(e.target.value)}
                      placeholder="Địa điểm"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400"
                    />
                    <textarea
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Ghi chú"
                      rows={2}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 resize-none"
                    />
                  </>
                )}

                {selectedType === 'UPDATE_TIME' && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Giờ mới đề xuất</label>
                    <input
                      type="time"
                      value={proposedStartMinute}
                      onChange={(e) => setProposedStartMinute(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900"
                    />
                  </div>
                )}

                {selectedType === 'UPDATE_LOCATION' && (
                  <>
                    <input
                      value={proposedLocationName}
                      onChange={(e) => setProposedLocationName(e.target.value)}
                      placeholder="Tên địa điểm mới *"
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400"
                    />
                    <input
                      value={proposedLocationAddress}
                      onChange={(e) => setProposedLocationAddress(e.target.value)}
                      placeholder="Địa chỉ (tuỳ chọn)"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400"
                    />
                  </>
                )}

                {selectedType === 'UPDATE_NOTE' && (
                  <textarea
                    value={proposedNote}
                    onChange={(e) => setProposedNote(e.target.value)}
                    placeholder="Ghi chú mới *"
                    required
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 resize-none"
                  />
                )}

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-3.5 bg-gradient-to-r from-brand-blue to-brand-green text-white rounded-xl font-bold shadow-lg transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {saving && <Loader2 size={18} className="animate-spin" />}
                  {saving ? 'Đang gửi...' : 'Gửi đề xuất 💡'}
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function timeToMinutes(time: string): number {
  const parts = time.split(':').map(Number);
  const h = parts[0] ?? 0;
  const m = parts[1] ?? 0;
  return h * 60 + m;
}
