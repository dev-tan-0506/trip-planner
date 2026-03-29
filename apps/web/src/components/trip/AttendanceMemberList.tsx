'use client';

import { MapPin, ShieldCheck, UserRound, XCircle } from 'lucide-react';
import { AttendanceMemberRow, toApiAssetUrl } from '../../lib/api-client';

interface AttendanceMemberListProps {
  members: AttendanceMemberRow[];
}

export function AttendanceMemberList({ members }: AttendanceMemberListProps) {
  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <p className="text-sm font-black text-gray-900">Danh sách thành viên</p>
        <p className="text-xs text-gray-500">Người chưa đến luôn được đẩy lên đầu</p>
      </div>

      <div className="space-y-3">
        {members.map((member) => {
          const photoUrl = toApiAssetUrl(member.photoUrl);
          return (
            <div
              key={member.tripMemberId}
              className="flex items-start gap-3 rounded-2xl border border-gray-100 px-4 py-3"
            >
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt={member.name || 'Proof'}
                  className="h-12 w-12 rounded-2xl object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100">
                  <UserRound size={18} className="text-gray-400" />
                </div>
              )}

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-black text-gray-900">
                    {member.name || 'Thành viên'}
                  </p>
                  <span className="rounded-full bg-gray-100 px-2 py-1 text-[11px] font-bold text-gray-500">
                    {member.role === 'LEADER' ? 'Leader' : 'Member'}
                  </span>
                  {member.status === 'ARRIVED' && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-brand-green/10 px-2 py-1 text-[11px] font-black text-brand-green">
                      <ShieldCheck size={11} />
                      Đã đến
                    </span>
                  )}
                  {member.status === 'NO_LOCATION' && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-brand-yellow/15 px-2 py-1 text-[11px] font-black text-brand-coral">
                      <MapPin size={11} />
                      Thiếu vị trí
                    </span>
                  )}
                  {member.status === 'MISSING' && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-brand-coral/10 px-2 py-1 text-[11px] font-black text-brand-coral">
                      <XCircle size={11} />
                      Chưa đến
                    </span>
                  )}
                </div>

                <div className="mt-2 space-y-1 text-xs text-gray-500">
                  <p>
                    {member.hasSubmitted && member.submittedAt
                      ? `Check-in lúc ${new Date(member.submittedAt).toLocaleTimeString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}`
                      : 'Chưa gửi ảnh check-in'}
                  </p>
                  {member.accuracyMeters != null && (
                    <p>Độ chính xác vị trí: ~{Math.round(member.accuracyMeters)}m</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
