'use client';

import { useState } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import {
  memoriesApi,
  type FeedbackSnapshot,
  type SubmitAnonymousFeedbackPayload,
} from '../../lib/api-client';

interface AnonymousFeedbackPanelProps {
  tripId: string;
  snapshot: FeedbackSnapshot;
  busy: boolean;
  onSnapshotUpdate: (snapshot: FeedbackSnapshot) => void | Promise<void>;
}

export function AnonymousFeedbackPanel({
  tripId,
  snapshot,
  busy,
  onSnapshotUpdate,
}: AnonymousFeedbackPanelProps) {
  const [moodScore, setMoodScore] = useState(4);
  const [highlight, setHighlight] = useState('');
  const [wishNextTime, setWishNextTime] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    try {
      setSubmitting(true);
      setError(null);
      const nextSnapshot = await memoriesApi.submitAnonymousFeedback(tripId, {
        moodScore,
        highlight,
        wishNextTime,
      } satisfies SubmitAnonymousFeedbackPayload);
      await onSnapshotUpdate(nextSnapshot);
      setHighlight('');
      setWishNextTime('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không gửi được góp ý ẩn danh');
    } finally {
      setSubmitting(false);
    }
  };

  const closePoll = async () => {
    try {
      setSubmitting(true);
      setError(null);
      const nextSnapshot = await memoriesApi.closeFeedbackPoll(tripId);
      await onSnapshotUpdate(nextSnapshot);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không đóng được poll góp ý');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="rounded-[28px] border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500">Feedback</p>
          <h3 className="mt-2 text-xl font-black text-gray-900">Góp ý ẩn danh</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
            Viết thật gọn, thật vui. Mỗi người chỉ gửi một lần, và leader chỉ thấy nội dung ẩn danh.
          </p>
        </div>
        <div className="rounded-2xl bg-pink-50 px-4 py-3 text-sm font-medium text-pink-700">
          {snapshot.submittedCount} phản hồi đã vào hộp thư ẩn danh
        </div>
      </div>

      {snapshot.isLeader ? (
        <div className="mt-5 space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            {snapshot.moodBreakdown.map((item) => (
              <div key={item.score} className="rounded-2xl bg-gray-50 px-4 py-3">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-gray-500">Mức vui {item.score}</p>
                <p className="mt-2 text-2xl font-black text-gray-900">{item.count}</p>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            {snapshot.responses.map((response) => (
              <article key={response.id} className="rounded-3xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm font-black text-gray-900">Mức vui {response.moodScore}/5</p>
                <p className="mt-2 text-sm text-gray-700">{response.highlight}</p>
                <p className="mt-2 text-sm text-gray-500">Lần sau: {response.wishNextTime}</p>
              </article>
            ))}
            {snapshot.responses.length === 0 && (
              <div className="rounded-2xl bg-gray-50 px-4 py-4 text-sm text-gray-500">
                Chưa có góp ý ẩn danh nào từ cả nhóm.
              </div>
            )}
          </div>

          {snapshot.status === 'OPEN' && (
            <button
              type="button"
              onClick={closePoll}
              disabled={submitting || busy}
              className="rounded-2xl bg-gray-900 px-4 py-3 text-sm font-black text-white transition hover:bg-gray-800 disabled:opacity-60"
            >
              {submitting ? 'Đang đóng poll...' : 'Đóng poll góp ý'}
            </button>
          )}
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          {snapshot.hasSubmitted ? (
            <div className="rounded-3xl bg-emerald-50 px-4 py-5 text-sm font-medium text-emerald-700">
              Phản hồi ẩn danh của bạn đã gửi xong. Cảm ơn vì đã góp ý thật lòng.
            </div>
          ) : (
            <>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5].map((score) => (
                  <button
                    key={score}
                    type="button"
                    onClick={() => setMoodScore(score)}
                    className={`rounded-full px-4 py-2 text-sm font-black transition ${
                      moodScore === score
                        ? 'bg-brand-dark text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Mức vui {score}
                  </button>
                ))}
              </div>

              <textarea
                value={highlight}
                onChange={(event) => setHighlight(event.target.value)}
                rows={3}
                className="w-full rounded-3xl border border-gray-200 px-4 py-3 text-sm text-gray-700 outline-none focus:border-brand-blue"
                placeholder="Khoảnh khắc vui nhất của chuyến đi là gì?"
              />
              <textarea
                value={wishNextTime}
                onChange={(event) => setWishNextTime(event.target.value)}
                rows={3}
                className="w-full rounded-3xl border border-gray-200 px-4 py-3 text-sm text-gray-700 outline-none focus:border-brand-blue"
                placeholder="Lần sau cả nhóm nên làm khác đi điều gì?"
              />

              <button
                type="button"
                onClick={submit}
                disabled={submitting || busy || !highlight.trim() || !wishNextTime.trim() || !snapshot.canSubmit}
                className="inline-flex items-center gap-2 rounded-2xl bg-brand-dark px-4 py-3 text-sm font-black text-white transition hover:bg-brand-dark/90 disabled:opacity-60"
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                {submitting ? 'Đang gửi...' : 'Gửi góp ý ẩn danh'}
              </button>
            </>
          )}
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      )}
    </section>
  );
}
