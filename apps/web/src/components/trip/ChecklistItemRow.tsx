'use client';

import { type ChangeEvent, useMemo, useState } from 'react';
import { Check, CheckCircle2, ImageUp, Pencil, Save, Trash2, User2, X } from 'lucide-react';
import { toApiAssetUrl, type ChecklistItem, type TripMember } from '../../lib/api-client';

interface ChecklistItemRowProps {
  item: ChecklistItem;
  groupKind?: 'SHARED_CATEGORY' | 'PERSONAL_TASKS' | 'DOCUMENTS';
  canManage: boolean;
  canToggle: boolean;
  isMine: boolean;
  members: TripMember[];
  onToggle: (itemId: string) => Promise<void> | void;
  onUpdate: (
    itemId: string,
    payload: { title?: string; notes?: string; assigneeTripMemberId?: string },
  ) => Promise<void> | void;
  onSubmitProof?: (itemId: string, imageDataUrl: string) => Promise<void> | void;
  onDelete?: (itemId: string) => Promise<void> | void;
}

export function ChecklistItemRow({
  item,
  groupKind,
  canManage,
  canToggle,
  isMine,
  members,
  onToggle,
  onUpdate,
  onSubmitProof,
  onDelete,
}: ChecklistItemRowProps) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(item.title);
  const [notes, setNotes] = useState(item.notes ?? '');
  const [assigneeTripMemberId, setAssigneeTripMemberId] = useState(item.assignee?.tripMemberId ?? '');
  const [saving, setSaving] = useState(false);
  const [uploadingProof, setUploadingProof] = useState(false);

  const statusLabel = item.status === 'DONE' ? 'Đã xong' : 'Đang chờ';

  const assigneeName = useMemo(() => {
    if (item.assignee?.name) return item.assignee.name;
    if (item.assignee) return 'Thành viên';
    return 'Chưa giao';
  }, [item.assignee]);

  const saveChanges = async () => {
    setSaving(true);
    try {
      await onUpdate(item.id, {
        title: title.trim(),
        notes: notes.trim() || undefined,
        assigneeTripMemberId: assigneeTripMemberId || '',
      });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const resetEditing = () => {
    setTitle(item.title);
    setNotes(item.notes ?? '');
    setAssigneeTripMemberId(item.assignee?.tripMemberId ?? '');
    setEditing(false);
  };

  const handleProofPicked = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !onSubmitProof) return;
    setUploadingProof(true);
    try {
      const reader = new FileReader();
      const dataUrl = await new Promise<string>((resolve, reject) => {
        reader.onload = () =>
          typeof reader.result === 'string'
            ? resolve(reader.result)
            : reject(new Error('Không đọc được ảnh'));
        reader.onerror = () => reject(new Error('Không đọc được ảnh'));
        reader.readAsDataURL(file);
      });
      await onSubmitProof(item.id, dataUrl);
    } finally {
      setUploadingProof(false);
      event.target.value = '';
    }
  };

  return (
    <div
      className={`rounded-2xl border p-3 transition-all ${
        item.status === 'DONE'
          ? 'border-brand-green/20 bg-brand-green/5'
          : isMine
            ? 'border-brand-blue/25 bg-brand-blue/5'
            : 'border-gray-100 bg-white'
      }`}
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          disabled={!canToggle}
          onClick={() => onToggle(item.id)}
          className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl transition-all ${
            item.status === 'DONE'
              ? 'bg-brand-green text-white'
              : canToggle
                ? 'bg-gray-100 text-gray-500 hover:bg-brand-blue/10 hover:text-brand-blue'
                : 'bg-gray-100 text-gray-300'
          }`}
          title={canToggle ? 'Đổi trạng thái hoàn thành' : 'Bạn không thể đánh dấu việc này'}
        >
          {item.status === 'DONE' ? <CheckCircle2 size={16} /> : <Check size={16} />}
        </button>

        <div className="min-w-0 flex-1 space-y-2">
          {editing ? (
            <div className="space-y-2">
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-900 outline-none focus:border-brand-blue"
                placeholder="Tên vật dụng / việc cần làm"
              />
              <input
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none focus:border-brand-blue"
                placeholder="Ghi chú ngắn"
              />
              <select
                value={assigneeTripMemberId}
                onChange={(event) => setAssigneeTripMemberId(event.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none focus:border-brand-blue"
              >
                <option value="">Chưa giao ai</option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.user.name || 'Thành viên'}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <p
                  className={`text-sm font-bold ${
                    item.status === 'DONE' ? 'text-gray-500 line-through' : 'text-gray-900'
                  }`}
                >
                  {item.title}
                </p>
                <span
                  className={`rounded-full px-2 py-1 text-[11px] font-black ${
                    item.status === 'DONE'
                      ? 'bg-brand-green/15 text-brand-green'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {statusLabel}
                </span>
                {isMine && (
                  <span className="rounded-full bg-brand-blue/10 px-2 py-1 text-[11px] font-black text-brand-blue">
                    Việc của tôi
                  </span>
                )}
              </div>
              {item.notes && <p className="text-sm text-gray-500">{item.notes}</p>}
              {groupKind === 'DOCUMENTS' && item.proofUrl && (
                <a
                  href={toApiAssetUrl(item.proofUrl) ?? '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex text-xs font-bold text-brand-blue hover:underline"
                >
                  Xem giấy tờ đã nộp
                </a>
              )}
            </>
          )}

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 font-semibold text-gray-600">
              <User2 size={12} />
              {editing
                ? members.find((member) => member.id === assigneeTripMemberId)?.user.name ||
                  (assigneeTripMemberId ? 'Thành viên' : 'Chưa giao')
                : assigneeName}
            </span>
            {item.completedAt && (
              <span className="rounded-full bg-brand-green/10 px-2 py-1 font-semibold text-brand-green">
                Hoàn tất lúc {new Date(item.completedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            {groupKind === 'DOCUMENTS' && item.proofSubmittedAt && (
              <span className="rounded-full bg-brand-blue/10 px-2 py-1 font-semibold text-brand-blue">
                Đã nộp giấy tờ
              </span>
            )}
          </div>
        </div>

        {(canManage || (groupKind === 'DOCUMENTS' && isMine && onSubmitProof)) && (
          <div className="flex items-center gap-1">
            {groupKind === 'DOCUMENTS' && isMine && onSubmitProof && !editing && (
              <label className="cursor-pointer rounded-xl bg-brand-blue/10 p-2 text-brand-blue transition-all hover:bg-brand-blue/20">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleProofPicked}
                />
                <ImageUp size={14} className={uploadingProof ? 'animate-pulse' : ''} />
              </label>
            )}
            {editing ? (
              <>
                <button
                  type="button"
                  disabled={saving || !title.trim()}
                  onClick={saveChanges}
                  className="rounded-xl bg-brand-dark p-2 text-white transition-all hover:bg-brand-dark/90 disabled:opacity-60"
                  title="Lưu"
                >
                  <Save size={14} className={saving ? 'animate-pulse' : ''} />
                </button>
                <button
                  type="button"
                  onClick={resetEditing}
                  className="rounded-xl bg-gray-100 p-2 text-gray-500 transition-all hover:bg-gray-200"
                  title="Hủy"
                >
                  <X size={14} />
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="rounded-xl bg-gray-100 p-2 text-gray-500 transition-all hover:bg-gray-200"
                  title="Chỉnh sửa"
                >
                  <Pencil size={14} />
                </button>
                {onDelete && (
                  <button
                    type="button"
                    onClick={() => onDelete(item.id)}
                    className="rounded-xl bg-brand-coral/10 p-2 text-brand-coral transition-all hover:bg-brand-coral/20"
                    title="Xóa"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
