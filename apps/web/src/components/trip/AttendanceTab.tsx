'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Clock3, Loader2, MapPin, Radio, ShieldCheck } from 'lucide-react';
import {
  attendanceApi,
  AttendanceSnapshot,
  connectAttendanceSocket,
} from '../../lib/api-client';
import { useAuthStore } from '../../store/useAuthStore';
import { AttendanceMapPanel } from './AttendanceMapPanel';
import { AttendanceMemberList } from './AttendanceMemberList';
import { CheckInCaptureSheet } from './CheckInCaptureSheet';
import { LocationPicker } from './LocationPicker';

interface AttendanceTabProps {
  tripId: string;
  onOverlayChange?: (open: boolean) => void;
}

function toLocalInputValue(date: Date) {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}

export function AttendanceTab({ tripId, onOverlayChange }: AttendanceTabProps) {
  const { user, isHydrated } = useAuthStore();
  const [snapshot, setSnapshot] = useState<AttendanceSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCaptureSheet, setShowCaptureSheet] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const socketRef = useRef<ReturnType<typeof connectAttendanceSocket> | null>(null);

  const [title, setTitle] = useState('Điểm tập trung');
  const [meetingLabel, setMeetingLabel] = useState('Điểm hẹn');
  const [meetingAddress, setMeetingAddress] = useState('');
  const [opensAt, setOpensAt] = useState(() => toLocalInputValue(new Date()));
  const [closesAt, setClosesAt] = useState(() =>
    toLocalInputValue(new Date(Date.now() + 30 * 60 * 1000)),
  );
  const [meetingLat, setMeetingLat] = useState<number | undefined>();
  const [meetingLng, setMeetingLng] = useState<number | undefined>();
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  const fetchSnapshot = useCallback(async () => {
    try {
      setLoading(true);
      const next = await attendanceApi.getCurrentSession(tripId);
      setSnapshot(next);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải check-in');
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    if (!isHydrated || !user) return;
    fetchSnapshot();
  }, [fetchSnapshot, isHydrated, user]);

  useEffect(() => {
    if (!user) return;

    const socket = connectAttendanceSocket();
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('attendance.join', {
        tripId,
        userId: user.id,
        sessionId: snapshot?.session?.id ?? null,
      });
    });

    socket.on('attendance.snapshot', (next: AttendanceSnapshot) => {
      setSnapshot(next);
      setLoading(false);
    });

    socket.on('attendance.updated', () => {
      fetchSnapshot();
    });

    return () => {
      socket.emit('attendance.leave', {
        tripId,
        sessionId: snapshot?.session?.id ?? null,
      });
      socket.disconnect();
      socketRef.current = null;
    };
  }, [fetchSnapshot, tripId, user, snapshot?.session?.id]);

  const createSession = async () => {
    try {
      const next = await attendanceApi.createSession(tripId, {
        title,
        meetingLabel,
        meetingAddress,
        lat: meetingLat,
        lng: meetingLng,
        opensAt: new Date(opensAt).toISOString(),
        closesAt: new Date(closesAt).toISOString(),
      });
      setSnapshot(next);
      setFormOpen(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể mở check-in');
    }
  };

  const closeSession = async () => {
    if (!snapshot?.session) return;
    try {
      const next = await attendanceApi.closeSession(snapshot.session.id);
      setSnapshot(next);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể đóng check-in');
    }
  };

  const myRow = useMemo(
    () => snapshot?.members.find((member) => member.tripMemberId === snapshot.currentTripMemberId) ?? null,
    [snapshot],
  );

  if (!isHydrated || loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 size={28} className="animate-spin text-brand-blue" />
      </div>
    );
  }

  if (!snapshot) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-gray-900">Check-in</h2>
          <p className="text-sm text-gray-500">Selfie proof + vị trí trình duyệt khi có thể</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {snapshot.isLeader && (
            <>
              <button
                type="button"
                onClick={() => setFormOpen((value) => !value)}
                className="rounded-2xl bg-brand-dark px-4 py-2 text-sm font-black text-white"
              >
                Mở check-in
              </button>
              {snapshot.session?.status === 'OPEN' && (
                <button
                  type="button"
                  onClick={closeSession}
                  className="rounded-2xl bg-brand-coral/10 px-4 py-2 text-sm font-black text-brand-coral"
                >
                  Đóng phiên
                </button>
              )}
            </>
          )}
          {snapshot.session?.status === 'OPEN' && (
            <button
              type="button"
              onClick={() => setShowCaptureSheet(true)}
              className="rounded-2xl bg-gradient-to-r from-brand-green to-brand-blue px-4 py-2 text-sm font-black text-white"
            >
              Chụp ảnh check-in
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-2xl bg-brand-coral/10 px-4 py-3 text-sm font-medium text-brand-coral">
          {error}
        </div>
      )}

      {formOpen && snapshot.isLeader && (
        <div className="grid gap-3 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm md:grid-cols-2">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Tên phiên check-in"
            className="rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-brand-blue"
          />
          <input
            value={meetingLabel}
            onChange={(event) => setMeetingLabel(event.target.value)}
            placeholder="Tên điểm hẹn"
            className="rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-brand-blue"
          />
          <input
            value={meetingAddress}
            onChange={(event) => setMeetingAddress(event.target.value)}
            placeholder="Địa chỉ điểm hẹn"
            className="md:col-span-2 rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-brand-blue"
          />
          <div className="md:col-span-2 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowLocationPicker((value) => !value)}
              className="rounded-2xl bg-brand-blue/10 px-4 py-3 text-sm font-black text-brand-blue"
            >
              Chọn địa chỉ từ map
            </button>
            {meetingLat != null && meetingLng != null && (
              <span className="text-xs font-semibold text-gray-500">
                {meetingLat.toFixed(4)}, {meetingLng.toFixed(4)}
              </span>
            )}
          </div>
          {showLocationPicker && (
            <div className="md:col-span-2">
              <LocationPicker
                value={meetingAddress}
                onValueChange={setMeetingAddress}
                initialLat={meetingLat}
                initialLng={meetingLng}
                onCancel={() => setShowLocationPicker(false)}
                onConfirm={(location) => {
                  setMeetingAddress(location.name || meetingAddress);
                  setMeetingLabel(location.name || meetingLabel);
                  setMeetingLat(location.lat);
                  setMeetingLng(location.lng);
                  setShowLocationPicker(false);
                }}
              />
            </div>
          )}
          <label className="space-y-2 text-sm font-semibold text-gray-600">
            <span>Mở từ</span>
            <input
              type="datetime-local"
              value={opensAt}
              onChange={(event) => setOpensAt(event.target.value)}
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-brand-blue"
            />
          </label>
          <label className="space-y-2 text-sm font-semibold text-gray-600">
            <span>Đến hạn</span>
            <input
              type="datetime-local"
              value={closesAt}
              onChange={(event) => setClosesAt(event.target.value)}
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-brand-blue"
            />
          </label>
          <div className="md:col-span-2 flex gap-2">
            <button
              type="button"
              onClick={createSession}
              className="rounded-2xl bg-brand-blue px-4 py-3 text-sm font-black text-white"
            >
              Lưu phiên check-in
            </button>
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="rounded-2xl bg-gray-100 px-4 py-3 text-sm font-semibold text-gray-500"
            >
              Hủy
            </button>
          </div>
        </div>
      )}

      {snapshot.session ? (
        <>
          <div className="grid gap-3 md:grid-cols-4">
            <div className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm md:col-span-2">
              <p className="text-xs font-black uppercase tracking-wide text-gray-400">Điểm hẹn</p>
              <p className="mt-2 text-lg font-black text-gray-900">{snapshot.session.meetingLabel}</p>
              <p className="mt-1 text-sm text-gray-500">{snapshot.session.meetingAddress}</p>
              <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                <Clock3 size={14} />
                {new Date(snapshot.session.opensAt).toLocaleString('vi-VN')} -{' '}
                {new Date(snapshot.session.closesAt).toLocaleString('vi-VN')}
              </div>
            </div>

            <div className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm">
              <p className="text-xs font-black uppercase tracking-wide text-gray-400">Đã đến</p>
              <p className="mt-2 text-3xl font-black text-brand-green">{snapshot.counts.arrived}</p>
            </div>
            <div className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm">
              <p className="text-xs font-black uppercase tracking-wide text-gray-400">Chưa đến</p>
              <p className="mt-2 text-3xl font-black text-brand-coral">{snapshot.counts.missing}</p>
              <p className="mt-1 text-xs text-gray-500">Thiếu vị trí: {snapshot.counts.noLocation}</p>
            </div>
          </div>

          <AttendanceMapPanel snapshot={snapshot} />
          <AttendanceMemberList members={snapshot.members} />

          {myRow && (
            <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-black text-gray-900">Trạng thái của tôi</p>
                  <p className="mt-1 text-sm text-gray-500">
                    {myRow.status === 'ARRIVED'
                      ? 'Bạn đã gửi check-in kèm vị trí.'
                      : myRow.status === 'NO_LOCATION'
                        ? 'Bạn đã gửi ảnh nhưng chưa có vị trí.'
                        : 'Bạn chưa check-in cho phiên này.'}
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-brand-blue/10 px-3 py-2 text-sm font-black text-brand-blue">
                  <Radio size={14} />
                  {snapshot.session.status === 'OPEN' ? 'Phiên đang mở' : 'Phiên đã đóng'}
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="rounded-3xl border border-gray-100 bg-white px-6 py-14 text-center shadow-sm">
          <ShieldCheck size={44} className="mx-auto text-gray-300" />
          <p className="mt-4 text-xl font-black text-gray-900">Chưa có phiên check-in nào</p>
          <p className="mt-2 text-sm text-gray-500">
            {snapshot.isLeader
              ? 'Mở một phiên mới để cả nhóm selfie check-in tại điểm hẹn.'
              : 'Chờ leader mở phiên check-in mới.'}
          </p>
        </div>
      )}

      {snapshot.session && (
        <CheckInCaptureSheet
          open={showCaptureSheet}
          sessionId={snapshot.session.id}
          onClose={() => setShowCaptureSheet(false)}
          onOverlayChange={onOverlayChange}
          onSuccess={(next) => setSnapshot(next)}
        />
      )}
    </div>
  );
}
