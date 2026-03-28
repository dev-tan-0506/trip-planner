'use client';

import { motion } from 'framer-motion';
import { VoteSession } from '../../lib/api-client';
import {
  Trophy,
  Crown,
  ArrowLeft,
  BarChart3,
  MapPin,
  Replace,
  Zap,
} from 'lucide-react';

interface VoteResultsPanelProps {
  session: VoteSession;
  isLeader: boolean;
  onResolve: (winningOptionId: string) => Promise<void>;
  onBack: () => void;
}

export function VoteResultsPanel({
  session,
  isLeader,
  onResolve,
  onBack,
}: VoteResultsPanelProps) {
  const activeOptions = session.options.filter(
    (o) => o.status === 'ACTIVE' || o.status === 'WINNER' || o.status === 'RUNNER_UP',
  );
  const winner = session.options.find((o) => o.status === 'WINNER');
  const totalVotes = session.totalVotes || session.ballots.length || 0;
  const isLeaderDecision = session.status === 'LEADER_DECISION_REQUIRED';
  const currentItem = session.currentItem ?? null;

  // Sort by vote count descending
  const sortedOptions = [...activeOptions].sort(
    (a, b) => (b.voteCount || 0) - (a.voteCount || 0),
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft size={16} /> Quay lại
        </button>
        <span className="text-xs text-gray-400">
          {totalVotes} phiếu đã bầu
        </span>
      </div>

      {/* REPLACE_ITEM view: current vs challenger */}
      {session.mode === 'REPLACE_ITEM' && currentItem && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-3xl shadow-lg border border-gray-100 p-5 space-y-4"
        >
          <h3 className="text-xs font-black text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
            <Replace size={12} /> So sánh
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {/* Current Item */}
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 space-y-2">
              <span className="text-[10px] font-black text-gray-400 uppercase">
                Hiện tại
              </span>
              <p className="font-bold text-gray-900 text-sm">{currentItem.title}</p>
              {currentItem.locationName && (
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <MapPin size={10} /> {currentItem.locationName}
                </p>
              )}
            </div>
            {/* Winner / Top Challenger */}
            {sortedOptions[0] && (
              <div className="bg-brand-green/5 rounded-2xl p-4 border border-brand-green/20 space-y-2">
                <span className="text-[10px] font-black text-brand-green uppercase">
                  {winner ? 'Người thắng' : 'Dẫn đầu'}
                </span>
                <p className="font-bold text-gray-900 text-sm">
                  {sortedOptions[0].title}
                </p>
                <p className="text-xs text-brand-green font-bold">
                  {sortedOptions[0].voteCount || 0} phiếu
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Winner Banner */}
      {winner && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="bg-gradient-to-br from-brand-yellow via-brand-yellow/90 to-brand-coral/60 rounded-3xl p-6 text-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-20 h-20 bg-white/20 rounded-full filter blur-2xl" />
          <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/10 rounded-full filter blur-2xl" />
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center p-3 bg-white/20 rounded-full mb-3">
              <Trophy size={32} className="text-white" />
            </div>
            <h2 className="text-xl font-black text-white">🎉 Kết quả</h2>
            <p className="text-2xl font-black text-white mt-2">{winner.title}</p>
            <p className="text-white/80 text-sm mt-1">
              {winner.voteCount || 0}/{totalVotes} phiếu
            </p>
          </div>
        </motion.div>
      )}

      {/* Leader Decision Required */}
      {isLeaderDecision && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-gradient-to-br from-brand-coral via-brand-coral/90 to-brand-yellow/70 rounded-3xl p-6 text-white space-y-3 text-center"
        >
          <div className="inline-flex items-center justify-center p-3 bg-white/20 rounded-full">
            <Crown size={28} className="text-white" />
          </div>
          <h2 className="text-xl font-black">Hòa lần 2! ⚡</h2>
          <p className="text-white/80 text-sm">
            Hai vòng bình chọn đều hòa. {isLeader ? 'Bạn' : 'Trưởng đoàn'} cần quyết định cuối cùng.
          </p>
        </motion.div>
      )}

      {/* Results Chart */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-3xl shadow-lg border border-gray-100 p-5 space-y-4"
      >
        <h3 className="text-xs font-black text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
          <BarChart3 size={12} /> Chi tiết kết quả
        </h3>

        <div className="space-y-3">
          {sortedOptions.map((opt, i) => {
            const pct = totalVotes > 0 ? Math.round(((opt.voteCount || 0) / totalVotes) * 100) : 0;
            const isWinner = opt.status === 'WINNER';
            const isTied = isLeaderDecision;

            return (
              <motion.div
                key={opt.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                className="space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isWinner && <Trophy size={14} className="text-brand-yellow" />}
                    <span
                      className={`font-bold text-sm ${isWinner ? 'text-brand-green' : 'text-gray-700'}`}
                    >
                      {opt.title}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-gray-500">
                    {opt.voteCount || 0} ({pct}%)
                  </span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.7, delay: 0.2 + i * 0.1 }}
                    className={`h-full rounded-full ${
                      isWinner
                        ? 'bg-gradient-to-r from-brand-green to-brand-green/80'
                        : isTied
                          ? 'bg-gradient-to-r from-brand-coral to-brand-yellow/80'
                          : 'bg-gray-300'
                    }`}
                  />
                </div>

                {/* Leader Decision Button */}
                {isLeaderDecision && isLeader && (
                  <button
                    onClick={() => onResolve(opt.id)}
                    className="w-full mt-1 px-4 py-2 bg-brand-coral/10 text-brand-coral rounded-xl font-bold text-xs hover:bg-brand-coral/20 transition-all active:scale-[0.98] flex items-center justify-center gap-1"
                  >
                    <Zap size={12} /> Chọn phương án này
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Tie-Break Sessions */}
      {session.status === 'CLOSED' && !winner && !isLeaderDecision && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-brand-yellow/5 border border-brand-yellow/20 rounded-2xl p-4 text-center space-y-2"
        >
          <p className="text-sm font-bold text-gray-700">
            ⚡ Phiên hòa — vòng phân định đã được tạo tự động
          </p>
          <p className="text-xs text-gray-500">
            Quay lại danh sách để tham gia vòng tiếp theo
          </p>
        </motion.div>
      )}
    </div>
  );
}
