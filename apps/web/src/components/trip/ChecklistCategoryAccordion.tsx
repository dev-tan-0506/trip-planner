'use client';

import { useMemo, useState } from 'react';
import { ChevronDown, Plus } from 'lucide-react';
import type { ChecklistGroupSnapshot, ChecklistItem, TripMember } from '../../lib/api-client';
import { ChecklistItemRow } from './ChecklistItemRow';

interface ChecklistCategoryAccordionProps {
  group: ChecklistGroupSnapshot;
  canManage: boolean;
  members: TripMember[];
  onlyMine: boolean;
  currentTripMemberId: string;
  onCreateItem: (
    groupId: string,
    payload: {
      title: string;
      notes?: string;
      assigneeTripMemberId?: string;
      applyToAllMembers?: boolean;
    },
  ) => Promise<void> | void;
  onToggleItem: (itemId: string) => Promise<void> | void;
  onUpdateItem: (
    itemId: string,
    payload: { title?: string; notes?: string; assigneeTripMemberId?: string },
  ) => Promise<void> | void;
  onDeleteItem: (itemId: string) => Promise<void> | void;
  onSubmitProof?: (itemId: string, imageDataUrl: string) => Promise<void> | void;
}

export function ChecklistCategoryAccordion({
  group,
  canManage,
  members,
  onlyMine,
  currentTripMemberId,
  onCreateItem,
  onToggleItem,
  onUpdateItem,
  onDeleteItem,
  onSubmitProof,
}: ChecklistCategoryAccordionProps) {
  const [open, setOpen] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [assigneeTripMemberId, setAssigneeTripMemberId] = useState('');
  const [applyToAllMembers, setApplyToAllMembers] = useState(group.kind === 'DOCUMENTS');

  const visibleItems = useMemo(
    () =>
      group.items.filter((item) =>
        onlyMine ? item.assignee?.tripMemberId === currentTripMemberId : true,
      ),
    [currentTripMemberId, group.items, onlyMine],
  );

  const submitItem = async () => {
    if (!title.trim()) return;
    await onCreateItem(group.id, {
      title: title.trim(),
      notes: notes.trim() || undefined,
      assigneeTripMemberId: assigneeTripMemberId || undefined,
      applyToAllMembers: group.kind === 'DOCUMENTS' ? applyToAllMembers : undefined,
    });
    setTitle('');
    setNotes('');
    setAssigneeTripMemberId('');
    setApplyToAllMembers(group.kind === 'DOCUMENTS');
    setShowCreate(false);
    setOpen(true);
  };

  return (
    <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
      >
        <div>
          <p className="text-sm font-black text-gray-900">{group.title}</p>
          <p className="text-xs text-gray-500">
            {group.completedCount}/{group.itemCount} đã hoàn tất
          </p>
        </div>
        <div className="flex items-center gap-3">
          {canManage && (
            <span
              onClick={(event) => {
                event.stopPropagation();
                setShowCreate((value) => !value);
                setOpen(true);
              }}
              className="inline-flex items-center gap-1 rounded-full bg-brand-blue/10 px-3 py-1 text-xs font-black text-brand-blue"
            >
              <Plus size={12} />
              Thêm vật dụng
            </span>
          )}
          <ChevronDown
            size={18}
            className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {open && (
        <div className="space-y-3 border-t border-gray-100 px-5 py-4">
          {showCreate && canManage && (
            <div className="space-y-2 rounded-2xl border border-brand-blue/15 bg-brand-blue/5 p-4">
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Tên vật dụng / đầu việc"
                className="w-full rounded-xl border border-white bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-brand-blue"
              />
              <input
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Ghi chú"
                className="w-full rounded-xl border border-white bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-brand-blue"
              />
              <select
                value={assigneeTripMemberId}
                onChange={(event) => setAssigneeTripMemberId(event.target.value)}
                className="w-full rounded-xl border border-white bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-brand-blue"
              >
                <option value="">Chưa giao ai</option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.user.name || 'Thành viên'}
                  </option>
                ))}
              </select>
              {group.kind === 'DOCUMENTS' && (
                <label className="inline-flex items-center gap-2 text-xs font-semibold text-gray-600">
                  <input
                    type="checkbox"
                    checked={applyToAllMembers}
                    onChange={(event) => setApplyToAllMembers(event.target.checked)}
                    className="accent-brand-blue"
                  />
                  Tạo yêu cầu cho cả nhóm
                </label>
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={submitItem}
                  className="rounded-xl bg-brand-dark px-4 py-2 text-sm font-bold text-white"
                >
                  Lưu vật dụng
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-gray-500"
                >
                  Hủy
                </button>
              </div>
            </div>
          )}

          {visibleItems.length === 0 ? (
            <div className="rounded-2xl bg-gray-50 px-4 py-6 text-center text-sm text-gray-400">
              {onlyMine
                ? 'Hiện chưa có việc nào giao cho bạn trong nhóm này.'
                : 'Nhóm này chưa có vật dụng nào.'}
            </div>
          ) : (
            <div className="space-y-3">
              {visibleItems.map((item: ChecklistItem) => (
                <ChecklistItemRow
                  key={item.id}
                  item={item}
                  groupKind={group.kind}
                  canManage={canManage}
                  canToggle={canManage || item.assignee?.tripMemberId === currentTripMemberId}
                  isMine={item.assignee?.tripMemberId === currentTripMemberId}
                  members={members}
                  onToggle={onToggleItem}
                  onUpdate={onUpdateItem}
                  onSubmitProof={onSubmitProof}
                  onDelete={onDeleteItem}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
