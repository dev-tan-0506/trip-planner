'use client';

import type { CulinaryRouteSuggestion } from '../../lib/api-client';

const confidenceClass: Record<CulinaryRouteSuggestion['confidenceLabel'], string> = {
  'Gợi ý': 'bg-emerald-100 text-emerald-700',
  'Ước lượng': 'bg-amber-100 text-amber-700',
  'Cần xem lại': 'bg-sky-100 text-sky-700',
};

interface CulinaryRouteCardProps {
  suggestion: CulinaryRouteSuggestion;
  canApply: boolean;
  applying: boolean;
  onApply: () => void;
}

export function CulinaryRouteCard({
  suggestion,
  canApply,
  applying,
  onApply,
}: CulinaryRouteCardProps) {
  return (
    <section className="rounded-[28px] border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center gap-3">
        <h3 className="text-base font-black text-gray-900">Bản nháp lộ trình ăn uống</h3>
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${confidenceClass[suggestion.confidenceLabel]}`}>
          {suggestion.confidenceLabel}
        </span>
        <span className="text-xs text-gray-500">
          {suggestion.totalEstimatedMinutes} phút di chuyển dự kiến
        </span>
      </div>

      <ol className="mt-4 space-y-3">
        {suggestion.orderedItems.map((stop, index) => (
          <li key={stop.itemId} className="rounded-2xl bg-gray-50 px-4 py-3">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-brand-dark text-xs font-black text-white">
                {index + 1}
              </span>
              <div className="space-y-1">
                <p className="text-sm font-bold text-gray-900">{stop.title}</p>
                <p className="text-xs text-gray-500">Ngày {stop.dayIndex + 1} · điểm {stop.sortOrder}</p>
                <p className="text-xs leading-5 text-gray-600">{stop.reason}</p>
              </div>
            </div>
          </li>
        ))}
      </ol>

      {canApply ? (
        <button
          type="button"
          onClick={onApply}
          disabled={applying}
          className="mt-4 rounded-2xl bg-brand-dark px-4 py-3 text-sm font-black text-white transition hover:bg-brand-dark/90 disabled:cursor-wait disabled:opacity-70"
        >
          {applying ? 'Đang áp dụng...' : 'Áp dụng vào lịch trình'}
        </button>
      ) : (
        <p className="mt-4 rounded-2xl bg-gray-100 px-4 py-3 text-xs text-gray-600">
          Chỉ trưởng đoàn mới có thể áp dụng gợi ý này vào lịch trình chính.
        </p>
      )}
    </section>
  );
}
