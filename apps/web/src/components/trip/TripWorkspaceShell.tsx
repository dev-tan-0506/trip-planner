'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarDays,
  Map as MapIcon,
  MessageSquarePlus,
  Plus,
  Loader2,
  Bell,
  RefreshCw,
  Upload,
  Vote,
  BedDouble,
} from 'lucide-react';
import {
  itineraryApi,
  proposalsApi,
  templatesApi,
  votesApi,
  ItinerarySnapshot,
  Proposal,
  PublishedTemplateStatus,
  Trip,
  VoteSession,
} from '../../lib/api-client';
import { TimelineDaySection } from './TimelineDaySection';
import { ItineraryComposerSheet } from './ItineraryComposerSheet';
import { ItineraryItemEditor } from './ItineraryItemEditor';
import { DeleteItineraryItemDialog } from './DeleteItineraryItemDialog';
import { ProposalComposerSheet } from './ProposalComposerSheet';
import { ProposalInboxPanel } from './ProposalInboxPanel';
import { PublishTemplateDialog } from '../templates/PublishTemplateDialog';
import Link from 'next/link';
import { LogisticsBoardTab } from './LogisticsBoardTab';
import { ChecklistTab } from './ChecklistTab';
import { AttendanceTab } from './AttendanceTab';
import { FinanceSafetyTab } from './FinanceSafetyTab';

type Tab =
  | 'Lich trinh'
  | 'Ban do'
  | 'De xuat'
  | 'Phan phong'
  | 'Checklist'
  | 'Check-in'
  | 'Quy an toan';

interface TripWorkspaceShellProps {
  trip: Trip;
  joinCode: string;
}

export function TripWorkspaceShell({ trip, joinCode }: TripWorkspaceShellProps) {
  const [activeTab, setActiveTab] = useState<Tab>('Lich trinh');
  const [snapshot, setSnapshot] = useState<ItinerarySnapshot | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Composer states
  const [showComposer, setShowComposer] = useState(false);
  const [composerDayIndex, setComposerDayIndex] = useState(0);
  const [composerInsertAfterId, setComposerInsertAfterId] = useState<string | undefined>();

  // Editor states
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);

  // Proposal composer states
  const [showProposalComposer, setShowProposalComposer] = useState(false);
  const [proposalTargetItemId, setProposalTargetItemId] = useState<string | undefined>();
  const [proposalTargetVersion, setProposalTargetVersion] = useState<number | undefined>();

  // Proposal inbox states
  const [showProposalInbox, setShowProposalInbox] = useState(false);
  const [showPublishTemplateDialog, setShowPublishTemplateDialog] = useState(false);
  const [publishedTemplate, setPublishedTemplate] = useState<PublishedTemplateStatus | null>(null);
  const [voteSessions, setVoteSessions] = useState<VoteSession[]>([]);
  const [attendanceOverlayOpen, setAttendanceOverlayOpen] = useState(false);

  const timelineRef = useRef<HTMLDivElement>(null);
  const currentItemRef = useRef<HTMLDivElement>(null);

  const tripId = trip.id;

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [snap, props] = await Promise.all([
        itineraryApi.getSnapshot(tripId),
        proposalsApi.listProposals(tripId),
      ]);
      setSnapshot(snap);
      setProposals(props);
      const sessions = await votesApi.listSessions(tripId).catch(() => []);
      setVoteSessions(sessions);
      if (snap.isLeader) {
        const template = await templatesApi.getPublishedForTrip(tripId).catch(() => null);
        setPublishedTemplate(template);
      } else {
        setPublishedTemplate(null);
      }
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

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      const hasOpenOverlay =
        showComposer ||
        !!editingItemId ||
        !!deletingItemId ||
        showProposalComposer ||
        showProposalInbox ||
        showPublishTemplateDialog ||
        attendanceOverlayOpen;

      if (!document.hidden && !hasOpenOverlay) {
        fetchData();
      }
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [
    deletingItemId,
    editingItemId,
    fetchData,
    showComposer,
    showProposalComposer,
    showProposalInbox,
    showPublishTemplateDialog,
    attendanceOverlayOpen,
  ]);

  // Auto-scroll to current item after snapshot load
  useEffect(() => {
    if (snapshot && currentItemRef.current) {
      setTimeout(() => {
        currentItemRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }, 300);
    }
  }, [snapshot]);

  const handleSnapshotUpdate = (newSnapshot: ItinerarySnapshot) => {
    setSnapshot(newSnapshot);
  };

  const handleReorderItem = useCallback(
    async (itemId: string, dayIndex: number, targetIndex: number) => {
      if (!snapshot) return;

      const nextDays = snapshot.days.map((day) => ({
        ...day,
        items: [...day.items],
      }));

      let movedItem = null as (typeof nextDays)[number]['items'][number] | null;

      for (const day of nextDays) {
        const sourceIndex = day.items.findIndex((item) => item.id === itemId);
        if (sourceIndex !== -1) {
          movedItem = day.items[sourceIndex] ?? null;
          day.items.splice(sourceIndex, 1);
          break;
        }
      }

      if (!movedItem) return;

      const targetDay = nextDays.find((day) => day.dayIndex === dayIndex);
      if (!targetDay) return;

      const safeTargetIndex = Math.max(0, Math.min(targetIndex, targetDay.items.length));
      targetDay.items.splice(safeTargetIndex, 0, movedItem);

      const payload = nextDays.flatMap((day) =>
        day.items.map((item, index) => ({
          itemId: item.id,
          dayIndex: day.dayIndex,
          sortOrder: index + 1,
        })),
      );

      try {
        const reordered = await itineraryApi.reorder(tripId, { items: payload });
        setSnapshot(reordered);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Không thể sắp xếp lại lịch trình');
      }
    },
    [snapshot, tripId],
  );

  const pendingProposalCount = proposals.filter((p) => p.status === 'PENDING').length;
  const openVoteCount = voteSessions.filter(
    (session) => session.status === 'OPEN' || session.status === 'PENDING_APPROVAL',
  ).length;

  // Find the editing item from snapshot
  const editingItem = editingItemId
    ? snapshot?.days
        .flatMap((d) => d.items)
        .find((item) => item.id === editingItemId) ?? null
    : null;

  // Find the deleting item from snapshot
  const deletingItem = deletingItemId
    ? snapshot?.days
        .flatMap((d) => d.items)
        .find((item) => item.id === deletingItemId) ?? null
    : null;

  const tabs: { key: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { key: 'Lich trinh', label: 'Lịch trình', icon: <CalendarDays size={18} /> },
    { key: 'Ban do', label: 'Bản đồ', icon: <MapIcon size={18} /> },
    {
      key: 'De xuat',
      label: 'Đề xuất',
      icon: <MessageSquarePlus size={18} />,
      badge: pendingProposalCount,
    },
    {
      key: 'Phan phong',
      label: 'Phân phòng/xe',
      icon: <BedDouble size={18} />,
    },
    {
      key: 'Checklist',
      label: 'Checklist',
      icon: <CalendarDays size={18} />,
    },
    {
      key: 'Check-in',
      label: 'Check-in',
      icon: <MapIcon size={18} />,
    },
    {
      key: 'Quy an toan',
      label: 'Quỹ & an toàn',
      icon: <Bell size={18} />,
    },
  ];

  if (loading && !snapshot) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="text-brand-blue animate-spin" />
      </div>
    );
  }

  if (error && !snapshot) {
    return (
      <div className="text-center py-20">
        <p className="text-brand-coral font-medium mb-4">{error}</p>
        <button onClick={fetchData} className="text-brand-blue font-bold hover:underline">
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Tab Bar */}
      <div className="flex items-center gap-1 bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === tab.key
                ? 'bg-brand-dark text-white shadow-md'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            {tab.icon}
            {tab.label}
            {tab.badge !== undefined && tab.badge > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-brand-coral text-white text-xs rounded-full font-bold min-w-[20px] text-center">
                {tab.badge}
              </span>
            )}
          </button>
        ))}

        {/* Refresh */}
        <button
          onClick={fetchData}
          disabled={loading}
          className="ml-auto p-2 text-gray-400 hover:text-brand-blue hover:bg-brand-blue/10 rounded-xl transition-all"
          title="Làm mới"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {snapshot?.isLeader ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            href={`/trip/${joinCode}/votes`}
            className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white px-4 py-4 shadow-sm transition-all hover:shadow-md"
          >
            <div>
              <p className="text-sm font-black text-gray-900">Bình chọn hoạt động</p>
              <p className="text-xs text-gray-500">Tạo vote session và xem kết quả trực tiếp</p>
            </div>
            <Vote size={18} className="text-brand-coral" />
          </Link>

          <button
            onClick={() => {
              if (!publishedTemplate) {
                setShowPublishTemplateDialog(true);
              }
            }}
            disabled={!!publishedTemplate}
            className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white px-4 py-4 text-left shadow-sm transition-all hover:shadow-md disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:shadow-sm"
          >
            <div>
              <p className="text-sm font-black text-gray-900">
                {publishedTemplate ? 'Đã chia sẻ template' : 'Xuất bản template'}
              </p>
              <p className="text-xs text-gray-500">
                {publishedTemplate
                  ? `Template hiện tại: ${publishedTemplate.title}`
                  : 'Chia sẻ hành trình này lên thư viện cộng đồng'}
              </p>
            </div>
            <Upload size={18} className="text-brand-blue" />
          </button>
        </div>
      ) : (
        <Link
          href={`/trip/${joinCode}/votes`}
          className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white px-4 py-4 shadow-sm transition-all hover:shadow-md"
        >
          <div>
            <p className="text-sm font-black text-gray-900">Đi tới khu bình chọn</p>
            <p className="text-xs text-gray-500">Vuốt hoặc bấm để chọn phương án cho cả nhóm</p>
          </div>
          <Vote size={18} className="text-brand-coral" />
        </Link>
      )}

      <Link
        href={`/trip/${joinCode}/votes`}
        className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 rounded-2xl bg-brand-coral px-4 py-3 text-sm font-black text-white shadow-2xl shadow-brand-coral/30 transition-all hover:-translate-y-0.5 hover:bg-brand-coral/90"
      >
        <Vote size={18} />
        {openVoteCount > 0 ? `${openVoteCount} vote đang mở` : 'Mở bình chọn'}
      </Link>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'Lich trinh' && snapshot && (
          <motion.div
            key="timeline"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            ref={timelineRef}
            className="space-y-4"
          >
            {/* Leader quick-create FAB */}
            {snapshot.canEdit && (
              <button
                onClick={() => {
                  setComposerDayIndex(0);
                  setComposerInsertAfterId(undefined);
                  setShowComposer(true);
                }}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-brand-coral to-brand-yellow text-white rounded-2xl font-bold shadow-lg shadow-brand-coral/20 hover:shadow-xl transition-all active:scale-[0.98]"
              >
                <Plus size={20} />
                Thêm hoạt động
              </button>
            )}

            {/* Member proposal CTA */}
            {!snapshot.canEdit && (
              <button
                onClick={() => {
                  setProposalTargetItemId(undefined);
                  setProposalTargetVersion(undefined);
                  setShowProposalComposer(true);
                }}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-brand-blue to-brand-green text-white rounded-2xl font-bold shadow-lg shadow-brand-blue/20 hover:shadow-xl transition-all active:scale-[0.98]"
              >
                <MessageSquarePlus size={20} />
                Đề xuất hoạt động mới
              </button>
            )}

            {/* Timeline days */}
            {snapshot.days.length === 0 ? (
              <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center space-y-4">
                <CalendarDays size={48} className="mx-auto text-gray-300" />
                <h3 className="text-xl font-black text-gray-900">Chưa có lịch trình nào</h3>
                <p className="text-gray-500">
                  {snapshot.canEdit
                    ? 'Bấm "Thêm hoạt động" để bắt đầu lên kế hoạch!'
                    : 'Chờ trưởng đoàn lên lịch trình nhé!'}
                </p>
              </div>
            ) : (
              <div className="relative space-y-6">
                <div className="absolute left-4 top-6 bottom-6 w-px bg-gradient-to-b from-brand-blue/30 via-brand-blue/20 to-brand-coral/10" />
                {snapshot.days.map((day) => (
                  <TimelineDaySection
                    key={day.dayIndex}
                    day={day}
                    tripStartDate={trip.startDate}
                    canEdit={snapshot.canEdit}
                    overlapWarnings={snapshot.overlapWarnings}
                    currentItemRef={currentItemRef}
                    joinCode={joinCode}
                    onAddItem={(dayIndex, insertAfterId) => {
                      setComposerDayIndex(dayIndex);
                      setComposerInsertAfterId(insertAfterId);
                      setShowComposer(true);
                    }}
                    onEditItem={(itemId) => setEditingItemId(itemId)}
                    onDeleteItem={(itemId) => setDeletingItemId(itemId)}
                    onReorderItem={handleReorderItem}
                    onProposeChange={(itemId, version) => {
                      setProposalTargetItemId(itemId);
                      setProposalTargetVersion(version);
                      setShowProposalComposer(true);
                    }}
                  />
                ))}
              </div>
            )}

            {/* Proposal inbox badge for leaders */}
            {snapshot.isLeader && pendingProposalCount > 0 && (
              <button
                onClick={() => setShowProposalInbox(true)}
                className="fixed bottom-24 right-6 flex items-center gap-2 px-5 py-3.5 bg-brand-dark text-white rounded-2xl font-bold shadow-2xl shadow-brand-dark/30 hover:shadow-3xl transition-all active:scale-95 z-40"
              >
                <Bell size={18} />
                {pendingProposalCount} đề xuất mới
              </button>
            )}
          </motion.div>
        )}

        {activeTab === 'Ban do' && (
          <motion.div
            key="map"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Link
              href={`/trip/${joinCode}/map`}
              className="flex items-center justify-center gap-3 py-16 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group"
            >
              <MapIcon size={32} className="text-brand-blue group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <p className="font-black text-gray-900 text-lg">Mở Bản đồ toàn màn hình</p>
                <p className="text-gray-500 text-sm">
                  Xem {snapshot?.mapItems.length ?? 0} địa điểm trên bản đồ
                </p>
              </div>
            </Link>
          </motion.div>
        )}

        {activeTab === 'De xuat' && (
          <motion.div
            key="proposals"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <ProposalInboxPanel
              tripId={tripId}
              proposals={proposals}
              isLeader={snapshot?.isLeader ?? false}
              onUpdate={fetchData}
            />
          </motion.div>
        )}

        {activeTab === 'Phan phong' && (
          <motion.div
            key="logistics"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <LogisticsBoardTab tripId={tripId} />
          </motion.div>
        )}

        {activeTab === 'Checklist' && (
          <motion.div
            key="checklist"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <ChecklistTab tripId={tripId} members={trip.members} />
          </motion.div>
        )}

        {activeTab === 'Check-in' && (
          <motion.div
            key="attendance"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <AttendanceTab
              tripId={tripId}
              onOverlayChange={setAttendanceOverlayOpen}
            />
          </motion.div>
        )}

        {activeTab === 'Quy an toan' && (
          <motion.div
            key="finance-safety"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <FinanceSafetyTab tripId={tripId} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Composer Sheet */}
      <ItineraryComposerSheet
        open={showComposer}
        onClose={() => setShowComposer(false)}
        tripId={tripId}
        tripStartDate={trip.startDate}
        tripEndDate={trip.endDate}
        dayIndex={composerDayIndex}
        insertAfterItemId={composerInsertAfterId}
        onSuccess={handleSnapshotUpdate}
      />

      {/* Editor */}
      {editingItem && snapshot && (
        <ItineraryItemEditor
          open={!!editingItemId}
          onClose={() => setEditingItemId(null)}
          tripId={tripId}
          item={editingItem}
          overlapWarnings={snapshot.overlapWarnings.filter(
            (w) => w.itemId === editingItemId || w.conflictsWith === editingItemId,
          )}
          onSuccess={handleSnapshotUpdate}
        />
      )}

      {/* Delete Dialog */}
      {deletingItem && (
        <DeleteItineraryItemDialog
          open={!!deletingItemId}
          onClose={() => setDeletingItemId(null)}
          tripId={tripId}
          item={deletingItem}
          onSuccess={handleSnapshotUpdate}
        />
      )}

      {/* Proposal Composer */}
      <ProposalComposerSheet
        open={showProposalComposer}
        onClose={() => setShowProposalComposer(false)}
        tripId={tripId}
        tripStartDate={trip.startDate}
        tripEndDate={trip.endDate}
        targetItemId={proposalTargetItemId}
        targetVersion={proposalTargetVersion}
        onSuccess={() => {
          setShowProposalComposer(false);
          fetchData();
        }}
      />

      {/* Proposal Inbox (leader-only bottom sheet) */}
      {showProposalInbox && (
        <ProposalInboxPanel
          tripId={tripId}
          proposals={proposals}
          isLeader={snapshot?.isLeader ?? false}
          onUpdate={fetchData}
          asModal
          onClose={() => setShowProposalInbox(false)}
        />
      )}

      {snapshot?.isLeader && (
        <PublishTemplateDialog
          tripId={tripId}
          tripName={trip.name}
          open={showPublishTemplateDialog}
          onClose={() => setShowPublishTemplateDialog(false)}
          publishedTemplate={publishedTemplate}
          onPublished={(template) => {
            setPublishedTemplate({
              id: template.id,
              title: template.title,
              status: template.status,
              createdAt: template.createdAt,
            });
            setShowPublishTemplateDialog(false);
          }}
        />
      )}
    </div>
  );
}
