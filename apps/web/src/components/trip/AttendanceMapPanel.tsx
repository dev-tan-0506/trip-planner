'use client';

import dynamic from 'next/dynamic';
import { MapPinned } from 'lucide-react';
import type { AttendanceSnapshot } from '../../lib/api-client';

interface AttendanceMapPanelProps {
  snapshot: AttendanceSnapshot;
}

const DynamicAttendanceMapCanvas = dynamic(
  () => import('./AttendanceMapCanvas').then((mod) => mod.AttendanceMapCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[320px] items-center justify-center bg-gray-50 text-sm text-gray-400">
        Đang tải map check-in...
      </div>
    ),
  },
);

export function AttendanceMapPanel({ snapshot }: AttendanceMapPanelProps) {
  return (
    <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-4">
        <MapPinned size={18} className="text-brand-blue" />
        <div>
          <p className="text-sm font-black text-gray-900">Bản đồ check-in</p>
          <p className="text-xs text-gray-500">map-first dashboard cho leader và thành viên</p>
        </div>
      </div>
      <DynamicAttendanceMapCanvas snapshot={snapshot} />
    </div>
  );
}
