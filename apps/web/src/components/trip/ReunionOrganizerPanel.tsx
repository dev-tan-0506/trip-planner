'use client';

import { useState } from 'react';
import { memoriesApi, type ReunionSnapshot } from '../../lib/api-client';

interface ReunionOrganizerPanelProps {
  tripId: string;
  snapshot: ReunionSnapshot;
  onSnapshotUpdate: (snapshot: ReunionSnapshot) => void | Promise<void>;
}

export function ReunionOrganizerPanel({ tripId, snapshot, onSnapshotUpdate }: ReunionOrganizerPanelProps) {
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  const toggleDate = (value: string) => {
    setSelectedDates((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
    );
  };

  const submitAvailability = async () => {
    setBusy(true);
    try {
      const next = await memoriesApi.respondReunionAvailability(tripId, { selectedDates, note });
      await onSnapshotUpdate(next);
    } finally {
      setBusy(false);
    }
  };

  const finalize = async (finalizedDate: string) => {
    setBusy(true);
    try {
      const next = await memoriesApi.finalizeReunionInvite(tripId, { finalizedDate });
      await onSnapshotUpdate(next);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="rounded-[28px] border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500">Reunion</p>
      <h3 className="mt-2 text-xl font-black text-gray-900">Hẹn reunion</h3>

      {!snapshot.eligible ? (
        <p className="mt-3 text-sm text-gray-600">
          Tính năng này mở sau 7 ngày kể từ khi chuyến đi kết thúc.
        </p>
      ) : (
        <>
          <p className="mt-3 text-sm text-gray-600">
            {snapshot.deliveryStatus.some((item) => item.status === 'SENT')
              ? 'Đã gửi e-invite cho cả nhóm.'
              : 'Đã tới lúc hẹn reunion, nhưng e-invite có thể gửi thất bại nếu SMTP chưa sẵn sàng.'}
          </p>
          <p className="mt-2 text-sm font-bold text-gray-900">
            Ngày gợi ý: {snapshot.recommendedDate ?? 'Chưa có'}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {snapshot.suggestedDateOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => toggleDate(option)}
                className={`rounded-full px-4 py-2 text-sm font-black ${
                  selectedDates.includes(option) ? 'bg-brand-dark text-white' : 'bg-gray-100 text-gray-700'
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={3}
            className="mt-4 w-full rounded-3xl border border-gray-200 px-4 py-3 text-sm"
            placeholder="Bạn rảnh khung nào?"
          />

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={submitAvailability}
              disabled={busy || selectedDates.length === 0}
              className="rounded-2xl bg-brand-dark px-4 py-3 text-sm font-black text-white disabled:opacity-60"
            >
              Gửi availability
            </button>

            {snapshot.isLeader && snapshot.recommendedDate && (
              <button
                type="button"
                onClick={() => finalize(snapshot.recommendedDate as string)}
                disabled={busy}
                className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-black text-white disabled:opacity-60"
              >
                Chốt ngày reunion
              </button>
            )}
          </div>
        </>
      )}
    </section>
  );
}
