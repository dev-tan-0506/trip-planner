'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  VoteSession,
  CreateVoteSessionPayload,
} from '../../lib/api-client';
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
} from 'lucide-react';

interface VoteSessionLobbyProps {
  sessions: VoteSession[];
  tripId: string;
  isLeader: boolean;
  onSelectSession: (sessionId: string) => void;
  onCreateSession: (payload: CreateVoteSessionPayload) => Promise<void>;
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

export function VoteSessionLobby({
  sessions,
  isLeader,
  onSelectSession,
  onCreateSession,
  onApproveSession,
}: VoteSessionLobbyProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [createMode, setCreateMode] = useState<'NEW_OPTION' | 'REPLACE_ITEM'>('NEW_OPTION');
  const [deadline, setDeadline] = useState('');
  const [targetDayIndex, setTargetDayIndex] = useState<number>(0);
  const [creating, setCreating] = useState(false);

  const pendingSessions = sessions.filter((s) => s.status === 'PENDING_APPROVAL');
  const activeSessions = sessions.filter((s) => s.status === 'OPEN');
  const closedSessions = sessions.filter(
    (s) => s.status === 'CLOSED' || s.status === 'LEADER_DECISION_REQUIRED',
  );

  const handleCreate = async () => {
    if (!deadline) return;
    setCreating(true);
    try {
      await onCreateSession({
        mode: createMode,
        deadline: new Date(deadline).toISOString(),
        targetDayIndex: createMode === 'NEW_OPTION' ? targetDayIndex : undefined,
      });
      setShowCreate(false);
      setDeadline('');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Section */}
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
            Vuốt trái hoặc phải để chọn phương án yêu thích
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

      {/* Create Session Button */}
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

      {/* Create Form */}
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
                    Ngày (Day Index)
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

              <button
                onClick={handleCreate}
                disabled={!deadline || creating}
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

      {/* Pending Approval (Leader) */}
      {isLeader && pendingSessions.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-black text-gray-500 uppercase tracking-wider flex items-center gap-2">
            <Crown size={14} className="text-brand-yellow" />
            Chờ duyệt ({pendingSessions.length})
          </h2>
          {pendingSessions.map((session, i) => {
            const badge = getStatusBadge(session.status);
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
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border ${badge.color}`}
                    >
                      {badge.icon} {badge.label}
                    </span>
                    <p className="mt-1 font-bold text-gray-900 text-sm">
                      {session.mode === 'NEW_OPTION' ? '🆕 Thêm hoạt động mới' : '🔄 Thay thế hoạt động'}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400">
                    {session.createdBy.name || 'Ẩn danh'}
                  </span>
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

      {/* Active Sessions */}
      {activeSessions.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-black text-gray-500 uppercase tracking-wider flex items-center gap-2">
            <Zap size={14} className="text-brand-green" />
            Đang bình chọn ({activeSessions.length})
          </h2>
          {activeSessions.map((session, i) => {
            const badge = getStatusBadge(session.status);
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
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border ${badge.color}`}
                    >
                      {badge.icon} {badge.label}
                    </span>
                    <p className="mt-1 font-bold text-gray-900 text-sm">
                      {session.mode === 'NEW_OPTION'
                        ? '🆕 Thêm hoạt động mới'
                        : session.mode === 'TIE_BREAK'
                          ? '⚡ Vòng hòa'
                          : '🔄 Thay thế hoạt động'}
                    </p>
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

      {/* Closed / Decision Required */}
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
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border ${badge.color}`}
                  >
                    {badge.icon} {badge.label}
                  </span>
                  <span className="text-xs text-gray-400">
                    {session.ballots.length} phiếu
                  </span>
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

      {/* Empty State */}
      {sessions.length === 0 && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 text-center space-y-3"
        >
          <div className="text-5xl">🗳️</div>
          <h3 className="text-lg font-black text-gray-900">
            Chưa có bình chọn nào
          </h3>
          <p className="text-sm text-gray-500">
            Tạo phiên bình chọn mới để mọi người cùng quyết định!
          </p>
        </motion.div>
      )}
    </div>
  );
}
