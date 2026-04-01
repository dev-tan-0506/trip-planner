'use client';

import type { HealthWarning } from '../../lib/api-client';

const severityLabel: Record<HealthWarning['severity'], string> = {
  LUU_Y: 'Luu y',
  CAN_XEM_LAI: 'Can xem lai',
  NGUY_CO_CAO: 'Nguy co cao',
};

const severityStyle: Record<HealthWarning['severity'], string> = {
  LUU_Y: 'border-amber-200 bg-amber-50 text-amber-800',
  CAN_XEM_LAI: 'border-sky-200 bg-sky-50 text-sky-800',
  NGUY_CO_CAO: 'border-rose-200 bg-rose-50 text-rose-800',
};

export function HealthConflictBadge({ warning }: { warning: HealthWarning }) {
  return (
    <div className={`rounded-2xl border px-3 py-2 text-xs ${severityStyle[warning.severity]}`}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-white/80 px-2 py-0.5 font-black">
          {severityLabel[warning.severity]}
        </span>
        <span className="font-semibold">{warning.title}</span>
        <span className="text-[11px] opacity-80">{warning.confidenceLabel}</span>
      </div>
      <p className="mt-1 leading-5">{warning.message}</p>
    </div>
  );
}
