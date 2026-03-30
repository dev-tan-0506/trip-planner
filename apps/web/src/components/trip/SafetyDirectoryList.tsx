'use client';

import type { SafetyDirectoryEntry } from '../../lib/api-client';

interface SafetyDirectoryListProps {
  entries: SafetyDirectoryEntry[];
}

export function SafetyDirectoryList({ entries }: SafetyDirectoryListProps) {
  return (
    <div className="space-y-4 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
      <div>
        <p className="text-sm font-black text-gray-900">Danh bạ khẩn cấp</p>
        <p className="mt-1 text-sm text-gray-500">Các đầu mối đã xác minh để cả nhóm xử lý nhanh khi cần.</p>
      </div>

      {entries.length === 0 ? (
        <div className="rounded-2xl bg-gray-50 px-4 py-5 text-sm text-gray-500">
          Chưa có đầu mối phù hợp ở thời điểm này.
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((item) => (
            <div key={item.id} className="rounded-2xl bg-brand-light px-4 py-4">
              <p className="text-sm font-black text-gray-900">{item.title}</p>
              <p className="mt-1 text-xs font-semibold text-gray-500">{item.kind}</p>
              <p className="mt-2 text-sm text-gray-600">{item.address}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {item.phone && (
                  <a
                    href={`tel:${item.phone}`}
                    className="rounded-xl bg-brand-dark px-3 py-2 text-xs font-black text-white"
                  >
                    Gọi ngay
                  </a>
                )}
                {item.lat != null && item.lng != null && (
                  <a
                    href={`https://www.google.com/maps?q=${item.lat},${item.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl bg-white px-3 py-2 text-xs font-black text-gray-700"
                  >
                    Mở bản đồ
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
