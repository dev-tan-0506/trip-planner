'use client';

import type { FundSnapshot } from '../../lib/api-client';

interface FundOverviewPanelProps {
  snapshot: FundSnapshot;
}

function formatMoney(value: string, currency: string) {
  const numeric = Number(value);
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(Number.isFinite(numeric) ? numeric : 0);
}

export function FundOverviewPanel({ snapshot }: FundOverviewPanelProps) {
  const currency = snapshot.fund?.currency ?? 'VND';
  const stats = [
    { label: 'Mục tiêu', value: snapshot.summary.targetAmount },
    { label: 'Đã góp', value: snapshot.summary.collectedAmount },
    { label: 'Đã chi', value: snapshot.summary.spentAmount },
    { label: 'Còn lại', value: snapshot.summary.remainingAmount },
  ];

  return (
    <div className="space-y-4 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-black text-gray-900">Quỹ chung</p>
          <p className="mt-1 text-sm text-gray-500">
            Theo dõi quỹ chuyến đi theo kiểu summary-first, nhẹ đầu và rõ ràng.
          </p>
        </div>
        <div className="rounded-full bg-brand-blue/10 px-3 py-1 text-xs font-black text-brand-blue">
          Đã dùng {snapshot.summary.burnRatePercent}%
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <div key={item.label} className="rounded-2xl bg-brand-light px-4 py-4">
            <p className="text-xs font-black uppercase tracking-wide text-gray-400">{item.label}</p>
            <p className="mt-2 text-2xl font-black text-gray-900">
              {formatMoney(item.value, currency)}
            </p>
          </div>
        ))}
      </div>

      {snapshot.hasFund ? (
        <div className="rounded-2xl bg-brand-blue/5 px-4 py-3 text-sm text-gray-600">
          Burn-rate hiện tại đang dựa trên số tiền đã chi thực tế từ server, không tính bằng phép cộng ở trình duyệt.
        </div>
      ) : (
        <div className="rounded-2xl bg-gray-50 px-4 py-5 text-sm text-gray-500">
          Chưa mở quỹ cho chuyến đi. Trưởng đoàn có thể tạo quỹ để cả nhóm theo dõi và góp tiền tại đây.
        </div>
      )}
    </div>
  );
}
