'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import { VoteSession, VoteOption } from '../../lib/api-client';
import {
  ThumbsUp,
  ThumbsDown,
  ArrowLeft,
  Clock,
  Users,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Timer,
} from 'lucide-react';

interface VoteCardDeckProps {
  session: VoteSession;
  userId: string;
  onVote: (optionId: string) => Promise<void>;
  onBack: () => void;
}

function formatTimeLeft(deadline: string): string {
  const diff = new Date(deadline).getTime() - Date.now();
  if (diff <= 0) return 'Hết giờ!';
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h > 24) return `${Math.ceil(h / 24)} ngày`;
  if (h > 0) return `${h}h ${m}p`;
  return `${m} phút`;
}

function SwipeCard({
  option,
  isActive,
  onSwipeLeft,
  onSwipeRight,
}: {
  option: VoteOption;
  isActive: boolean;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-15, 0, 15]);
  const leftOpacity = useTransform(x, [-100, -20, 0], [1, 0.5, 0]);
  const rightOpacity = useTransform(x, [0, 20, 100], [0, 0.5, 1]);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x > 80) {
      onSwipeRight();
    } else if (info.offset.x < -80) {
      onSwipeLeft();
    }
  };

  if (!isActive) return null;

  const payload = option.payload as Record<string, unknown>;
  const locationName = typeof payload.locationName === 'string' ? payload.locationName : null;
  const shortNote = typeof payload.shortNote === 'string' ? payload.shortNote : null;

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.8}
      style={{ x, rotate }}
      onDragEnd={handleDragEnd}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
      className="absolute inset-0 cursor-grab active:cursor-grabbing touch-none"
    >
      <div className="relative h-full bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* Swipe Feedback Overlays */}
        <motion.div
          style={{ opacity: leftOpacity }}
          className="absolute inset-0 bg-brand-coral/10 rounded-3xl z-10 flex items-center justify-center pointer-events-none"
        >
          <div className="bg-brand-coral/20 p-5 rounded-full">
            <ThumbsDown size={48} className="text-brand-coral" />
          </div>
        </motion.div>
        <motion.div
          style={{ opacity: rightOpacity }}
          className="absolute inset-0 bg-brand-green/10 rounded-3xl z-10 flex items-center justify-center pointer-events-none"
        >
          <div className="bg-brand-green/20 p-5 rounded-full">
            <ThumbsUp size={48} className="text-brand-green" />
          </div>
        </motion.div>

        {/* Card Content */}
        <div className="relative z-0 h-full flex flex-col p-6">
          {/* Top Gradient */}
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-brand-coral/5 to-transparent rounded-t-3xl" />

          <div className="relative flex-1 flex flex-col justify-center items-center text-center space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-gray-900 leading-tight">
                {option.title}
              </h2>
              {locationName && (
                <p className="text-sm text-gray-500 flex items-center justify-center gap-1">
                  📍 {locationName}
                </p>
              )}
            </div>

            {/* Details */}
            {shortNote && (
              <p className="text-gray-600 text-sm max-w-xs">
                {shortNote}
              </p>
            )}

            {/* Vote Count (live) */}
            {option.voteCount !== undefined && (
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <Users size={12} />
                {option.voteCount} phiếu
              </div>
            )}
          </div>

          {/* Swipe Hint */}
          <div className="flex items-center justify-between text-xs text-gray-400 pt-4">
            <span className="flex items-center gap-1">
              <ChevronLeft size={14} /> Khong chon
            </span>
            <span className="text-gray-300">Vuốt trái hoặc phải</span>
            <span className="flex items-center gap-1">
              Chon phuong an nay <ChevronRight size={14} />
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function VoteCardDeck({ session, userId, onVote, onBack }: VoteCardDeckProps) {
  const activeOptions = session.options.filter((o) => o.status === 'ACTIVE');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [votedFor, setVotedFor] = useState<string | null>(null);
  const [voting, setVoting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(formatTimeLeft(session.deadline));

  // Find if user already voted
  const userBallot = session.ballots.find((b) => b.userId === userId);

  // Update countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(formatTimeLeft(session.deadline));
    }, 30000);
    return () => clearInterval(interval);
  }, [session.deadline]);

  const handleVote = useCallback(
    async (optionId: string) => {
      if (voting) return;
      setVoting(true);
      try {
        await onVote(optionId);
        setVotedFor(optionId);
      } finally {
        setVoting(false);
      }
      // Move to next card
      setCurrentIndex((prev) => Math.min(prev + 1, activeOptions.length));
    },
    [voting, onVote, activeOptions.length],
  );

  const handleSkip = useCallback(() => {
    setCurrentIndex((prev) => Math.min(prev + 1, activeOptions.length));
  }, [activeOptions.length]);

  const allReviewed = currentIndex >= activeOptions.length;
  const currentOption = activeOptions[currentIndex];

  return (
    <div className="space-y-4">
      {/* Session Info Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft size={16} /> Quay lại
        </button>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-xs font-bold text-brand-coral bg-brand-coral/10 px-2.5 py-1 rounded-full">
            <Timer size={12} /> {timeLeft}
          </span>
          <span className="text-xs text-gray-400">
            {currentIndex + 1}/{activeOptions.length}
          </span>
        </div>
      </div>

      {/* Card Deck Area */}
      <div className="relative h-[420px] sm:h-[480px]">
        <AnimatePresence>
          {!allReviewed && currentOption && (
            <SwipeCard
              key={currentOption.id}
              option={currentOption}
              isActive={true}
              onSwipeLeft={handleSkip}
              onSwipeRight={() => handleVote(currentOption.id)}
            />
          )}
        </AnimatePresence>

        {/* All Reviewed State */}
        {allReviewed && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center text-center space-y-4 bg-white rounded-3xl shadow-xl border border-gray-100 p-8"
          >
            <div className="p-4 bg-brand-green/10 rounded-full">
              <CheckCircle2 size={40} className="text-brand-green" />
            </div>
            <h3 className="text-xl font-black text-gray-900">
              {votedFor ? 'Đã bình chọn! 🎉' : 'Đã xem hết! 👀'}
            </h3>
            <p className="text-sm text-gray-500 max-w-xs">
              {votedFor
                ? 'Bạn có thể đổi phiếu trước khi hết hạn bằng cách vuốt lại.'
                : 'Bạn chưa chọn phương án nào. Vuốt lại để bình chọn!'}
            </p>
            <button
              onClick={() => setCurrentIndex(0)}
              className="px-6 py-3 bg-brand-coral text-white rounded-2xl font-bold hover:bg-brand-coral/90 transition-all active:scale-[0.98]"
            >
              Xem lại tất cả
            </button>
          </motion.div>
        )}
      </div>

      {/* Desktop Fallback Buttons */}
      {!allReviewed && currentOption && (
        <div className="flex items-center gap-3">
          <button
            onClick={handleSkip}
            disabled={voting}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-white border-2 border-brand-coral/20 text-brand-coral rounded-2xl font-bold text-sm hover:bg-brand-coral/5 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            <ThumbsDown size={18} />
            Khong chon
          </button>
          <button
            onClick={() => handleVote(currentOption.id)}
            disabled={voting}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-brand-green text-white rounded-2xl font-bold text-sm hover:bg-brand-green/90 transition-all active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-brand-green/20"
          >
            <ThumbsUp size={18} />
            Chon phuong an nay
          </button>
        </div>
      )}

      {/* Already Voted Indicator */}
      {userBallot && (
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-brand-blue/5 border border-brand-blue/20 rounded-2xl p-3 text-center"
        >
          <p className="text-xs text-brand-blue font-bold flex items-center justify-center gap-1">
            <CheckCircle2 size={12} />
            Bạn đã bình chọn. Vuốt lại để đổi phiếu trước hạn chốt!
          </p>
        </motion.div>
      )}

      {/* Interim Results */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-2">
        <h4 className="text-xs font-black text-gray-500 uppercase tracking-wider">
          Kết quả tạm thời
        </h4>
        {activeOptions.map((opt) => {
          const totalVotes = session.totalVotes || session.ballots.length || 1;
          const pct = opt.voteCount ? Math.round((opt.voteCount / totalVotes) * 100) : 0;
          const isUserChoice = userBallot?.voteOptionId === opt.id;
          return (
            <div key={opt.id} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className={`font-bold ${isUserChoice ? 'text-brand-blue' : 'text-gray-700'}`}>
                  {opt.title}
                  {isUserChoice && ' ✓'}
                </span>
                <span className="text-xs text-gray-400">{opt.voteCount || 0} phiếu ({pct}%)</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.5 }}
                  className={`h-full rounded-full ${isUserChoice ? 'bg-brand-blue' : 'bg-brand-coral/60'}`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
