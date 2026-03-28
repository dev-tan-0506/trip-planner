'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';
import { proposalsApi, Proposal } from '../../lib/api-client';

interface ProposalInboxPanelProps {
  tripId: string;
  proposals: Proposal[];
  isLeader: boolean;
  onUpdate: () => void;
  asModal?: boolean;
  onClose?: () => void;
}

const typeLabels: Record<string, string> = {
  ADD_ITEM: '➕ Thêm hoạt động',
  UPDATE_TIME: '🕐 Đổi giờ',
  UPDATE_LOCATION: '📍 Đổi địa điểm',
  UPDATE_NOTE: '📝 Sửa ghi chú',
};

const statusConfig: Record<string, { label: string; className: string }> = {
  PENDING: { label: 'Chờ duyệt', className: 'bg-brand-yellow/10 text-brand-yellow' },
  ACCEPTED: { label: 'Đã duyệt', className: 'bg-brand-green/10 text-brand-green' },
  REJECTED: { label: 'Từ chối', className: 'bg-brand-coral/10 text-brand-coral' },
  OUTDATED: { label: 'Hết hạn', className: 'bg-gray-100 text-gray-500' },
};

function ProposalCard({
  proposal,
  tripId,
  isLeader,
  onUpdate,
}: {
  proposal: Proposal;
  tripId: string;
  isLeader: boolean;
  onUpdate: () => void;
}) {
  const [acting, setActing] = useState(false);

  const handleAccept = async () => {
    setActing(true);
    try {
      await proposalsApi.acceptProposal(tripId, proposal.id);
      onUpdate();
    } catch {
      // swallow, user can retry
    } finally {
      setActing(false);
    }
  };

  const handleReject = async () => {
    setActing(true);
    try {
      await proposalsApi.rejectProposal(tripId, proposal.id);
      onUpdate();
    } catch {
      // swallow
    } finally {
      setActing(false);
    }
  };

  const status = statusConfig[proposal.status] ?? { label: 'Chờ duyệt', className: 'bg-brand-yellow/10 text-brand-yellow' };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-gray-900">
              {typeLabels[proposal.type] ?? proposal.type}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${status.className}`}>
              {status.label}
            </span>
          </div>
          <p className="text-xs text-gray-500">
            bởi {proposal.proposer.name || 'Ẩn danh'} ·{' '}
            {new Date(proposal.createdAt).toLocaleDateString('vi-VN')}
          </p>
          {proposal.targetItem && (
            <p className="text-xs text-gray-400">
              Hoạt động: <strong>{proposal.targetItem.title}</strong> (Ngày {proposal.targetItem.dayIndex + 1})
            </p>
          )}
        </div>

        <div className="flex items-center gap-1 text-xs text-gray-400">
          <Clock size={12} />
          {new Date(proposal.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {/* Payload Preview */}
      <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-600 space-y-1">
        {Object.entries(proposal.payload).map(([key, value]) =>
          value !== undefined && value !== null ? (
            <div key={key} className="flex gap-2">
              <span className="font-bold text-gray-500">{key}:</span>
              <span>{String(value)}</span>
            </div>
          ) : null,
        )}
      </div>

      {/* Leader actions */}
      {isLeader && proposal.status === 'PENDING' && (
        <div className="flex gap-2">
          <button
            onClick={handleAccept}
            disabled={acting}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-brand-green/10 hover:bg-brand-green/20 text-brand-green rounded-xl font-bold text-sm transition-all active:scale-95 disabled:opacity-60"
          >
            {acting ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
            Duyệt
          </button>
          <button
            onClick={handleReject}
            disabled={acting}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-brand-coral/10 hover:bg-brand-coral/20 text-brand-coral rounded-xl font-bold text-sm transition-all active:scale-95 disabled:opacity-60"
          >
            {acting ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
            Từ chối
          </button>
        </div>
      )}
    </motion.div>
  );
}

export function ProposalInboxPanel({
  tripId,
  proposals,
  isLeader,
  onUpdate,
  asModal = false,
  onClose,
}: ProposalInboxPanelProps) {
  const pendingProposals = proposals.filter((p) => p.status === 'PENDING');
  const resolvedProposals = proposals.filter((p) => p.status !== 'PENDING');

  const content = (
    <div className="space-y-4">
      {pendingProposals.length === 0 && resolvedProposals.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p className="font-bold">Chưa có đề xuất nào</p>
        </div>
      )}

      {pendingProposals.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-black text-gray-900">
            🔔 Chờ duyệt ({pendingProposals.length})
          </h3>
          {pendingProposals.map((p) => (
            <ProposalCard key={p.id} proposal={p} tripId={tripId} isLeader={isLeader} onUpdate={onUpdate} />
          ))}
        </div>
      )}

      {resolvedProposals.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-black text-gray-500">📋 Đã xử lý</h3>
          {resolvedProposals.slice(0, 10).map((p) => (
            <ProposalCard key={p.id} proposal={p} tripId={tripId} isLeader={isLeader} onUpdate={onUpdate} />
          ))}
        </div>
      )}
    </div>
  );

  if (asModal) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
          onClick={onClose}
        />
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl max-h-[80vh] overflow-y-auto"
        >
          <div className="p-6 space-y-4">
            <div className="flex justify-center">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-gray-900">Đề xuất</h2>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            {content}
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  return content;
}
