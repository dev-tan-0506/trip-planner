'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import {
  tripsApi,
  votesApi,
  Trip,
  VoteSession,
  itineraryApi,
  ItineraryItem,
} from '../../../../src/lib/api-client';
import { useAuthStore } from '../../../../src/store/useAuthStore';
import { VoteSessionLobby } from '../../../../src/components/votes/VoteSessionLobby';
import { VoteCardDeck } from '../../../../src/components/votes/VoteCardDeck';
import { VoteResultsPanel } from '../../../../src/components/votes/VoteResultsPanel';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Vote,
  Loader2,
  Wifi,
  WifiOff,
  Compass,
} from 'lucide-react';
import Link from 'next/link';

const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';

export default function VotesPage() {
  const params = useParams();
  const joinCode = params.joinCode as string;
  const { user, isHydrated } = useAuthStore();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [sessions, setSessions] = useState<VoteSession[]>([]);
  const [activeSession, setActiveSession] = useState<VoteSession | null>(null);
  const [itineraryItems, setItineraryItems] = useState<ItineraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const activeSessionIdRef = useRef<string | null>(null);

  // Load trip and sessions
  useEffect(() => {
    async function loadData() {
      try {
        const tripData = user
          ? await tripsApi.getPrivateByJoinCode(joinCode)
          : await tripsApi.getByJoinCode(joinCode);
        setTrip(tripData);
        const [sessionsData, itinerarySnapshot] = await Promise.all([
          votesApi.listSessions(tripData.id),
          itineraryApi.getSnapshot(tripData.id),
        ]);
        setSessions(sessionsData);
        setItineraryItems(itinerarySnapshot.days.flatMap((day) => day.items));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Không thể tải dữ liệu');
      } finally {
        setLoading(false);
      }
    }
    if (isHydrated) loadData();
  }, [joinCode, isHydrated, user]);

  // WebSocket connection lifecycle
  useEffect(() => {
    if (!trip) return;

    const socket = io(`${WS_BASE_URL}/votes`, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      // Rejoin active session room on reconnect
      if (activeSessionIdRef.current) {
        socket.emit('vote.join', { sessionId: activeSessionIdRef.current });
      }
    });

    socket.on('disconnect', () => setConnected(false));

    // Live update events
    socket.on('vote.snapshot', (snapshot: VoteSession) => {
      setActiveSession(snapshot);
    });

    socket.on('vote.session-updated', (snapshot: VoteSession) => {
      setActiveSession(snapshot);
      // Also update in sessions list
      setSessions((prev) =>
        prev.map((s) => (s.id === snapshot.id ? snapshot : s)),
      );
    });

    socket.on('vote.results-updated', (snapshot: VoteSession) => {
      setActiveSession(snapshot);
    });

    socket.on('vote.closed', (snapshot: VoteSession) => {
      setActiveSession(snapshot);
      setSessions((prev) =>
        prev.map((s) => (s.id === snapshot.id ? snapshot : s)),
      );
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [trip]);

  // Join session room
  const joinSessionRoom = useCallback(
    async (sessionId: string) => {
      if (!trip) return;

      activeSessionIdRef.current = sessionId;

      // Always fetch fresh snapshot first
      try {
        const snapshot = await votesApi.getSession(trip.id, sessionId);
        setActiveSession(snapshot);
      } catch {
        setError('Không thể tải phiên bình chọn');
        return;
      }

      // Then join socket room for live updates
      if (socketRef.current?.connected) {
        socketRef.current.emit('vote.join', { sessionId });
      }
    },
    [trip],
  );

  // Leave session room
  const leaveSessionRoom = useCallback(() => {
    if (activeSessionIdRef.current && socketRef.current?.connected) {
      socketRef.current.emit('vote.leave', {
        sessionId: activeSessionIdRef.current,
      });
    }
    activeSessionIdRef.current = null;
    setActiveSession(null);
  }, []);

  // Refresh sessions list
  const refreshSessions = useCallback(async () => {
    if (!trip) return;
    const updated = await votesApi.listSessions(trip.id);
    setSessions(updated);
  }, [trip]);

  const isLeader =
    user && trip
      ? trip.members.some((m) => m.user.id === user.id && m.role === 'LEADER')
      : false;

  if (!isHydrated || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-light via-white to-brand-coral/5">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 size={40} className="text-brand-coral animate-spin" />
          <p className="text-gray-500 font-medium">Đang tải bình chọn...</p>
        </motion.div>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-light via-white to-brand-coral/5 p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center space-y-4"
        >
          <div className="inline-flex items-center justify-center p-4 bg-brand-coral/10 rounded-full">
            <Compass size={40} className="text-brand-coral" />
          </div>
          <h1 className="text-2xl font-black text-gray-900">Oops! 😅</h1>
          <p className="text-gray-500">{error || 'Không tìm thấy chuyến đi'}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-blue text-white rounded-2xl font-bold hover:bg-brand-blue/90 transition-all active:scale-95"
          >
            <ArrowLeft size={18} /> Về trang chủ
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-light via-white to-brand-coral/5">
      {/* Floating Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-20 w-72 h-72 bg-brand-coral/10 rounded-full filter blur-3xl" />
        <div className="absolute top-40 -right-20 w-80 h-80 bg-brand-yellow/10 rounded-full filter blur-3xl" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-gray-200/50">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {activeSession ? (
              <button
                onClick={leaveSessionRoom}
                className="p-1.5 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
            ) : (
              <Link
                href={`/trip/${joinCode}`}
                className="p-1.5 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </Link>
            )}
            <div>
              <p className="font-black text-sm text-gray-900 leading-tight flex items-center gap-1.5">
                <Vote size={14} className="text-brand-coral" />
                Bình chọn
              </p>
              <p className="text-xs text-gray-500">{trip.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                connected
                  ? 'bg-brand-green/10 text-brand-green'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {connected ? (
                <Wifi size={12} />
              ) : (
                <WifiOff size={12} />
              )}
              {connected ? 'Trực tuyến' : 'Mất kết nối'}
            </span>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-3xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {activeSession ? (
            <motion.div
              key="active-session"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {activeSession.status === 'CLOSED' ||
              activeSession.status === 'LEADER_DECISION_REQUIRED' ? (
                <VoteResultsPanel
                  session={activeSession}
                  isLeader={!!isLeader}
                  onResolve={async (winningOptionId) => {
                    await votesApi.resolveLeaderDecision(
                      activeSession.id,
                      winningOptionId,
                    );
                    await refreshSessions();
                    const updated = await votesApi.getSession(
                      trip.id,
                      activeSession.id,
                    );
                    setActiveSession(updated);
                  }}
                  onBack={leaveSessionRoom}
                />
              ) : (
                <VoteCardDeck
                  session={activeSession}
                  userId={user?.id || ''}
                  onVote={async (optionId) => {
                    await votesApi.submitBallot(activeSession.id, optionId);
                    const updated = await votesApi.getSession(
                      trip.id,
                      activeSession.id,
                    );
                    setActiveSession(updated);
                    setSessions((prev) =>
                      prev.map((session) =>
                        session.id === updated.id ? updated : session,
                      ),
                    );
                  }}
                  onBack={leaveSessionRoom}
                />
              )}
            </motion.div>
          ) : (
            <motion.div
              key="lobby"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <VoteSessionLobby
                sessions={sessions}
                tripId={trip.id}
                isLeader={!!isLeader}
                itineraryItems={itineraryItems}
                onSelectSession={joinSessionRoom}
                onCreateSession={async ({ session, options }) => {
                  const createdSession = await votesApi.createSession(trip.id, session);
                  await Promise.all(
                    options.map((option) => votesApi.createOption(createdSession.id, option)),
                  );
                  await refreshSessions();
                  return createdSession;
                }}
                onApproveSession={async (sessionId) => {
                  await votesApi.approveSession(sessionId);
                  await refreshSessions();
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
