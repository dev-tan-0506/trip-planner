'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ClipboardList, Loader2, Plus, RefreshCw } from 'lucide-react';
import {
  checklistsApi,
  ChecklistSnapshot,
  TripMember,
} from '../../lib/api-client';
import { ChecklistCategoryAccordion } from './ChecklistCategoryAccordion';
import { ChecklistItemRow } from './ChecklistItemRow';

interface ChecklistTabProps {
  tripId: string;
  members: TripMember[];
}

export function ChecklistTab({ tripId, members }: ChecklistTabProps) {
  const [snapshot, setSnapshot] = useState<ChecklistSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [onlyMine, setOnlyMine] = useState(false);
  const [showSharedGroupForm, setShowSharedGroupForm] = useState(false);
  const [showPersonalGroupForm, setShowPersonalGroupForm] = useState(false);
  const [showDocumentGroupForm, setShowDocumentGroupForm] = useState(false);
  const [sharedGroupTitle, setSharedGroupTitle] = useState('');
  const [personalGroupTitle, setPersonalGroupTitle] = useState('');
  const [documentGroupTitle, setDocumentGroupTitle] = useState('Giấy tờ');

  const fetchSnapshot = useCallback(async () => {
    try {
      setLoading(true);
      const next = await checklistsApi.getSnapshot(tripId);
      setSnapshot(next);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải checklist');
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    fetchSnapshot();
  }, [fetchSnapshot]);

  const runAction = useCallback(
    async (task: () => Promise<ChecklistSnapshot>) => {
      try {
        const next = await task();
        setSnapshot(next);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Không thể cập nhật checklist');
      }
    },
    [],
  );

  const currentTripMemberId = snapshot?.currentTripMemberId ?? '';
  const filteredPersonalGroups = useMemo(
    () =>
      snapshot?.personalTasks.map((group) => ({
        ...group,
        items: group.items.filter((item) =>
          onlyMine ? item.assignee?.tripMemberId === currentTripMemberId : true,
        ),
      })) ?? [],
    [currentTripMemberId, onlyMine, snapshot?.personalTasks],
  );

  const isEmpty =
    !!snapshot &&
    snapshot.sharedCategories.length === 0 &&
    snapshot.personalTasks.length === 0 &&
    snapshot.documentGroups.length === 0;

  if (loading && !snapshot) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 size={28} className="animate-spin text-brand-blue" />
      </div>
    );
  }

  if (error && !snapshot) {
    return (
      <div className="rounded-3xl bg-white p-10 text-center shadow-sm">
        <p className="mb-4 text-sm font-semibold text-brand-coral">{error}</p>
        <button onClick={fetchSnapshot} className="font-bold text-brand-blue">
          Thử lại
        </button>
      </div>
    );
  }

  if (!snapshot) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-gray-900">Checklist</h2>
          <p className="text-sm text-gray-500">
            {snapshot.completedItems}/{snapshot.totalItems} đầu việc đã hoàn tất
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!snapshot.isLeader && (
            <label className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-semibold text-gray-600 shadow-sm">
              <input
                type="checkbox"
                checked={onlyMine}
                onChange={(event) => setOnlyMine(event.target.checked)}
                className="accent-brand-blue"
              />
              Chỉ xem việc của tôi
            </label>
          )}
          <button
            type="button"
            onClick={fetchSnapshot}
            className="rounded-2xl bg-white p-3 text-gray-400 shadow-sm transition-all hover:text-brand-blue"
            title="Làm mới"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-brand-coral/20 bg-brand-coral/10 px-4 py-3 text-sm font-medium text-brand-coral">
          {error}
        </div>
      )}

      {isEmpty && (
        <div className="rounded-3xl border border-gray-100 bg-white px-6 py-14 text-center shadow-sm">
          <ClipboardList size={44} className="mx-auto text-gray-300" />
          <h3 className="mt-4 text-xl font-black text-gray-900">Checklist còn trống</h3>
          <p className="mt-2 text-sm text-gray-500">
            {snapshot.isLeader
              ? 'Tạo nhóm đồ chung hoặc khu việc cá nhân để cả nhóm cùng chuẩn bị.'
              : 'Trưởng nhóm chưa tạo checklist cho chuyến đi này.'}
          </p>
        </div>
      )}

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-black text-gray-900">Giấy tờ cần nộp</p>
            <p className="text-xs text-gray-500">Leader tạo yêu cầu, từng thành viên nộp ảnh giấy tờ của mình vào đây</p>
          </div>
          {snapshot.isLeader && (
            <button
              type="button"
              onClick={() => setShowDocumentGroupForm((value) => !value)}
              className="inline-flex items-center gap-2 rounded-2xl bg-brand-dark px-4 py-2 text-sm font-black text-white"
            >
              <Plus size={14} />
              Thêm nhóm giấy tờ
            </button>
          )}
        </div>

        {showDocumentGroupForm && snapshot.isLeader && (
          <div className="rounded-2xl border border-brand-dark/10 bg-gray-50 p-4">
            <input
              value={documentGroupTitle}
              onChange={(event) => setDocumentGroupTitle(event.target.value)}
              placeholder="Ví dụ: CCCD / hộ chiếu"
              className="w-full rounded-xl border border-white bg-white px-3 py-2 text-sm outline-none focus:border-brand-dark"
            />
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() =>
                  runAction(() =>
                    checklistsApi.createGroup(tripId, {
                      title: documentGroupTitle.trim(),
                      kind: 'DOCUMENTS',
                    }),
                  ).then(() => {
                    setDocumentGroupTitle('Giấy tờ');
                    setShowDocumentGroupForm(false);
                  })
                }
                className="rounded-xl bg-brand-dark px-4 py-2 text-sm font-bold text-white"
              >
                Lưu nhóm giấy tờ
              </button>
              <button
                type="button"
                onClick={() => setShowDocumentGroupForm(false)}
                className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-gray-500"
              >
                Hủy
              </button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {snapshot.documentGroups.map((group) => (
            <ChecklistCategoryAccordion
              key={group.id}
              group={group}
              canManage={snapshot.isLeader}
              members={members}
              onlyMine={onlyMine}
              currentTripMemberId={currentTripMemberId}
              onCreateItem={(groupId, payload) =>
                runAction(() => checklistsApi.createItem(tripId, { groupId, ...payload }))
              }
              onToggleItem={(itemId) => runAction(() => checklistsApi.toggleItem(tripId, itemId))}
              onUpdateItem={(itemId, payload) =>
                runAction(() => checklistsApi.updateItem(tripId, itemId, payload))
              }
              onDeleteItem={(itemId) => runAction(() => checklistsApi.deleteItem(tripId, itemId))}
              onSubmitProof={(itemId, imageDataUrl) =>
                runAction(() => checklistsApi.submitProof(tripId, itemId, { imageDataUrl }))
              }
            />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-black text-gray-900">Đồ chung theo nhóm</p>
            <p className="text-xs text-gray-500">Ví dụ: Giấy tờ, y tế, đồ ăn, điện tử</p>
          </div>
          {snapshot.isLeader && (
            <button
              type="button"
              onClick={() => setShowSharedGroupForm((value) => !value)}
              className="inline-flex items-center gap-2 rounded-2xl bg-brand-blue px-4 py-2 text-sm font-black text-white"
            >
              <Plus size={14} />
              Thêm nhóm
            </button>
          )}
        </div>

        {showSharedGroupForm && snapshot.isLeader && (
          <div className="rounded-2xl border border-brand-blue/15 bg-brand-blue/5 p-4">
            <input
              value={sharedGroupTitle}
              onChange={(event) => setSharedGroupTitle(event.target.value)}
              placeholder="Ví dụ: Giấy tờ"
              className="w-full rounded-xl border border-white bg-white px-3 py-2 text-sm outline-none focus:border-brand-blue"
            />
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() =>
                  runAction(() =>
                    checklistsApi.createGroup(tripId, {
                      title: sharedGroupTitle.trim(),
                      kind: 'SHARED_CATEGORY',
                    }),
                  ).then(() => {
                    setSharedGroupTitle('');
                    setShowSharedGroupForm(false);
                  })
                }
                className="rounded-xl bg-brand-dark px-4 py-2 text-sm font-bold text-white"
              >
                Lưu nhóm
              </button>
              <button
                type="button"
                onClick={() => setShowSharedGroupForm(false)}
                className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-gray-500"
              >
                Hủy
              </button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {snapshot.sharedCategories.map((group) => (
            <ChecklistCategoryAccordion
              key={group.id}
              group={group}
              canManage={snapshot.isLeader}
              members={members}
              onlyMine={onlyMine}
              currentTripMemberId={currentTripMemberId}
              onCreateItem={(groupId, payload) =>
                runAction(() => checklistsApi.createItem(tripId, { groupId, ...payload }))
              }
              onToggleItem={(itemId) => runAction(() => checklistsApi.toggleItem(tripId, itemId))}
              onUpdateItem={(itemId, payload) =>
                runAction(() => checklistsApi.updateItem(tripId, itemId, payload))
              }
              onDeleteItem={(itemId) => runAction(() => checklistsApi.deleteItem(tripId, itemId))}
              onSubmitProof={(itemId, imageDataUrl) =>
                runAction(() => checklistsApi.submitProof(tripId, itemId, { imageDataUrl }))
              }
            />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-black text-gray-900">Việc cá nhân</p>
            <p className="text-xs text-gray-500">Khu riêng cho những việc cần giao cụ thể</p>
          </div>
          {snapshot.isLeader && (
            <button
              type="button"
              onClick={() => setShowPersonalGroupForm((value) => !value)}
              className="inline-flex items-center gap-2 rounded-2xl bg-brand-yellow px-4 py-2 text-sm font-black text-white"
            >
              <Plus size={14} />
              Thêm nhóm việc
            </button>
          )}
        </div>

        {showPersonalGroupForm && snapshot.isLeader && (
          <div className="rounded-2xl border border-brand-yellow/20 bg-brand-yellow/10 p-4">
            <input
              value={personalGroupTitle}
              onChange={(event) => setPersonalGroupTitle(event.target.value)}
              placeholder="Ví dụ: Chuẩn bị trước giờ đi"
              className="w-full rounded-xl border border-white bg-white px-3 py-2 text-sm outline-none focus:border-brand-yellow"
            />
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() =>
                  runAction(() =>
                    checklistsApi.createGroup(tripId, {
                      title: personalGroupTitle.trim(),
                      kind: 'PERSONAL_TASKS',
                    }),
                  ).then(() => {
                    setPersonalGroupTitle('');
                    setShowPersonalGroupForm(false);
                  })
                }
                className="rounded-xl bg-brand-dark px-4 py-2 text-sm font-bold text-white"
              >
                Lưu nhóm việc
              </button>
              <button
                type="button"
                onClick={() => setShowPersonalGroupForm(false)}
                className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-gray-500"
              >
                Hủy
              </button>
            </div>
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-[1.35fr_0.95fr]">
          <div className="space-y-4">
            {filteredPersonalGroups.map((group) => (
              <ChecklistCategoryAccordion
                key={group.id}
                group={group}
                canManage={snapshot.isLeader}
                members={members}
                onlyMine={onlyMine}
                currentTripMemberId={currentTripMemberId}
                onCreateItem={(groupId, payload) =>
                  runAction(() => checklistsApi.createItem(tripId, { groupId, ...payload }))
                }
                onToggleItem={(itemId) => runAction(() => checklistsApi.toggleItem(tripId, itemId))}
                onUpdateItem={(itemId, payload) =>
                  runAction(() => checklistsApi.updateItem(tripId, itemId, payload))
                }
                onDeleteItem={(itemId) => runAction(() => checklistsApi.deleteItem(tripId, itemId))}
                onSubmitProof={(itemId, imageDataUrl) =>
                  runAction(() => checklistsApi.submitProof(tripId, itemId, { imageDataUrl }))
                }
              />
            ))}
          </div>

          <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="mb-4">
              <p className="text-sm font-black text-gray-900">Tóm tắt việc của tôi</p>
              <p className="text-xs text-gray-500">Những gì đang giao cho bạn trong chuyến đi</p>
            </div>
            <div className="space-y-3">
              {snapshot.myItems.length === 0 ? (
                <div className="rounded-2xl bg-gray-50 px-4 py-6 text-center text-sm text-gray-400">
                  Hiện chưa có việc nào được giao riêng cho bạn.
                </div>
              ) : (
                snapshot.myItems.map((item) => (
                  <ChecklistItemRow
                    key={item.itemId}
                    item={{
                      id: item.itemId,
                      title: item.title,
                      notes: item.notes,
                      status: item.status,
                      sortOrder: item.sortOrder,
                      proofUrl: null,
                      proofSubmittedAt: null,
                      assignee:
                        members.find((member) => member.id === currentTripMemberId)?.user
                          ? {
                              tripMemberId: currentTripMemberId,
                              userId:
                                members.find((member) => member.id === currentTripMemberId)?.user.id ??
                                '',
                              name:
                                members.find((member) => member.id === currentTripMemberId)?.user
                                  .name ?? null,
                              avatarUrl:
                                members.find((member) => member.id === currentTripMemberId)?.user
                                  .avatarUrl ?? null,
                            }
                          : null,
                      completedAt: null,
                    }}
                    canManage={false}
                    canToggle
                    isMine
                    members={members}
                    onToggle={(itemId) => runAction(() => checklistsApi.toggleItem(tripId, itemId))}
                    onUpdate={async () => {}}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
