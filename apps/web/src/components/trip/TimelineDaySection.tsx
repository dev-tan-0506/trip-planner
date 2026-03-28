'use client';

import { RefObject } from 'react';
import { motion } from 'framer-motion';
import {
  Clock,
  MapPin,
  Pencil,
  Trash2,
  Plus,
  MessageSquarePlus,
  AlertTriangle,
  Map as MapIcon,
} from 'lucide-react';
import type { DayGroup, OverlapWarning, ItineraryItem } from '../../lib/api-client';
import Link from 'next/link';

const progressConfig = {
  'sap toi': {
    label: 'Sắp tới',
    chipClass: 'bg-brand-blue/10 text-brand-blue border-brand-blue/20',
    cardClass: 'border-l-brand-blue',
    emoji: '🔜',
  },
  'dang di': {
    label: 'Đang diễn ra',
    chipClass: 'bg-brand-green/10 text-brand-green border-brand-green/20',
    cardClass: 'border-l-brand-green',
    emoji: '🟢',
  },
  'da di': {
    label: 'Đã xong',
    chipClass: 'bg-gray-100 text-gray-500 border-gray-200',
    cardClass: 'border-l-gray-300 opacity-70',
    emoji: '✅',
  },
  'chua chot gio': {
    label: 'Chưa chốt giờ',
    chipClass: 'bg-brand-yellow/10 text-brand-yellow border-brand-yellow/20',
    cardClass: 'border-l-brand-yellow/50',
    emoji: '⏳',
  },
};

interface TimelineDaySectionProps {
  day: DayGroup;
  tripStartDate: string;
  canEdit: boolean;
  overlapWarnings: OverlapWarning[];
  currentItemRef: RefObject<HTMLDivElement | null>;
  joinCode: string;
  onAddItem: (dayIndex: number, insertAfterId?: string) => void;
  onEditItem: (itemId: string) => void;
  onDeleteItem: (itemId: string) => void;
  onProposeChange: (itemId: string, version: number) => void;
}

function getDayLabel(dayIndex: number, tripStartDate: string): string {
  const date = new Date(tripStartDate);
  date.setDate(date.getDate() + dayIndex);
  return date.toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

function ItemCard({
  item,
  canEdit,
  hasOverlap,
  overlapMessage,
  isCurrent,
  currentItemRef,
  joinCode,
  onEdit,
  onDelete,
  onPropose,
  onAddAfter,
}: {
  item: ItineraryItem;
  canEdit: boolean;
  hasOverlap: boolean;
  overlapMessage?: string;
  isCurrent: boolean;
  currentItemRef: RefObject<HTMLDivElement | null>;
  joinCode: string;
  onEdit: () => void;
  onDelete: () => void;
  onPropose: () => void;
  onAddAfter: () => void;
}) {
  const config = progressConfig[item.progress];

  return (
    <motion.div
      ref={isCurrent ? currentItemRef : undefined}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`relative bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-all group border-l-4 ${config.cardClass} ${
        isCurrent ? 'ring-2 ring-brand-green/30 shadow-md' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0 space-y-2">
          {/* Title + Progress Chip */}
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-bold text-gray-900 text-sm">{item.title}</h4>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${config.chipClass}`}
            >
              {config.emoji} {config.label}
            </span>
            {item.proposalCount > 0 && (
              <span className="px-1.5 py-0.5 bg-brand-coral/10 text-brand-coral text-[10px] font-bold rounded-full border border-brand-coral/20">
                {item.proposalCount} đề xuất
              </span>
            )}
          </div>

          {/* Time + Location */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
            {item.startTime && (
              <span className="flex items-center gap-1">
                <Clock size={12} /> {item.startTime}
              </span>
            )}
            {item.locationName && (
              <span className="flex items-center gap-1">
                <MapPin size={12} /> {item.locationName}
              </span>
            )}
          </div>

          {/* Note */}
          {item.shortNote && (
            <p className="text-xs text-gray-400 italic">{item.shortNote}</p>
          )}

          {/* Overlap warning */}
          {hasOverlap && (
            <div className="flex items-center gap-1.5 text-[10px] text-brand-yellow font-medium">
              <AlertTriangle size={12} />
              {overlapMessage}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {item.lat != null && item.lng != null && (
            <Link
              href={`/trip/${joinCode}/map?focusItemId=${item.id}`}
              className="p-1.5 text-gray-400 hover:text-brand-blue hover:bg-brand-blue/10 rounded-lg transition-all"
              title="Xem trên bản đồ"
            >
              <MapIcon size={14} />
            </Link>
          )}
          {canEdit ? (
            <>
              <button
                onClick={onEdit}
                className="p-1.5 text-gray-400 hover:text-brand-blue hover:bg-brand-blue/10 rounded-lg transition-all"
                title="Chỉnh sửa"
              >
                <Pencil size={14} />
              </button>
              <button
                onClick={onDelete}
                className="p-1.5 text-gray-400 hover:text-brand-coral hover:bg-brand-coral/10 rounded-lg transition-all"
                title="Xoá"
              >
                <Trash2 size={14} />
              </button>
              <button
                onClick={onAddAfter}
                className="p-1.5 text-gray-400 hover:text-brand-green hover:bg-brand-green/10 rounded-lg transition-all"
                title="Thêm bên dưới"
              >
                <Plus size={14} />
              </button>
            </>
          ) : (
            <button
              onClick={onPropose}
              className="p-1.5 text-gray-400 hover:text-brand-blue hover:bg-brand-blue/10 rounded-lg transition-all"
              title="Đề xuất thay đổi"
            >
              <MessageSquarePlus size={14} />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function TimelineDaySection({
  day,
  tripStartDate,
  canEdit,
  overlapWarnings,
  currentItemRef,
  joinCode,
  onAddItem,
  onEditItem,
  onDeleteItem,
  onProposeChange,
}: TimelineDaySectionProps) {
  const dayLabel = getDayLabel(day.dayIndex, tripStartDate);

  return (
    <div className="space-y-3">
      {/* Day Header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 bg-brand-dark text-white rounded-xl font-black text-sm shadow-md">
          {day.dayIndex + 1}
        </div>
        <div>
          <h3 className="font-black text-gray-900 text-sm">Ngày {day.dayIndex + 1}</h3>
          <p className="text-xs text-gray-500">{dayLabel}</p>
        </div>
        {canEdit && (
          <button
            onClick={() => onAddItem(day.dayIndex)}
            className="ml-auto p-2 text-brand-coral hover:bg-brand-coral/10 rounded-xl transition-all"
            title="Thêm hoạt động"
          >
            <Plus size={18} />
          </button>
        )}
      </div>

      {/* Items */}
      {day.items.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-8 text-center">
          <p className="text-gray-400 text-sm mb-2">Chưa có hoạt động nào</p>
          {canEdit && (
            <button
              onClick={() => onAddItem(day.dayIndex)}
              className="text-brand-blue text-sm font-bold hover:underline"
            >
              + Thêm hoạt động đầu tiên
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {day.items.map((item) => {
            const overlap = overlapWarnings.find((w) => w.itemId === item.id);
            const isCurrent = item.progress === 'dang di';

            return (
              <ItemCard
                key={item.id}
                item={item}
                canEdit={canEdit}
                hasOverlap={!!overlap}
                overlapMessage={overlap?.message}
                isCurrent={isCurrent}
                currentItemRef={currentItemRef}
                joinCode={joinCode}
                onEdit={() => onEditItem(item.id)}
                onDelete={() => onDeleteItem(item.id)}
                onPropose={() => onProposeChange(item.id, item.version)}
                onAddAfter={() => onAddItem(day.dayIndex, item.id)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
