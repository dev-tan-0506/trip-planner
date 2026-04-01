'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Clock,
  GripVertical,
  Map as MapIcon,
  MapPin,
  MessageSquarePlus,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import type { RefObject } from 'react';
import type { DayGroup, HealthWarning, ItineraryItem, OverlapWarning } from '../../lib/api-client';
import { HealthConflictBadge } from './HealthConflictBadge';

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
} as const;

interface TimelineDaySectionProps {
  day: DayGroup;
  tripStartDate: string;
  canEdit: boolean;
  overlapWarnings: OverlapWarning[];
  healthWarnings: HealthWarning[];
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

function DropZone({
  dayIndex,
  index,
  label,
}: {
  dayIndex: number;
  index: number;
  label?: string;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: `drop-${dayIndex}-${index}`,
    data: {
      type: 'dropzone',
      dayIndex,
      index,
    },
  });

  return (
    <div
      ref={setNodeRef}
      data-dropzone={`day-${dayIndex}-index-${index}`}
      className={`rounded-xl border-2 border-dashed px-4 text-center text-xs font-bold transition-all ${
        isOver
          ? 'border-brand-blue bg-brand-blue/10 py-3 text-brand-blue'
          : label
            ? 'border-transparent py-3 text-gray-400'
            : 'border-transparent py-2 text-transparent'
      }`}
    >
      {label ?? 'Drop zone'}
    </div>
  );
}

function EmptyDayDropZone({
  dayIndex,
  canEdit,
  onAddItem,
}: {
  dayIndex: number;
  canEdit: boolean;
  onAddItem: (dayIndex: number) => void;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: `drop-${dayIndex}-0`,
    data: {
      type: 'dropzone',
      dayIndex,
      index: 0,
    },
  });

  return (
    <div
      ref={setNodeRef}
      data-dropzone={`empty-day-${dayIndex}`}
      className={`rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
        isOver ? 'border-brand-blue bg-brand-blue/10' : 'border-gray-200 bg-white'
      }`}
    >
      <p className="mb-2 text-sm text-gray-400">Chưa có hoạt động nào</p>
      {canEdit && (
        <button
          onClick={() => onAddItem(dayIndex)}
          className="text-sm font-bold text-brand-blue hover:underline"
        >
          + Thêm hoạt động đầu tiên
        </button>
      )}
    </div>
  );
}

function SortableItemCard({
  item,
  canEdit,
  hasOverlap,
  overlapMessage,
  healthWarnings,
  isCurrent,
  currentItemRef,
  joinCode,
  onEdit,
  onDelete,
  onPropose,
  onAddAfter,
  onMoveUp,
  onMoveDown,
}: {
  item: ItineraryItem;
  canEdit: boolean;
  hasOverlap: boolean;
  overlapMessage?: string;
  healthWarnings: HealthWarning[];
  isCurrent: boolean;
  currentItemRef: RefObject<HTMLDivElement | null>;
  joinCode: string;
  onEdit: () => void;
  onDelete: () => void;
  onPropose: () => void;
  onAddAfter: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const config = progressConfig[item.progress];
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
    disabled: !canEdit,
    data: {
      type: 'item',
      itemId: item.id,
      dayIndex: item.dayIndex,
      index: item.sortOrder - 1,
    },
  });

  return (
    <motion.div
      ref={(node) => {
        setNodeRef(node);
        if (isCurrent) {
          currentItemRef.current = node;
        }
      }}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      data-sortable-id={item.id}
      className={`group relative rounded-2xl border border-gray-100 border-l-4 bg-white p-4 shadow-sm transition-all hover:shadow-md ${config.cardClass} ${
        isCurrent ? 'ring-2 ring-brand-green/30 shadow-md' : ''
      } ${isDragging ? 'z-20 shadow-xl ring-2 ring-brand-blue/25' : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-sm font-bold text-gray-900">{item.title}</h4>
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${config.chipClass}`}
            >
              {config.emoji} {config.label}
            </span>
            {item.proposalCount > 0 && (
              <span className="rounded-full border border-brand-coral/20 bg-brand-coral/10 px-1.5 py-0.5 text-[10px] font-bold text-brand-coral">
                {item.proposalCount} đề xuất
              </span>
            )}
          </div>

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

          {item.shortNote && <p className="text-xs italic text-gray-400">{item.shortNote}</p>}

          {healthWarnings.length > 0 && (
            <div className="space-y-2">
              {healthWarnings.map((warning) => (
                <HealthConflictBadge key={`${warning.itemId}-${warning.severity}-${warning.title}`} warning={warning} />
              ))}
            </div>
          )}

          {hasOverlap && (
            <div className="flex items-center gap-1.5 text-[10px] font-medium text-brand-yellow">
              <AlertTriangle size={12} />
              {overlapMessage}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
          {canEdit && (
            <button
              type="button"
              {...attributes}
              {...listeners}
              data-drag-handle={item.id}
              className="cursor-grab p-1.5 text-gray-300 active:cursor-grabbing"
              title="Giữ và kéo để đổi thứ tự"
            >
              <GripVertical size={14} />
            </button>
          )}
          {item.lat != null && item.lng != null && (
            <Link
              href={`/trip/${joinCode}/map?focusItemId=${item.id}`}
              className="rounded-lg p-1.5 text-gray-400 transition-all hover:bg-brand-blue/10 hover:text-brand-blue"
              title="Xem trên bản đồ"
            >
              <MapIcon size={14} />
            </Link>
          )}
          {canEdit ? (
            <>
              <button
                onClick={onEdit}
                className="rounded-lg p-1.5 text-gray-400 transition-all hover:bg-brand-blue/10 hover:text-brand-blue"
                title="Chỉnh sửa"
              >
                <Pencil size={14} />
              </button>
              <button
                onClick={onDelete}
                className="rounded-lg p-1.5 text-gray-400 transition-all hover:bg-brand-coral/10 hover:text-brand-coral"
                title="Xoá"
              >
                <Trash2 size={14} />
              </button>
              <button
                onClick={onAddAfter}
                className="rounded-lg p-1.5 text-gray-400 transition-all hover:bg-brand-green/10 hover:text-brand-green"
                title="Thêm bên dưới"
              >
                <Plus size={14} />
              </button>
              <button
                onClick={onMoveUp}
                className="rounded-lg p-1.5 text-gray-400 transition-all hover:bg-brand-blue/10 hover:text-brand-blue"
                title="Đưa lên trên"
              >
                <ArrowUp size={14} />
              </button>
              <button
                onClick={onMoveDown}
                className="rounded-lg p-1.5 text-gray-400 transition-all hover:bg-brand-blue/10 hover:text-brand-blue"
                title="Đưa xuống dưới"
              >
                <ArrowDown size={14} />
              </button>
            </>
          ) : (
            <button
              onClick={onPropose}
              className="rounded-lg p-1.5 text-gray-400 transition-all hover:bg-brand-blue/10 hover:text-brand-blue"
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
  healthWarnings,
  currentItemRef,
  joinCode,
  onAddItem,
  onEditItem,
  onDeleteItem,
  onReorderItem,
  onProposeChange,
}: TimelineDaySectionProps) {
  const dayLabel = getDayLabel(day.dayIndex, tripStartDate);

  return (
    <div className="relative space-y-3 pl-10">
      <div className="relative flex items-center gap-3">
        <div className="absolute -left-10 top-1 flex h-8 w-8 items-center justify-center rounded-full border-4 border-white bg-brand-dark text-sm font-black text-white shadow-md">
          {day.dayIndex + 1}
        </div>
        <div>
          <h3 className="text-sm font-black text-gray-900">Ngày {day.dayIndex + 1}</h3>
          <p className="text-xs text-gray-500">{dayLabel}</p>
        </div>
        {canEdit && (
          <button
            onClick={() => onAddItem(day.dayIndex)}
            className="ml-auto rounded-xl p-2 text-brand-coral transition-all hover:bg-brand-coral/10"
            title="Thêm hoạt động"
          >
            <Plus size={18} />
          </button>
        )}
      </div>

      {day.items.length === 0 ? (
        <EmptyDayDropZone dayIndex={day.dayIndex} canEdit={canEdit} onAddItem={onAddItem} />
      ) : (
        <SortableContext items={day.items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
          <div className="relative space-y-2" data-day-container={day.dayIndex}>
            {canEdit && <DropZone dayIndex={day.dayIndex} index={0} />}
            {day.items.map((item, itemIndex) => {
              const overlap = overlapWarnings.find((warning) => warning.itemId === item.id);
              const itemHealthWarnings = healthWarnings.filter((warning) => warning.itemId === item.id);
              const isCurrent = item.progress === 'dang di';

              return (
                <div key={item.id} className="relative space-y-2 pb-3 last:pb-0">
                  <div className="absolute -left-[34px] top-6 flex h-5 w-5 items-center justify-center rounded-full border-2 border-brand-blue/20 bg-white shadow-sm">
                    <div className="h-2.5 w-2.5 rounded-full bg-brand-blue" />
                  </div>

                  <SortableItemCard
                    item={item}
                    canEdit={canEdit}
                    hasOverlap={!!overlap}
                    overlapMessage={overlap?.message}
                    healthWarnings={itemHealthWarnings}
                    isCurrent={isCurrent}
                    currentItemRef={currentItemRef}
                    joinCode={joinCode}
                    onEdit={() => onEditItem(item.id)}
                    onDelete={() => onDeleteItem(item.id)}
                    onPropose={() => onProposeChange(item.id, item.version)}
                    onAddAfter={() => onAddItem(day.dayIndex, item.id)}
                    onMoveUp={() => onReorderItem(item.id, day.dayIndex, Math.max(itemIndex - 1, 0))}
                    onMoveDown={() => onReorderItem(item.id, day.dayIndex, Math.min(itemIndex + 1, day.items.length - 1))}
                  />

                  {canEdit && <DropZone dayIndex={day.dayIndex} index={itemIndex + 1} />}
                </div>
              );
            })}

            {canEdit && (
              <DropZone
                dayIndex={day.dayIndex}
                index={day.items.length}
                label="Kéo thả hoạt động vào đây để đổi thứ tự"
              />
            )}
          </div>
        </SortableContext>
      )}
    </div>
  );
}
