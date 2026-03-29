'use client';

import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Clock, Loader2, MapPin, Plus, StickyNote, X } from 'lucide-react';
import { proposalsApi, ProposalType } from '../../lib/api-client';
import { LocationPicker } from './LocationPicker';

const proposalTypeConfig: Record<
  ProposalType,
  { label: string; icon: ReactNode; description: string }
> = {
  ADD_ITEM: {
    label: 'Thêm hoạt động',
    icon: <Plus size={16} />,
    description: 'Đề xuất hoạt động mới',
  },
  UPDATE_TIME: {
    label: 'Đổi giờ',
    icon: <Clock size={16} />,
    description: 'Đề xuất đổi giờ bắt đầu',
  },
  UPDATE_LOCATION: {
    label: 'Đổi địa điểm',
    icon: <MapPin size={16} />,
    description: 'Đề xuất đổi địa điểm',
  },
  UPDATE_NOTE: {
    label: 'Sửa ghi chú',
    icon: <StickyNote size={16} />,
    description: 'Đề xuất sửa ghi chú',
  },
};

interface ProposalComposerSheetProps {
  open: boolean;
  onClose: () => void;
  tripId: string;
  tripStartDate: string;
  tripEndDate: string;
  targetItemId?: string;
  targetVersion?: number;
  onSuccess: () => void;
}

function timeToMinutes(time: string): number {
  const [hours = 0, minutes = 0] = time.split(':').map(Number);
  return hours * 60 + minutes;
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

export function ProposalComposerSheet({
  open,
  onClose,
  tripId,
  tripStartDate,
  tripEndDate,
  targetItemId,
  targetVersion,
  onSuccess,
}: ProposalComposerSheetProps) {
  const [selectedType, setSelectedType] = useState<ProposalType>(
    targetItemId ? 'UPDATE_TIME' : 'ADD_ITEM',
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState(toInputDate(tripStartDate));
  const [newStartTime, setNewStartTime] = useState('');
  const [newLocationText, setNewLocationText] = useState('');
  const [newLat, setNewLat] = useState<number | undefined>();
  const [newLng, setNewLng] = useState<number | undefined>();
  const [newNote, setNewNote] = useState('');

  const [proposedStartTime, setProposedStartTime] = useState('');
  const [proposedLocationText, setProposedLocationText] = useState('');
  const [proposedLat, setProposedLat] = useState<number | undefined>();
  const [proposedLng, setProposedLng] = useState<number | undefined>();
  const [proposedNote, setProposedNote] = useState('');

  const availableTypes = useMemo<ProposalType[]>(
    () => (targetItemId ? ['UPDATE_TIME', 'UPDATE_LOCATION', 'UPDATE_NOTE'] : ['ADD_ITEM']),
    [targetItemId],
  );

  useEffect(() => {
    setSelectedType(targetItemId ? 'UPDATE_TIME' : 'ADD_ITEM');
  }, [targetItemId, open]);

  const resetForm = () => {
    setNewTitle('');
    setNewDate(toInputDate(tripStartDate));
    setNewStartTime('');
    setNewLocationText('');
    setNewLat(undefined);
    setNewLng(undefined);
    setNewNote('');
    setProposedStartTime('');
    setProposedLocationText('');
    setProposedLat(undefined);
    setProposedLng(undefined);
    setProposedNote('');
    setError(null);
    setShowLocationPicker(false);
  };

  const buildPayload = (): Record<string, unknown> => {
    if (selectedType === 'ADD_ITEM') {
      return {
        title: newTitle,
        dayIndex: dateToDayIndex(newDate, tripStartDate),
        startMinute: newStartTime ? timeToMinutes(newStartTime) : undefined,
        locationName: newLocationText || undefined,
        locationAddress: newLocationText || undefined,
        lat: newLat,
        lng: newLng,
        shortNote: newNote || undefined,
      };
    }

    if (selectedType === 'UPDATE_TIME') {
      return {
        startMinute: proposedStartTime ? timeToMinutes(proposedStartTime) : undefined,
      };
    }

    if (selectedType === 'UPDATE_LOCATION') {
      return {
        locationName: proposedLocationText || undefined,
        locationAddress: proposedLocationText || undefined,
        lat: proposedLat,
        lng: proposedLng,
      };
    }

    return {
      shortNote: proposedNote || undefined,
    };
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await proposalsApi.createProposal(tripId, {
        type: selectedType,
        targetItemId: selectedType === 'ADD_ITEM' ? undefined : targetItemId,
        payload: buildPayload(),
        baseVersion: selectedType === 'ADD_ITEM' ? undefined : targetVersion,
      });
      resetForm();
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể gửi đề xuất');
    } finally {
      setSaving(false);
    }
  };

  const activeType = proposalTypeConfig[selectedType];

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 max-h-[88vh] overflow-y-auto rounded-t-3xl bg-white shadow-2xl"
          >
            <div className="space-y-5 p-6">
              <div className="flex justify-center">
                <div className="h-1 w-10 rounded-full bg-gray-300" />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-gray-900">Gửi đề xuất</h2>
                  <p className="text-sm text-gray-500">{activeType.description}</p>
                </div>
                <button onClick={onClose} className="rounded-xl p-2 hover:bg-gray-100">
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              {error && (
                <div className="rounded-xl border border-brand-coral/20 bg-brand-coral/10 p-3 text-sm font-medium text-brand-coral">
                  {error}
                </div>
              )}

              <div className="grid gap-2">
                {availableTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      setSelectedType(type);
                      setError(null);
                    }}
                    className={`flex items-center gap-2 rounded-xl border-2 p-3 text-sm font-bold transition-all ${
                      selectedType === type
                        ? 'border-brand-blue bg-brand-blue/5 text-brand-blue'
                        : 'border-gray-100 text-gray-500 hover:border-gray-200'
                    }`}
                  >
                    {proposalTypeConfig[type].icon}
                    {proposalTypeConfig[type].label}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {selectedType === 'ADD_ITEM' && (
                  <>
                    <input
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="Tên hoạt động *"
                      required
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 placeholder:text-gray-400"
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <label className="block">
                        <span className="mb-1 block text-xs font-bold text-gray-600">Ngày</span>
                        <input
                          type="date"
                          min={toInputDate(tripStartDate)}
                          max={toInputDate(tripEndDate)}
                          value={newDate}
                          onChange={(e) => setNewDate(e.target.value)}
                          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm"
                        />
                      </label>
                      <label className="block">
                        <span className="mb-1 block text-xs font-bold text-gray-600">Giờ</span>
                        <input
                          type="time"
                          value={newStartTime}
                          onChange={(e) => setNewStartTime(e.target.value)}
                          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm"
                        />
                      </label>
                    </div>

                    <input
                      value={newLocationText}
                      onChange={(e) => setNewLocationText(e.target.value)}
                      placeholder="Địa chỉ / địa điểm"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 placeholder:text-gray-400"
                    />

                    <button
                      type="button"
                      onClick={() => setShowLocationPicker((value) => !value)}
                      className="w-full rounded-xl border border-brand-blue/20 bg-brand-blue/5 px-4 py-3 text-sm font-bold text-brand-blue"
                    >
                      {showLocationPicker ? 'Ẩn chọn vị trí trên bản đồ' : 'Chọn địa điểm trên bản đồ'}
                    </button>

                    {showLocationPicker && (
                      <LocationPicker
                        initialLat={newLat}
                        initialLng={newLng}
                        value={newLocationText}
                        onValueChange={setNewLocationText}
                        onCancel={() => setShowLocationPicker(false)}
                        onConfirm={(location) => {
                          setNewLat(location.lat);
                          setNewLng(location.lng);
                          if (location.name) {
                            setNewLocationText(location.name);
                          }
                          setShowLocationPicker(false);
                        }}
                      />
                    )}

                    <textarea
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Ghi chú"
                      rows={2}
                      className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 placeholder:text-gray-400"
                    />
                  </>
                )}

                {selectedType === 'UPDATE_TIME' && (
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-bold text-gray-700">Giờ mới đề xuất</span>
                    <input
                      type="time"
                      value={proposedStartTime}
                      onChange={(e) => setProposedStartTime(e.target.value)}
                      required
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900"
                    />
                  </label>
                )}

                {selectedType === 'UPDATE_LOCATION' && (
                  <>
                    <input
                      value={proposedLocationText}
                      onChange={(e) => setProposedLocationText(e.target.value)}
                      placeholder="Địa chỉ / địa điểm mới *"
                      required
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 placeholder:text-gray-400"
                    />

                    <button
                      type="button"
                      onClick={() => setShowLocationPicker((value) => !value)}
                      className="w-full rounded-xl border border-brand-blue/20 bg-brand-blue/5 px-4 py-3 text-sm font-bold text-brand-blue"
                    >
                      {showLocationPicker ? 'Ẩn chọn vị trí trên bản đồ' : 'Chọn địa điểm trên bản đồ'}
                    </button>

                    {showLocationPicker && (
                      <LocationPicker
                        initialLat={proposedLat}
                        initialLng={proposedLng}
                        value={proposedLocationText}
                        onValueChange={setProposedLocationText}
                        onCancel={() => setShowLocationPicker(false)}
                        onConfirm={(location) => {
                          setProposedLat(location.lat);
                          setProposedLng(location.lng);
                          if (location.name) {
                            setProposedLocationText(location.name);
                          }
                          setShowLocationPicker(false);
                        }}
                      />
                    )}
                  </>
                )}

                {selectedType === 'UPDATE_NOTE' && (
                  <textarea
                    value={proposedNote}
                    onChange={(e) => setProposedNote(e.target.value)}
                    placeholder="Ghi chú mới *"
                    required
                    rows={3}
                    className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 placeholder:text-gray-400"
                  />
                )}

                <button
                  type="submit"
                  disabled={saving}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-blue to-brand-green py-3.5 font-bold text-white shadow-lg transition-all active:scale-[0.98] disabled:opacity-60"
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
