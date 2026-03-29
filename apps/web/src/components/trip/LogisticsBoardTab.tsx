'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Shuffle,
  Loader2,
  BedDouble,
  Car,
  RefreshCw,
} from 'lucide-react';
import { logisticsApi, AllocationSnapshot } from '../../lib/api-client';
import { AllocationUnitCard } from './AllocationUnitCard';

interface LogisticsBoardTabProps {
  tripId: string;
}

type CreateMode = 'ROOM' | 'RIDE' | null;

export function LogisticsBoardTab({ tripId }: LogisticsBoardTabProps) {
  const [snapshot, setSnapshot] = useState<AllocationSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState<CreateMode>(null);
  const [newLabel, setNewLabel] = useState('');
  const [newCapacity, setNewCapacity] = useState(4);
  const [newNote, setNewNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await logisticsApi.getAllocations(tripId);
      setSnapshot(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateUnit = async () => {
    if (!creating || !newLabel.trim()) return;
    setSubmitting(true);
    try {
      const data = await logisticsApi.createUnit(tripId, {
        type: creating,
        label: newLabel.trim(),
        capacity: newCapacity,
        note: newNote.trim() || undefined,
      });
      setSnapshot(data);
      setCreating(null);
      setNewLabel('');
      setNewCapacity(4);
      setNewNote('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tạo được');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelfJoin = async (unitId: string) => {
    try {
      const data = await logisticsApi.selfJoin(tripId, { unitId });
      setSnapshot(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể vào chỗ này');
    }
  };

  const handleLeave = async (type: 'ROOM' | 'RIDE') => {
    try {
      const data = await logisticsApi.leave(tripId, { type });
      setSnapshot(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể rời chỗ');
    }
  };

  const handleReassign = async (tripMemberId: string, targetUnitId: string) => {
    if (!tripMemberId || !targetUnitId) return;
    try {
      const data = await logisticsApi.reassign(tripId, {
        tripMemberId,
        targetUnitId,
      });
      setSnapshot(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể chuyển chỗ');
    }
  };

  const handleDeleteUnit = async (unitId: string) => {
    try {
      const data = await logisticsApi.deleteUnit(tripId, unitId);
      setSnapshot(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể xóa');
    }
  };

  const handleAutoFill = async (type: 'ROOM' | 'RIDE') => {
    try {
      const data = await logisticsApi.autoFill(tripId, type);
      setSnapshot(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể chia nhanh');
    }
  };

  if (loading && !snapshot) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 size={28} className="text-brand-blue animate-spin" />
      </div>
    );
  }

  if (error && !snapshot) {
    return (
      <div className="text-center py-16">
        <p className="text-brand-coral font-medium mb-4">{error}</p>
        <button
          onClick={fetchData}
          className="text-brand-blue font-bold hover:underline"
        >
          Thử lại
        </button>
      </div>
    );
  }

  if (!snapshot) return null;

  const { roomUnits, rideUnits, isLeader, currentTripMemberId } = snapshot;
  const hasUnits = roomUnits.length > 0 || rideUnits.length > 0;

  return (
    <div className="space-y-6">
      {/* Header with refresh */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black text-gray-900">Phân phòng/xe</h2>
        <button
          onClick={fetchData}
          disabled={loading}
          className="p-2 text-gray-400 hover:text-brand-blue hover:bg-brand-blue/10 rounded-xl transition-all"
          title="Làm mới"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Error toast */}
      <AnimatePresence>
        {error && snapshot && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="px-4 py-3 bg-brand-coral/10 text-brand-coral text-sm font-medium rounded-2xl"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Leader create actions */}
      {isLeader && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCreating('ROOM')}
            className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-2xl border border-brand-blue/20 text-brand-blue text-sm font-bold shadow-sm hover:shadow-md hover:border-brand-blue/40 transition-all"
          >
            <BedDouble size={16} />
            Tạo chỗ mới
          </button>
          <button
            onClick={() => setCreating('RIDE')}
            className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-2xl border border-brand-yellow/20 text-brand-coral text-sm font-bold shadow-sm hover:shadow-md hover:border-brand-yellow/40 transition-all"
          >
            <Car size={16} />
            Tạo chỗ mới
          </button>
          {hasUnits && (
            <>
              {roomUnits.length > 0 && (
                <button
                  onClick={() => handleAutoFill('ROOM')}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-brand-blue to-brand-green text-white text-sm font-bold rounded-2xl shadow-md hover:shadow-lg transition-all"
                >
                  <Shuffle size={14} />
                  Chia nhanh phòng
                </button>
              )}
              {rideUnits.length > 0 && (
                <button
                  onClick={() => handleAutoFill('RIDE')}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-brand-yellow to-brand-coral text-white text-sm font-bold rounded-2xl shadow-md hover:shadow-lg transition-all"
                >
                  <Shuffle size={14} />
                  Chia nhanh xe
                </button>
              )}
            </>
          )}
        </div>
      )}

      {/* Create form */}
      <AnimatePresence>
        {creating && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm space-y-3">
              <h3 className="text-sm font-black text-gray-900">
                Tạo {creating === 'ROOM' ? 'phòng' : 'xe'} mới
              </h3>
              <input
                type="text"
                placeholder={`Tên ${creating === 'ROOM' ? 'phòng' : 'xe'}...`}
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
                autoFocus
              />
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs text-gray-500 font-semibold">
                    Số chỗ
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={newCapacity}
                    onChange={(e) =>
                      setNewCapacity(Math.max(1, parseInt(e.target.value) || 1))
                    }
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-gray-500 font-semibold">
                    Ghi chú
                  </label>
                  <input
                    type="text"
                    placeholder="Tùy chọn..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleCreateUnit}
                  disabled={submitting || !newLabel.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 bg-brand-dark text-white text-sm font-bold rounded-xl hover:bg-brand-dark/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Plus size={14} />
                  )}
                  Tạo
                </button>
                <button
                  onClick={() => setCreating(null)}
                  className="px-4 py-2 text-sm text-gray-500 font-semibold hover:text-gray-700 transition-colors"
                >
                  Hủy
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {!hasUnits && (
        <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center space-y-4">
          <div className="flex justify-center gap-3">
            <BedDouble
              size={36}
              className="text-brand-blue/30"
            />
            <Car
              size={36}
              className="text-brand-yellow/30"
            />
          </div>
          <h3 className="text-xl font-black text-gray-900">
            Chưa có gì để chia chỗ cả
          </h3>
          <p className="text-gray-500">
            {isLeader
              ? 'Tạo phòng hoặc xe đầu tiên để cả nhóm bắt đầu vào chỗ.'
              : 'Chờ trưởng đoàn tạo phòng hoặc xe nhé!'}
          </p>
        </div>
      )}

      {/* Room units */}
      {roomUnits.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-black text-gray-700 flex items-center gap-2">
            <BedDouble size={16} className="text-brand-blue" />
            Phòng ({roomUnits.length})
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {roomUnits.map((unit) => (
              <AllocationUnitCard
                key={unit.id}
                {...unit}
                type="ROOM"
                isLeader={isLeader}
                currentTripMemberId={currentTripMemberId}
                onSelfJoin={handleSelfJoin}
                onLeave={handleLeave}
                onReassign={handleReassign}
                onDelete={isLeader ? handleDeleteUnit : undefined}
              />
            ))}
          </div>
        </div>
      )}

      {/* Ride units */}
      {rideUnits.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-black text-gray-700 flex items-center gap-2">
            <Car size={16} className="text-brand-coral" />
            Xe ({rideUnits.length})
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {rideUnits.map((unit) => (
              <AllocationUnitCard
                key={unit.id}
                {...unit}
                type="RIDE"
                isLeader={isLeader}
                currentTripMemberId={currentTripMemberId}
                onSelfJoin={handleSelfJoin}
                onLeave={handleLeave}
                onReassign={handleReassign}
                onDelete={isLeader ? handleDeleteUnit : undefined}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
