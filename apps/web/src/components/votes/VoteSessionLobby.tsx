'use client';

import { useMemo, useState } from 'react';
import {
  VoteSession,
  CreateVoteSessionPayload,
  CreateVoteOptionPayload,
  ItineraryItem,
} from '../../lib/api-client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  Plus,
  CheckCircle2,
  AlertCircle,
  Crown,
  Users,
  Timer,
  Vote,
  Zap,
  Lock,
  Eye,
  Search,
  FileText,
  MapPin,
} from 'lucide-react';

interface VoteSessionLobbyProps {
  sessions: VoteSession[];
  tripId: string;
  isLeader: boolean;
  itineraryItems: ItineraryItem[];
  onSelectSession: (sessionId: string) => void;
  onCreateSession: (payload: {
    session: CreateVoteSessionPayload;
    options: CreateVoteOptionPayload[];
  }) => Promise<VoteSession>;
  onApproveSession: (sessionId: string) => Promise<void>;
}

function formatDeadline(deadline: string): string {
  const date = new Date(deadline);
  const now = new Date();
  const diff = date.getTime() - now.getTime();

  if (diff <= 0) return 'Đã hết hạn';

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 24) {
    const days = Math.ceil(hours / 24);
    return `Còn ${days} ngày`;
  }
  if (hours > 0) return `Còn ${hours}h ${minutes}p`;
  return `Còn ${minutes} phút`;
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'PENDING_APPROVAL':
      return {
        label: 'Chờ duyệt',
        color: 'bg-brand-yellow/10 text-brand-yellow border-brand-yellow/20',
        icon: <Clock size={12} />,
      };
    case 'OPEN':
      return {
        label: 'Đang mở',
        color: 'bg-brand-green/10 text-brand-green border-brand-green/20',
        icon: <Zap size={12} />,
      };
    case 'CLOSED':
      return {
        label: 'Đã đóng',
        color: 'bg-gray-100 text-gray-500 border-gray-200',
        icon: <Lock size={12} />,
      };
    case 'LEADER_DECISION_REQUIRED':
      return {
        label: 'Cần quyết định',
        color: 'bg-brand-coral/10 text-brand-coral border-brand-coral/20',
        icon: <Crown size={12} />,
      };
    default:
      return {
        label: status,
        color: 'bg-gray-100 text-gray-500',
        icon: null,
      };
  }
}

function timeToMinutes(time: string): number {
  const [hours = 0, minutes = 0] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

type DraftOption = {
  title: string;
  startTime: string;
  locationText: string;
  shortNote: string;
};

const emptyOption = (): DraftOption => ({
  title: '',
  startTime: '',
  locationText: '',
  shortNote: '',
});

export function VoteSessionLobby({
  sessions,
  isLeader,
  itineraryItems,
  onSelectSession,
  onCreateSession,
  onApproveSession,
}: VoteSessionLobbyProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [createMode, setCreateMode] = useState<'NEW_OPTION' | 'REPLACE_ITEM'>('NEW_OPTION');
  const [deadline, setDeadline] = useState('');
  const [description, setDescription] = useState('');
  const [targetDayIndex, setTargetDayIndex] = useState<number>(0);
  const [targetItemId, setTargetItemId] = useState('');
  const [itemSearch, setItemSearch] = useState('');
  const [options, setOptions] = useState<DraftOption[]>([emptyOption(), emptyOption()]);
  const [creating, setCreating] = useState(false);

  const pendingSessions = sessions.filter((s) => s.status === 'PENDING_APPROVAL');
  const activeSessions = sessions.filter((s) => s.status === 'OPEN');
  const closedSessions = sessions.filter(
    (s) => s.status === 'CLOSED' || s.status === 'LEADER_DECISION_REQUIRED',
  );

  const filteredItems = useMemo(() => {
    const q = itemSearch.trim().toLowerCase();
    if (!q) return itineraryItems;

    return itineraryItems.filter((item) => {
      return (
        item.title.toLowerCase().includes(q) ||
        (item.locationName || '').toLowerCase().includes(q) ||
        (item.locationAddress || '').toLowerCase().includes(q)
      );
    });
  }, [itemSearch, itineraryItems]);

  const validOptionCount = options.filter((option) => option.title.trim()).length;
  const canCreate =
    !!deadline &&
    validOptionCount >= 2 &&
    (createMode === 'NEW_OPTION' || !!targetItemId.trim());

  const handleCreate = async () => {
    if (!canCreate) return;

    setCreating(true);
    try {
      await onCreateSession({
        session: {
          mode: createMode,
          deadline: new Date(deadline).toISOString(),
          description: description.trim() || undefined,
          targetDayIndex: createMode === 'NEW_OPTION' ? targetDayIndex : undefined,
          targetItemId: createMode === 'REPLACE_ITEM' ? targetItemId.trim() : undefined,
        },
        options: options
          .filter((option) => option.title.trim())
          .map((option) => ({
            title: option.title.trim(),
            payload: {
              title: option.title.trim(),
              startMinute: option.startTime ? timeToMinutes(option.startTime) : undefined,
              locationName: option.locationText.trim() || undefined,
              locationAddress: option.locationText.trim() || undefined,
              shortNote: option.shortNote.trim() || undefined,
              voteDescription: description.trim() || undefined,
            },
          })),
      });

      setShowCreate(false);
      setCreateMode('NEW_OPTION');
      setDeadline('');
      setDescription('');
      setTargetDayIndex(0);
      setTargetItemId('');
      setItemSearch('');
      setOptions([emptyOption(), emptyOption()]);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-gradient-to-br from-brand-coral via-brand-coral/90 to-brand-yellow/80 rounded-3xl p-6 text-white relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full filter blur-2xl" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 rounded-full text-xs font-bold mb-3 backdrop-blur-sm">
            <Vote size={12} /> Phòng bình chọn
          </div>
          <h1 className="text-2xl font-black">Bình chọn cùng nhau! 🗳️</h1>
          <p className="text-white/80 text-sm mt-1">
            Tạo vote với mục đích rõ ràng, thêm các phương án, rồi cả nhóm cùng chọn.
          </p>
          <div className="flex items-center gap-4 mt-4 text-sm">
            <span className="flex items-center gap-1">
              <Zap size={14} /> {activeSessions.length} đang mở
            </span>
            <span className="flex items-center gap-1">
              <Timer size={14} /> {pendingSessions.length} chờ duyệt
            </span>
          </div>
        </div>
      </motion.div>

      <motion.button
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        onClick={() => setShowCreate(!showCreate)}
        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 font-bold text-brand-coral hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-[0.98]"
      >
        <Plus size={20} />
        Tạo phiên bình chọn mới
      </motion.button>

      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 space-y-4">
              <h3 className="font-black text-gray-900">Tạo bình chọn ✨</h3>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Vote này để làm gì?
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Ví dụ: Cả nhóm chọn quán ăn tối hoặc chọn hoạt động thay thế tối nay"
                  className="w-full mt-1 px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 focus:border-brand-coral focus:ring-1 focus:ring-brand-coral/30 outline-none text-sm resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setCreateMode('NEW_OPTION')}
                  className={`p-3 rounded-xl text-sm font-bold text-center transition-all ${
                    createMode === 'NEW_OPTION'
                      ? 'bg-brand-coral/10 text-brand-coral border-2 border-brand-coral/30'
                      : 'bg-gray-50 text-gray-600 border-2 border-transparent'
                  }`}
                >
                  🆕 Thêm mới
                </button>
                <button
                  onClick={() => setCreateMode('REPLACE_ITEM')}
                  className={`p-3 rounded-xl text-sm font-bold text-center transition-all ${
                    createMode === 'REPLACE_ITEM'
                      ? 'bg-brand-blue/10 text-brand-blue border-2 border-brand-blue/30'
                      : 'bg-gray-50 text-gray-600 border-2 border-transparent'
                  }`}
                >
                  🔄 Thay thế
                </button>
              </div>

              {createMode === 'NEW_OPTION' && (
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Ngày cần chèn hoạt động
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={targetDayIndex}
                    onChange={(e) => setTargetDayIndex(Number(e.target.value))}
                    className="w-full mt-1 px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 focus:border-brand-coral focus:ring-1 focus:ring-brand-coral/30 outline-none text-sm"
                  />
                </div>
              )}

              {createMode === 'REPLACE_ITEM' && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Chọn activity cần thay thế
                  </label>
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={itemSearch}
                      onChange={(e) => setItemSearch(e.target.value)}
                      placeholder="Tìm theo tên hoặc địa điểm"
                      className="w-full pl-9 pr-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/30 outline-none text-sm"
                    />
                  </div>
                  <div className="max-h-52 space-y-2 overflow-y-auto">
                    {filteredItems.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setTargetItemId(item.id)}
                        className={`w-full rounded-xl border p-3 text-left transition-all ${
                          targetItemId === item.id
                            ? 'border-brand-blue bg-brand-blue/5'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <p className="text-sm font-bold text-gray-900">{item.title}</p>
                        <p className="mt-1 text-xs text-gray-500">
                          Ngày {item.dayIndex + 1}
                          {item.startTime ? ` · ${item.startTime}` : ''}
                          {item.locationName ? ` · ${item.locationName}` : ''}
                        </p>
                      </button>
                    ))}
                    {filteredItems.length === 0 && (
                      <p className="rounded-xl bg-gray-50 px-3 py-2 text-xs text-gray-400">
                        Không tìm thấy activity phù hợp.
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Hạn chót
                </label>
                <input
                  type="datetime-local"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full mt-1 px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-200 focus:border-brand-coral focus:ring-1 focus:ring-brand-coral/30 outline-none text-sm"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Các option để cả nhóm chọn
                  </label>
                  <button
                    type="button"
                    onClick={() => setOptions((current) => [...current, emptyOption()])}
                    className="text-xs font-bold text-brand-coral"
                  >
                    + Thêm option
                  </button>
                </div>

                {options.map((option, index) => (
                  <div key={index} className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-gray-800">Option {index + 1}</p>
                      {options.length > 2 && (
                        <button
                          type="button"
                          onClick={() =>
                            setOptions((current) =>
                              current.filter((_, optionIndex) => optionIndex !== index),
                            )
                          }
                          className="text-xs font-bold text-brand-coral"
                        >
                          Xóa
                        </button>
                      )}
                    </div>

                    <input
                      type="text"
                      value={option.title}
                      onChange={(e) =>
                        setOptions((current) =>
                          current.map((entry, optionIndex) =>
                            optionIndex === index ? { ...entry, title: e.target.value } : entry,
                          ),
                        )
                      }
                      placeholder="Tên option"
                      className="w-full px-4 py-2.5 bg-white rounded-xl border border-gray-200 outline-none text-sm"
                    />

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 flex items-center gap-1 text-xs font-bold text-gray-500">
                          <Clock size={12} /> Giờ
                        </label>
                        <input
                          type="time"
                          value={option.startTime}
                          onChange={(e) =>
                            setOptions((current) =>
                              current.map((entry, optionIndex) =>
                                optionIndex === index ? { ...entry, startTime: e.target.value } : entry,
                              ),
                            )
                          }
                          className="w-full px-4 py-2.5 bg-white rounded-xl border border-gray-200 outline-none text-sm"
                        />
                      </div>
                      <div>
                        <label className="mb-1 flex items-center gap-1 text-xs font-bold text-gray-500">
                          <MapPin size={12} /> Địa chỉ / địa điểm
                        </label>
                        <input
                          type="text"
                          value={option.locationText}
                          onChange={(e) =>
                            setOptions((current) =>
                              current.map((entry, optionIndex) =>
                                optionIndex === index ? { ...entry, locationText: e.target.value } : entry,
                              ),
                            )
                          }
                          placeholder="Ví dụ: Chợ đêm Sơn Trà"
                          className="w-full px-4 py-2.5 bg-white rounded-xl border border-gray-200 outline-none text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-1 flex items-center gap-1 text-xs font-bold text-gray-500">
                        <FileText size={12} /> Mô tả option
                      </label>
                      <textarea
                        value={option.shortNote}
                        onChange={(e) =>
                          setOptions((current) =>
                            current.map((entry, optionIndex) =>
                              optionIndex === index ? { ...entry, shortNote: e.target.value } : entry,
                            ),
                          )
                        }
                        rows={2}
                        placeholder="Giải thích ngắn gọn vì sao nên chọn option này"
                        className="w-full px-4 py-2.5 bg-white rounded-xl border border-gray-200 outline-none text-sm resize-none"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleCreate}
                disabled={!canCreate || creating}
                className="w-full px-6 py-3 bg-brand-coral text-white rounded-xl font-bold hover:bg-brand-coral/90 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {creating ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Đang tạo...
                  </>
                ) : (
                  'Tạo bình chọn'
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isLeader && pendingSessions.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-black text-gray-500 uppercase tracking-wider flex items-center gap-2">
            <Crown size={14} className="text-brand-yellow" />
            Chờ duyệt ({pendingSessions.length})
          </h2>
          {pendingSessions.map((session, i) => {
            const badge = getStatusBadge(session.status);
            const sessionDescription =
              (session.options[0]?.payload?.voteDescription as string | undefined) || null;

            return (
              <motion.div
                key={session.id}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl shadow-md border border-brand-yellow/20 p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border ${badge.color}`}>
                      {badge.icon} {badge.label}
                    </span>
                    <p className="mt-1 font-bold text-gray-900 text-sm">
                      {session.mode === 'NEW_OPTION' ? '🆕 Thêm hoạt động mới' : '🔄 Thay thế hoạt động'}
                    </p>
                    {sessionDescription && (
                      <p className="mt-1 text-xs text-gray-500">{sessionDescription}</p>
                    )}
                  </div>
                  <span className="text-xs text-gray-400">{session.createdBy.name || 'Ẩn danh'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onApproveSession(session.id);
                    }}
                    className="flex-1 px-4 py-2 bg-brand-green text-white rounded-xl font-bold text-sm hover:bg-brand-green/90 transition-all active:scale-[0.98] flex items-center justify-center gap-1"
                  >
                    <CheckCircle2 size={14} /> Duyệt
                  </button>
                  <button
                    onClick={() => onSelectSession(session.id)}
                    className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-200 transition-all active:scale-[0.98] flex items-center gap-1"
                  >
                    <Eye size={14} /> Xem
                  </button>
                </div>
              </motion.div>
            );
          })}
        </section>
      )}

      {activeSessions.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-black text-gray-500 uppercase tracking-wider flex items-center gap-2">
            <Zap size={14} className="text-brand-green" />
            Đang bình chọn ({activeSessions.length})
          </h2>
          {activeSessions.map((session, i) => {
            const badge = getStatusBadge(session.status);
            const sessionDescription =
              (session.options[0]?.payload?.voteDescription as string | undefined) || null;
            return (
              <motion.button
                key={session.id}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => onSelectSession(session.id)}
                className="w-full text-left bg-white rounded-2xl shadow-md border border-brand-green/20 p-4 space-y-2 hover:shadow-lg hover:-translate-y-0.5 transition-all active:scale-[0.99]"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border ${badge.color}`}>
                      {badge.icon} {badge.label}
                    </span>
                    <p className="mt-1 font-bold text-gray-900 text-sm">
                      {session.mode === 'NEW_OPTION'
                        ? '🆕 Thêm hoạt động mới'
                        : session.mode === 'TIE_BREAK'
                          ? '⚡ Vòng hòa'
                          : '🔄 Thay thế hoạt động'}
                    </p>
                    {sessionDescription && (
                      <p className="mt-1 text-xs text-gray-500">{sessionDescription}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-brand-coral">
                      {formatDeadline(session.deadline)}
                    </span>
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                      <Users size={10} /> {session.ballots.length} phiếu
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">
                    {session.options.filter((o) => o.status === 'ACTIVE').length} phương án
                  </span>
                  <span className="text-xs text-gray-400">·</span>
                  <span className="text-xs text-gray-500">
                    Tạo bởi {session.createdBy.name || 'Ẩn danh'}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </section>
      )}

      {closedSessions.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-black text-gray-500 uppercase tracking-wider flex items-center gap-2">
            <AlertCircle size={14} className="text-gray-400" />
            Đã kết thúc ({closedSessions.length})
          </h2>
          {closedSessions.map((session, i) => {
            const badge = getStatusBadge(session.status);
            return (
              <motion.button
                key={session.id}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => onSelectSession(session.id)}
                className="w-full text-left bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-2 hover:shadow-md transition-all active:scale-[0.99] opacity-80 hover:opacity-100"
              >
                <div className="flex items-start justify-between">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border ${badge.color}`}>
                    {badge.icon} {badge.label}
                  </span>
                  <span className="text-xs text-gray-400">{session.ballots.length} phiếu</span>
                </div>
                <p className="font-bold text-gray-700 text-sm">
                  {session.mode === 'NEW_OPTION'
                    ? '🆕 Thêm hoạt động'
                    : session.mode === 'TIE_BREAK'
                      ? '⚡ Vòng hòa'
                      : '🔄 Thay thế hoạt động'}
                </p>
              </motion.button>
            );
          })}
        </section>
      )}

      {sessions.length === 0 && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center py-12 space-y-3"
        >
          <div className="inline-flex items-center justify-center p-4 bg-gray-100 rounded-full">
            <Vote size={32} className="text-gray-400" />
          </div>
          <p className="text-gray-500 font-bold">Chưa có phiên bình chọn nào</p>
          <p className="text-sm text-gray-400">
            Tạo vote đầu tiên với mô tả rõ ràng và ít nhất 2 phương án để cả nhóm cùng chọn.
          </p>
        </motion.div>
      )}
    </div>
  );
}
