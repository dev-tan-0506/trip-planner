'use client';

import { RefObject, useState } from 'react';
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
  GripVertical,
  ArrowUp,
  ArrowDown,
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
  onReorderItem: (itemId: string, dayIndex: number, targetIndex: number) => void;
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
  onDragStart,
  onDragEnd,
  onMoveUp,
  onMoveDown,
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
  onDragStart: () => void;
  onDragEnd: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const config = progressConfig[item.progress];

  return (
    <motion.div
      ref={isCurrent ? currentItemRef : undefined}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      draggable={canEdit}
      onDragStart={canEdit ? onDragStart : undefined}
      onDragEnd={canEdit ? onDragEnd : undefined}
      className={`relative bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-all group border-l-4 ${config.cardClass} ${
        isCurrent ? 'ring-2 ring-brand-green/30 shadow-md' : ''
      } ${canEdit ? 'cursor-grab active:cursor-grabbing' : ''}`}
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
        <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
          {canEdit && (
            <span
              className="p-1.5 text-gray-300"
              title="Giữ và kéo để đổi thứ tự"
            >
              <GripVertical size={14} />
            </span>
          )}
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
              <button
                onClick={onMoveUp}
                className="p-1.5 text-gray-400 hover:text-brand-blue hover:bg-brand-blue/10 rounded-lg transition-all"
                title="Đưa lên trên"
              >
                <ArrowUp size={14} />
              </button>
              <button
                onClick={onMoveDown}
                className="p-1.5 text-gray-400 hover:text-brand-blue hover:bg-brand-blue/10 rounded-lg transition-all"
                title="Đưa xuống dưới"
              >
                <ArrowDown size={14} />
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
  onReorderItem,
  onProposeChange,
}: TimelineDaySectionProps) {
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const dayLabel = getDayLabel(day.dayIndex, tripStartDate);

  return (
    <div className="relative space-y-3 pl-10">
      {/* Day Header */}
      <div className="relative flex items-center gap-3">
        <div className="absolute -left-10 top-1 flex h-8 w-8 items-center justify-center rounded-full border-4 border-white bg-brand-dark text-sm font-black text-white shadow-md">
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
        <div className="relative space-y-2">
          {day.items.map((item) => {
            const overlap = overlapWarnings.find((w) => w.itemId === item.id);
            const isCurrent = item.progress === 'dang di';
            const itemIndex = day.items.findIndex((dayItem) => dayItem.id === item.id);

            return (
              <div key={item.id} className="relative space-y-2 pb-3 last:pb-0">
                <div className="absolute -left-[34px] top-6 flex h-5 w-5 items-center justify-center rounded-full border-2 border-brand-blue/20 bg-white shadow-sm">
                  <div className="h-2.5 w-2.5 rounded-full bg-brand-blue" />
                </div>
                {canEdit && (
                  <div
                    onDragOver={(event) => {
                      event.preventDefault();
                      event.dataTransfer.dropEffect = 'move';
                      setDropIndex(itemIndex);
                    }}
                    onDragLeave={() => setDropIndex((current) => (current === itemIndex ? null : current))}
                    onDrop={(event) => {
                      event.preventDefault();
                      if (draggedItemId) {
                        onReorderItem(draggedItemId, day.dayIndex, itemIndex);
                      }
                      setDraggedItemId(null);
                      setDropIndex(null);
                    }}
                    className={`h-4 rounded-full transition-all ${
                      dropIndex === itemIndex ? 'bg-brand-blue/30' : 'bg-transparent'
                    }`}
                  />
                )}

                <div className="relative">
                  <ItemCard
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
                    onDragStart={() => setDraggedItemId(item.id)}
                    onDragEnd={() => {
                      setDraggedItemId(null);
                      setDropIndex(null);
                    }}
                    onMoveUp={() => onReorderItem(item.id, day.dayIndex, Math.max(itemIndex - 1, 0))}
                    onMoveDown={() => onReorderItem(item.id, day.dayIndex, Math.min(itemIndex + 1, day.items.length - 1))}
                  />
                </div>
              </div>
            );
          })}

          {canEdit && (
            <div
              onDragOver={(event) => {
                event.preventDefault();
                event.dataTransfer.dropEffect = 'move';
                setDropIndex(day.items.length);
              }}
              onDragLeave={() => setDropIndex((current) => (current === day.items.length ? null : current))}
              onDrop={(event) => {
                event.preventDefault();
                if (draggedItemId) {
                  onReorderItem(draggedItemId, day.dayIndex, day.items.length);
                }
                setDraggedItemId(null);
                setDropIndex(null);
              }}
              className={`rounded-xl border-2 border-dashed px-4 py-2 text-center text-xs font-bold transition-all ${
                dropIndex === day.items.length
                  ? 'border-brand-blue bg-brand-blue/10 text-brand-blue'
                  : 'border-transparent text-gray-400'
              }`}
            >
              Kéo thả hoạt động vào đây để đổi thứ tự
            </div>
          )}
        </div>
      )}
    </div>
  );
}
