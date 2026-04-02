'use client';

import { useEffect, useMemo, useState } from 'react';
import { localExpertApi, type DayGroup, type OutfitPlanCard, type SafetyOverviewSnapshot } from '../../lib/api-client';

const confidenceClass: Record<OutfitPlanCard['confidenceLabel'], string> = {
  'Gợi ý': 'bg-emerald-100 text-emerald-700',
  'Ước lượng': 'bg-amber-100 text-amber-700',
  'Cần xem lại': 'bg-sky-100 text-sky-700',
};

interface OutfitPlannerPanelProps {
  tripId: string;
  days?: DayGroup[];
  weatherForecast?: SafetyOverviewSnapshot['weather'];
}

function buildActivityLabels(day: DayGroup | undefined) {
  if (!day) {
    return ['đi bộ', 'ăn tối'];
  }

  const labels = day.items
    .map((item) => item.title.trim())
    .filter(Boolean)
    .slice(0, 3);

  return labels.length > 0 ? labels : ['đi bộ', 'ăn tối'];
}

function buildWeatherLabel(
  forecast: SafetyOverviewSnapshot['weather'][number] | undefined,
  fallback = 'trời âm',
) {
  if (!forecast) {
    return fallback;
  }

  if (forecast.rainChancePercent >= 50) {
    return `${forecast.condition}, dễ mưa ${forecast.rainChancePercent}%`;
  }

  return `${forecast.condition}, khoảng ${forecast.temperatureC}°C`;
}

function getDefaultDayIndex(days: DayGroup[]) {
  const lastDayWithItems = [...days].reverse().find((day) => day.items.length > 0);
  return lastDayWithItems?.dayIndex ?? days[0]?.dayIndex ?? 0;
}

export function OutfitPlannerPanel({
  tripId,
  days = [],
  weatherForecast = [],
}: OutfitPlannerPanelProps) {
  const [selectedDayIndex, setSelectedDayIndex] = useState(() => getDefaultDayIndex(days));
  const [weatherLabel, setWeatherLabel] = useState('trời âm');
  const [aestheticHint, setAestheticHint] = useState('nổi bật');
  const [cards, setCards] = useState<OutfitPlanCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [weatherTouched, setWeatherTouched] = useState(false);

  useEffect(() => {
    setSelectedDayIndex(getDefaultDayIndex(days));
  }, [days]);

  const dayOptions = useMemo(() => {
    if (!days.length) {
      return [{ dayIndex: 0, label: 'Ngày 1' }];
    }

    return days.map((day) => ({
      dayIndex: day.dayIndex,
      label: `Ngày ${day.dayIndex + 1}${day.items.length > 0 ? ` · ${day.items.length} hoạt động` : ''}`,
    }));
  }, [days]);

  const selectedDay = useMemo(
    () => days.find((day) => day.dayIndex === selectedDayIndex),
    [days, selectedDayIndex],
  );

  const selectedForecast = weatherForecast[selectedDayIndex];

  useEffect(() => {
    setWeatherTouched(false);
    setWeatherLabel(buildWeatherLabel(selectedForecast));
  }, [selectedDayIndex, selectedForecast]);

  const loadOutfits = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await localExpertApi.requestOutfitPlan(tripId, {
        dayIndex: selectedDayIndex,
        aestheticHint,
        weatherLabel,
        activityLabels: buildActivityLabels(selectedDay),
      });
      setCards(result.cards.slice(0, 3));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tạo được gợi ý lên đồ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-[28px] border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500">Outfit planner</p>
          <h3 className="mt-2 text-lg font-black text-gray-900">Lên đồ cho hôm nay</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
            Tối đa 3 card để chọn nhanh. Nếu thời tiết hoặc vibe chưa chắc, card sẽ hiện chip "Cần xem lại".
          </p>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
            Planner sẽ ưu tiên lấy ngày hành trình và gợi ý thời tiết từ ngữ cảnh chuyến đi, nhưng bạn vẫn có thể sửa tay trước khi chạy.
          </p>
        </div>
        <button
          type="button"
          onClick={loadOutfits}
          disabled={loading}
          className="rounded-2xl bg-brand-dark px-4 py-3 text-sm font-black text-white transition hover:bg-brand-dark/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Đang gợi ý...' : 'Lên đồ cho hôm nay'}
        </button>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <label className="space-y-2 rounded-2xl bg-gray-50 p-4 text-sm text-gray-700">
          <span className="block text-xs font-bold uppercase tracking-[0.14em] text-gray-500">Ngày hành trình</span>
          <select
            value={selectedDayIndex}
            onChange={(event) => setSelectedDayIndex(Number(event.target.value))}
            className="w-full rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-brand-blue"
          >
            {dayOptions.map((option) => (
              <option key={option.dayIndex} value={option.dayIndex}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2 rounded-2xl bg-gray-50 p-4 text-sm text-gray-700">
          <span className="block text-xs font-bold uppercase tracking-[0.14em] text-gray-500">Thời tiết</span>
          <input
            value={weatherLabel}
            onChange={(event) => {
              setWeatherTouched(true);
              setWeatherLabel(event.target.value);
            }}
            className="w-full rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-brand-blue"
          />
          {selectedForecast && !weatherTouched && (
            <p className="text-xs text-gray-500">Đang dùng gợi ý từ tab Quỹ & an toàn cho ngày này.</p>
          )}
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

      <div className="mt-4 rounded-2xl bg-gray-50 px-4 py-3 text-sm text-gray-600">
        <span className="font-bold text-gray-800">Ngữ cảnh ngày chọn:</span>{' '}
        {buildActivityLabels(selectedDay).join(' · ')}
      </div>

      {error && (
        <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        {cards.length === 0 ? (
          <p className="rounded-2xl bg-gray-50 px-4 py-3 text-sm text-gray-500 lg:col-span-3">
            Chưa có gợi ý nào. Bấm "Lên đồ cho hôm nay" để nhận tối đa 3 option gọn nhẹ.
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
              <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.16em] text-gray-500">Hướng màu</p>
              <p className="mt-1 text-sm font-medium text-gray-800">{card.colorDirection}</p>
              <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.16em] text-gray-500">Packing notes</p>
              <p className="mt-1 text-sm leading-6 text-gray-600">{card.packingNotes}</p>
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
