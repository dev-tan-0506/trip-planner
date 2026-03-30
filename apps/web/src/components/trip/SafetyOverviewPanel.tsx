'use client';

import type { SafetyOverviewSnapshot } from '../../lib/api-client';

interface SafetyOverviewPanelProps {
  snapshot: SafetyOverviewSnapshot | null;
}

export function SafetyOverviewPanel({ snapshot }: SafetyOverviewPanelProps) {
  if (!snapshot || (snapshot.weather.length === 0 && snapshot.crowd.length === 0)) {
    return (
      <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
        <p className="text-sm font-black text-gray-900">Dự báo 5 ngày</p>
        <p className="mt-3 text-sm text-gray-500">
          Bọn mình chưa lấy được dự báo mới. Thử làm mới lại sau ít phút.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
      <div>
        <p className="text-sm font-black text-gray-900">Dự báo 5 ngày</p>
        <p className="mt-1 text-sm text-gray-500">{snapshot.contextLabel}</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {snapshot.weather.map((item) => (
          <div key={item.date} className="rounded-2xl bg-brand-light px-4 py-4">
            <p className="text-xs font-black uppercase tracking-wide text-gray-400">{item.label}</p>
            <p className="mt-2 text-lg font-black text-gray-900">{item.condition}</p>
            <p className="mt-1 text-sm text-gray-600">{item.temperatureC}°C • Mưa {item.rainChancePercent}%</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <p className="text-sm font-black text-gray-900">Mức đông</p>
        {snapshot.crowd.map((item) => (
          <div key={item.locationLabel} className="rounded-2xl bg-brand-yellow/10 px-4 py-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-black text-gray-900">{item.locationLabel}</p>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-gray-700">
                {item.level === 'CAO' ? 'Cao' : item.level === 'VUA' ? 'Vừa' : 'Thấp'}
              </span>
            </div>
            <p className="mt-2 text-sm text-gray-600">{item.note}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
