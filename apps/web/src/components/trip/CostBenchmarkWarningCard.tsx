'use client';

import type { CostBenchmarkWarning, HealthWarningSeverity } from '../../lib/api-client';

interface CostBenchmarkWarningCardProps {
  warnings: CostBenchmarkWarning[];
  currency: string;
  destinationLabel?: string | null;
}

const severityCopy: Record<HealthWarningSeverity, string> = {
  LUU_Y: 'Luu y',
  CAN_XEM_LAI: 'Can xem lai',
  NGUY_CO_CAO: 'Nguy co cao',
};

const severityClass: Record<HealthWarningSeverity, string> = {
  LUU_Y: 'bg-emerald-100 text-emerald-700',
  CAN_XEM_LAI: 'bg-amber-100 text-amber-700',
  NGUY_CO_CAO: 'bg-rose-100 text-rose-700',
};

function formatMoney(value: string | null, currency: string) {
  const numeric = Number(value);
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(Number.isFinite(numeric) ? numeric : 0);
}

export function CostBenchmarkWarningCard({
  warnings,
  currency,
  destinationLabel,
}: CostBenchmarkWarningCardProps) {
  if (warnings.length === 0) {
    return null;
  }

  return (
    <section className="rounded-3xl border border-amber-100 bg-gradient-to-br from-amber-50 via-white to-orange-50 p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">Chi phi dia phuong</p>
          <h3 className="mt-2 text-lg font-black text-gray-900">
            Canh bao mem de doi chieu gia chi tieu voi mat bang tai {destinationLabel ?? 'diem den nay'}.
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
            Day la lop goi y trong luong nhe, khong chan thao tac nhap chi phi. Neu muc gia vuot moc, hay xem lai so luong, vi tri va phu thu truoc khi chot.
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3">
        {warnings.map((warning) => (
          <article key={warning.expenseId} className="rounded-2xl border border-amber-100 bg-white/90 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-sm font-black text-gray-900">{warning.title}</h4>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${severityClass[warning.severity]}`}>
                {severityCopy[warning.severity]}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                {warning.confidenceLabel}
              </span>
            </div>

            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl bg-amber-50 px-4 py-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-amber-700">Muc da nhap</p>
                <p className="mt-1 text-lg font-black text-gray-900">{formatMoney(warning.amount, currency)}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">Median dia phuong</p>
                <p className="mt-1 text-lg font-black text-gray-900">
                  {formatMoney(warning.benchmarkMedianAmount, currency)}
                </p>
              </div>
            </div>

            <div className="mt-3 rounded-2xl bg-gray-50 px-4 py-3 text-sm leading-6 text-gray-600">
              <p className="font-semibold text-gray-800">{warning.note}</p>
              <p className="mt-2">
                Nguon doi chieu: <span className="font-semibold text-gray-800">{warning.sourceLabel}</span>
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
