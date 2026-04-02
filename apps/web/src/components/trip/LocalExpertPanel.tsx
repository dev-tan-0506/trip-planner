'use client';

import { useState } from 'react';
import { localExpertApi, type LocalExpertCard } from '../../lib/api-client';

const confidenceClass: Record<LocalExpertCard['confidenceLabel'], string> = {
  'Gợi ý': 'bg-emerald-100 text-emerald-700',
  'Ước lượng': 'bg-amber-100 text-amber-700',
  'Cần xem lại': 'bg-sky-100 text-sky-700',
};

interface LocalExpertPanelProps {
  tripId: string;
}

export function LocalExpertPanel({ tripId }: LocalExpertPanelProps) {
  const [menuText, setMenuText] = useState('Bun cha ca\nMuc nuong sa');
  const [areaLabel, setAreaLabel] = useState('Hai Chau');
  const [cards, setCards] = useState<LocalExpertCard[]>([]);
  const [loadingAction, setLoadingAction] = useState<'menu' | 'spots' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadMenuTranslation = async () => {
    try {
      setLoadingAction('menu');
      setError(null);
      const result = await localExpertApi.translateMenu(tripId, {
        menuText,
        localeHint: 'en',
      });
      setCards(result.cards);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không dịch được menu lúc này');
    } finally {
      setLoadingAction(null);
    }
  };

  const loadHiddenSpots = async () => {
    try {
      setLoadingAction('spots');
      setError(null);
      const result = await localExpertApi.requestHiddenSpots(tripId, {
        areaLabel,
        vibe: 'yen tinh',
        budgetHint: 're',
      });
      setCards(result.cards);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không lấy được gợi ý quanh đây');
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <section className="rounded-[28px] border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500">Local expert</p>
          <h3 className="mt-2 text-lg font-black text-gray-900">Dịch menu và tìm điểm ghé nhanh</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
            Gợi ý ngắn, dễ quét mắt và gắn với một việc cụ thể thay vì trả về đoạn chat dài.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={loadMenuTranslation}
            disabled={loadingAction !== null}
            className="rounded-2xl bg-brand-dark px-4 py-3 text-sm font-black text-white transition hover:bg-brand-dark/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loadingAction === 'menu' ? 'Đang dịch...' : 'Dịch menu'}
          </button>
          <button
            type="button"
            onClick={loadHiddenSpots}
            disabled={loadingAction !== null}
            className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-black text-gray-900 transition hover:border-brand-blue hover:bg-brand-blue/5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loadingAction === 'spots' ? 'Đang tìm...' : 'Gợi ý chơi gì quanh đây'}
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <label className="space-y-2 rounded-2xl bg-gray-50 p-4 text-sm text-gray-700">
          <span className="block text-xs font-bold uppercase tracking-[0.14em] text-gray-500">Menu mẫu</span>
          <textarea
            value={menuText}
            onChange={(event) => setMenuText(event.target.value)}
            rows={4}
            className="w-full rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-brand-blue"
          />
        </label>

        <label className="space-y-2 rounded-2xl bg-gray-50 p-4 text-sm text-gray-700">
          <span className="block text-xs font-bold uppercase tracking-[0.14em] text-gray-500">Khu vực đang đứng</span>
          <input
            value={areaLabel}
            onChange={(event) => setAreaLabel(event.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-brand-blue"
          />
          <p className="text-xs text-gray-500">Mặc định sẽ xin gợi ý để đi bộ nhanh, ngân sách vừa túi.</p>
        </label>
      </div>

      {error && (
        <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="mt-4 grid gap-3">
        {cards.length === 0 ? (
          <p className="rounded-2xl bg-gray-50 px-4 py-3 text-sm text-gray-500">
            Bấm "Dịch menu" hoặc "Gợi ý chơi gì quanh đây" để nhận card ngắn và dễ xử lý ngay.
          </p>
        ) : (
          cards.map((card, index) => (
            <article key={`${card.title ?? card.originalText ?? 'card'}-${index}`} className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="text-sm font-black text-gray-900">
                  {card.title ?? card.originalText ?? `Gợi ý ${index + 1}`}
                </h4>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${confidenceClass[card.confidenceLabel]}`}>
                  {card.confidenceLabel}
                </span>
              </div>
              {card.translatedText && (
                <p className="mt-2 text-sm font-semibold text-gray-800">{card.translatedText}</p>
              )}
              {card.whyItFits && <p className="mt-2 text-sm leading-6 text-gray-600">{card.whyItFits}</p>}
              {card.cautionNote && <p className="mt-2 text-sm leading-6 text-gray-600">{card.cautionNote}</p>}
              <div className="mt-3 rounded-2xl bg-white px-3 py-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gray-500">Bước tiếp theo</p>
                <p className="mt-1 text-sm font-medium text-gray-800">{card.nextAction}</p>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
