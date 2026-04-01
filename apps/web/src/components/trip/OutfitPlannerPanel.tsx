'use client';

import { useState } from 'react';
import { localExpertApi, type OutfitPlanCard } from '../../lib/api-client';

const confidenceClass: Record<OutfitPlanCard['confidenceLabel'], string> = {
  'Goi y': 'bg-emerald-100 text-emerald-700',
  'Uoc luong': 'bg-amber-100 text-amber-700',
  'Can xem lai': 'bg-sky-100 text-sky-700',
};

interface OutfitPlannerPanelProps {
  tripId: string;
}

export function OutfitPlannerPanel({ tripId }: OutfitPlannerPanelProps) {
  const [weatherLabel, setWeatherLabel] = useState('mua nhe');
  const [aestheticHint, setAestheticHint] = useState('noi bat');
  const [cards, setCards] = useState<OutfitPlanCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadOutfits = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await localExpertApi.requestOutfitPlan(tripId, {
        dayIndex: 0,
        aestheticHint,
        weatherLabel,
        activityLabels: ['di bo', 'an toi'],
      });
      setCards(result.cards.slice(0, 3));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Khong tao duoc goi y len do');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-[28px] border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500">Outfit planner</p>
          <h3 className="mt-2 text-lg font-black text-gray-900">Len do cho hom nay</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
            Toi da 3 card de chon nhanh. Neu thoi tiet hoac vibe chua chac, card se hien chip "Can xem lai".
          </p>
        </div>
        <button
          type="button"
          onClick={loadOutfits}
          disabled={loading}
          className="rounded-2xl bg-brand-dark px-4 py-3 text-sm font-black text-white transition hover:bg-brand-dark/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Dang goi y...' : 'Len do cho hom nay'}
        </button>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <label className="space-y-2 rounded-2xl bg-gray-50 p-4 text-sm text-gray-700">
          <span className="block text-xs font-bold uppercase tracking-[0.14em] text-gray-500">Thoi tiet</span>
          <input
            value={weatherLabel}
            onChange={(event) => setWeatherLabel(event.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-brand-blue"
          />
        </label>
        <label className="space-y-2 rounded-2xl bg-gray-50 p-4 text-sm text-gray-700">
          <span className="block text-xs font-bold uppercase tracking-[0.14em] text-gray-500">Mood</span>
          <input
            value={aestheticHint}
            onChange={(event) => setAestheticHint(event.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-brand-blue"
          />
        </label>
      </div>

      {error && (
        <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        {cards.length === 0 ? (
          <p className="rounded-2xl bg-gray-50 px-4 py-3 text-sm text-gray-500 lg:col-span-3">
            Chua co goi y nao. Bam "Len do cho hom nay" de nhan toi da 3 option gon nhe.
          </p>
        ) : (
          cards.slice(0, 3).map((card) => (
            <article key={card.title} className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="text-sm font-black text-gray-900">{card.title}</h4>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${confidenceClass[card.confidenceLabel]}`}>
                  {card.confidenceLabel}
                </span>
              </div>
              <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.16em] text-gray-500">Huong mau</p>
              <p className="mt-1 text-sm font-medium text-gray-800">{card.colorDirection}</p>
              <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.16em] text-gray-500">Packing notes</p>
              <p className="mt-1 text-sm leading-6 text-gray-600">{card.packingNotes}</p>
              <div className="mt-3 rounded-2xl bg-white px-3 py-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gray-500">Buoc tiep theo</p>
                <p className="mt-1 text-sm font-medium text-gray-800">{card.nextAction}</p>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
