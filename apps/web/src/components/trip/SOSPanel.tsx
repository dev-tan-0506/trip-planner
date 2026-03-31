'use client';

import { useEffect, useRef, useState } from 'react';
import type { SafetyWarningsSnapshot } from '../../lib/api-client';

interface SOSPanelProps {
  snapshot: SafetyWarningsSnapshot | null;
  busy?: boolean;
  onSend: (body: { message?: string }) => Promise<void>;
  onAcknowledge: (alertId: string) => Promise<void>;
  onResolve: (alertId: string) => Promise<void>;
}

export function SOSPanel({ snapshot, busy, onSend, onAcknowledge, onResolve }: SOSPanelProps) {
  const [message, setMessage] = useState('');
  const [notificationState, setNotificationState] = useState<'idle' | 'requested' | 'granted' | 'denied'>('idle');
  const lastNotifiedAlertIdRef = useRef<string | null>(null);
  const latestAlert = snapshot?.alerts[0] ?? null;

  useEffect(() => {
    if (typeof window === 'undefined' || typeof Notification === 'undefined') {
      return;
    }

    if (
      latestAlert?.type === 'SOS' &&
      latestAlert.status === 'OPEN' &&
      Notification.permission === 'granted' &&
      lastNotifiedAlertIdRef.current !== latestAlert.id
    ) {
      lastNotifiedAlertIdRef.current = latestAlert.id;
      new Notification('SOS mới trong chuyến đi', {
        body: latestAlert.message,
      });
    }
  }, [latestAlert]);

  useEffect(() => {
    if (latestAlert?.status === 'RESOLVED') {
      lastNotifiedAlertIdRef.current = latestAlert.id;
    }
  }, [latestAlert?.id, latestAlert?.status]);

  const requestNotifications = async () => {
    if (typeof Notification === 'undefined') {
      setNotificationState('denied');
      return;
    }

    const permission = await Notification.requestPermission();
    setNotificationState(permission === 'granted' ? 'granted' : 'denied');
  };

  return (
    <div className="space-y-4 rounded-3xl border border-brand-dark/15 bg-brand-dark p-5 text-white shadow-sm">
      <div>
        <p className="text-sm font-black">SOS</p>
        <p className="mt-1 text-sm text-white/70">
          Khu vực khẩn cấp cho cảnh báo nghiêm túc, rõ ràng và đi thẳng vào hành động.
        </p>
      </div>

      <textarea
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        placeholder="Mô tả ngắn tình huống nếu bạn kịp nhập..."
        className="min-h-[96px] w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white outline-none placeholder:text-white/45"
      />

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => onSend({ message })}
          className="rounded-2xl bg-brand-coral px-4 py-3 text-sm font-black text-white"
        >
          Gửi SOS
        </button>
        <button
          type="button"
          onClick={requestNotifications}
          className="rounded-2xl bg-white/10 px-4 py-3 text-sm font-black text-white"
        >
          Notification
        </button>
      </div>

      {notificationState !== 'idle' && (
        <div className="rounded-2xl bg-white/10 px-4 py-3 text-sm text-white/75">
          {notificationState === 'granted'
            ? 'Đã bật thông báo trình duyệt cho cảnh báo SOS.'
            : 'Trình duyệt không cho phép thông báo. Bạn vẫn gửi SOS bình thường.'}
        </div>
      )}

      {latestAlert ? (
        <div className="rounded-2xl bg-white/10 px-4 py-4">
          <p className="text-sm font-black">
            {latestAlert.status === 'RESOLVED' ? 'Tình huống đã khép lại' : 'Đã gửi cảnh báo'}
          </p>
          <p className="mt-2 text-sm text-white/75">{latestAlert.message}</p>
          <p className="mt-2 text-xs font-bold uppercase tracking-[0.2em] text-white/60">
            {latestAlert.status === 'OPEN'
              ? 'Đang khẩn cấp'
              : latestAlert.status === 'ACKNOWLEDGED'
                ? 'Đã có người thấy'
                : 'Đã an toàn'}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {latestAlert.status === 'OPEN' && (
              <button
                type="button"
                disabled={busy}
                onClick={() => onAcknowledge(latestAlert.id)}
                className="rounded-xl bg-white px-3 py-2 text-xs font-black text-brand-dark"
              >
                Đánh dấu đã thấy
              </button>
            )}
            {latestAlert.status !== 'RESOLVED' && (
              <button
                type="button"
                disabled={busy}
                onClick={() => onResolve(latestAlert.id)}
                className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-black text-white"
              >
                Đã an toàn, tắt khẩn cấp
              </button>
            )}
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {snapshot?.quickDial.map((item) => (
          <a
            key={item.phone}
            href={`tel:${item.phone}`}
            className="rounded-xl bg-white/10 px-3 py-2 text-xs font-black text-white"
          >
            {item.label}
          </a>
        ))}
      </div>
    </div>
  );
}
