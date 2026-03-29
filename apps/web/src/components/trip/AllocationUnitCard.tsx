'use client';

import { Users, Plus, ArrowRightLeft, AlertTriangle } from 'lucide-react';
import { MemberChip } from './MemberChip';

interface UnitMember {
  assignmentId: string;
  tripMemberId: string;
  userId: string;
  name: string | null;
  avatarUrl: string | null;
  source: string;
  role: string;
}

interface AllocationUnitCardProps {
  id: string;
  type: 'ROOM' | 'RIDE';
  label: string;
  capacity: number;
  occupancy: number;
  remainingCapacity: number;
  isOverbooked: boolean;
  overCapacityBy: number;
  note: string | null;
  members: UnitMember[];
  isLeader: boolean;
  currentTripMemberId: string;
  onSelfJoin?: (unitId: string) => void;
  onLeave?: (type: 'ROOM' | 'RIDE') => void;
  onReassign?: (tripMemberId: string, targetUnitId: string) => void;
  onDelete?: (unitId: string) => void;
}

export function AllocationUnitCard({
  id,
  type,
  label,
  capacity,
  occupancy,
  remainingCapacity,
  isOverbooked,
  overCapacityBy,
  note,
  members,
  isLeader,
  currentTripMemberId,
  onSelfJoin,
  onLeave,
  onReassign,
  onDelete,
}: AllocationUnitCardProps) {
  const isFull = remainingCapacity <= 0 && !isOverbooked;
  const isCurrentMemberHere = members.some(
    (m) => m.tripMemberId === currentTripMemberId,
  );

  const typeColors =
    type === 'ROOM'
      ? 'bg-brand-blue/5 border-brand-blue/20 hover:border-brand-blue/40'
      : 'bg-brand-yellow/5 border-brand-yellow/20 hover:border-brand-yellow/40';

  const typeBadgeColors =
    type === 'ROOM'
      ? 'bg-brand-blue/10 text-brand-blue'
      : 'bg-brand-yellow/10 text-brand-coral';

  const overBookedStyles = isOverbooked
    ? 'ring-2 ring-brand-coral/30 border-brand-coral/40'
    : '';

  return (
    <div
      className={`rounded-2xl border p-4 transition-all shadow-sm hover:shadow-md ${typeColors} ${overBookedStyles}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold ${typeBadgeColors}`}
          >
            {type === 'ROOM' ? 'Phòng' : 'Xe'}
          </span>
          <h3 className="font-black text-gray-900 text-sm">{label}</h3>
        </div>
        <div className="flex items-center gap-1">
          <Users size={14} className="text-gray-400" />
          <span
            className={`text-xs font-bold ${
              isOverbooked
                ? 'text-brand-coral'
                : isFull
                  ? 'text-gray-500'
                  : 'text-brand-green'
            }`}
          >
            {occupancy}/{capacity} chỗ
          </span>
        </div>
      </div>

      {/* Overbooked warning */}
      {isOverbooked && (
        <div className="flex items-center gap-2 px-3 py-2 bg-brand-coral/10 rounded-xl mb-3">
          <AlertTriangle size={14} className="text-brand-coral shrink-0" />
          <span className="text-xs font-bold text-brand-coral">
            Đang quá số chỗ (+{overCapacityBy})
          </span>
        </div>
      )}

      {/* Note */}
      {note && (
        <p className="text-xs text-gray-500 mb-3 leading-relaxed">{note}</p>
      )}

      {/* Members */}
      <div className="flex flex-wrap gap-1.5 mb-3 min-h-[32px]">
        {members.length === 0 ? (
          <p className="text-xs text-gray-400 italic">Chưa có ai</p>
        ) : (
          members.map((member) => (
            <MemberChip
              key={member.assignmentId}
              name={member.name}
              avatarUrl={member.avatarUrl}
              source={member.source}
              role={member.role}
              compact
              onRemove={
                isLeader
                  ? () => onReassign?.(member.tripMemberId, '')
                  : undefined
              }
            />
          ))
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
        {!isLeader && !isCurrentMemberHere && remainingCapacity > 0 && (
          <button
            onClick={() => onSelfJoin?.(id)}
            className="flex items-center gap-1 px-3 py-1.5 bg-brand-green/10 text-brand-green text-xs font-bold rounded-xl hover:bg-brand-green/20 transition-colors"
          >
            <Plus size={12} />
            Vào chỗ này
          </button>
        )}

        {!isLeader && isCurrentMemberHere && (
          <button
            onClick={() => onLeave?.(type)}
            className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-bold rounded-xl hover:bg-gray-200 transition-colors"
          >
            Rời chỗ này
          </button>
        )}

        {!isLeader && isFull && !isCurrentMemberHere && (
          <span className="text-xs text-gray-400 font-medium">Đã đầy</span>
        )}

        {isLeader && (
          <button
            onClick={() => onReassign?.('', id)}
            className="flex items-center gap-1 px-3 py-1.5 bg-brand-blue/10 text-brand-blue text-xs font-bold rounded-xl hover:bg-brand-blue/20 transition-colors"
          >
            <ArrowRightLeft size={12} />
            Chuyển chỗ
          </button>
        )}

        {isLeader && onDelete && (
          <button
            onClick={() => onDelete(id)}
            className="ml-auto px-2 py-1.5 text-gray-400 hover:text-brand-coral text-xs transition-colors"
            title="Xóa chỗ này"
          >
            Xóa
          </button>
        )}
      </div>
    </div>
  );
}
