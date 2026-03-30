'use client';

import { useEffect, useState } from 'react';
import type { SafetyWarningsSnapshot } from '../../lib/api-client';

interface SOSPanelProps {
  snapshot: SafetyWarningsSnapshot | null;
  busy?: boolean;
  onSend: (body: { message?: string }) => Promise<void>;
  onAcknowledge: (alertId: string) => Promise<void>;
}

export function SOSPanel({ snapshot, busy, onSend, onAcknowledge }: SOSPanelProps) {
  const [message, setMessage] = useState('');
  const [notificationState, setNotificationState] = useState<'idle' | 'requested' | 'granted' | 'denied'>('idle');

  useEffect(() => {
    if (typeof window === 'undefined' || typeof Notification === 'undefined') {
      return;
    }

    if (snapshot?.alerts[0]?.type === 'SOS' && Notification.permission === 'granted') {
      new Notification('SOS mới trong chuyến đi', {
        body: snapshot.alerts[0].message,
      });
    }
  }, [snapshot?.alerts]);

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

      {snapshot?.alerts.length ? (
        <div className="rounded-2xl bg-white/10 px-4 py-4">
          <p className="text-sm font-black">Đã gửi cảnh báo</p>
          <p className="mt-2 text-sm text-white/75">{snapshot.alerts[0].message}</p>
          {snapshot.alerts[0].status !== 'ACKNOWLEDGED' && (
            <button
              type="button"
              onClick={() => onAcknowledge(snapshot.alerts[0].id)}
              className="mt-3 rounded-xl bg-white px-3 py-2 text-xs font-black text-brand-dark"
            >
              Đánh dấu đã thấy
            </button>
          )}
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
