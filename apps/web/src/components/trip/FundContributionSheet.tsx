'use client';

import { useMemo, useState } from 'react';
import type { FundSnapshot } from '../../lib/api-client';

interface FundContributionSheetProps {
  snapshot: FundSnapshot;
  busy?: boolean;
  onCreateOrUpdateFund: (payload: {
    targetAmount: string;
    currency?: string;
    momoQrPayload?: Record<string, unknown>;
    bankQrPayload?: Record<string, unknown>;
  }) => Promise<void>;
  onSubmitContribution: (payload: {
    declaredAmount: string;
    method: 'MOMO' | 'BANK_TRANSFER' | 'CASH' | 'OTHER';
    transferNote?: string;
  }) => Promise<void>;
  onConfirmContribution: (contributionId: string) => Promise<void>;
}

function extractQrText(payload: Record<string, unknown> | null | undefined) {
  if (!payload) return null;
  if (typeof payload.rawText === 'string') return payload.rawText;
  if (typeof payload.url === 'string') return payload.url;
  return JSON.stringify(payload, null, 2);
}

export function FundContributionSheet({
  snapshot,
  busy,
  onCreateOrUpdateFund,
  onSubmitContribution,
  onConfirmContribution,
}: FundContributionSheetProps) {
  const [targetAmount, setTargetAmount] = useState(snapshot.fund?.targetAmount ?? '1500000');
  const [currency, setCurrency] = useState(snapshot.fund?.currency ?? 'VND');
  const [momoQrPayload, setMomoQrPayload] = useState(
    snapshot.fund?.momoQrPayload ? JSON.stringify(snapshot.fund.momoQrPayload, null, 2) : '',
  );
  const [bankQrPayload, setBankQrPayload] = useState(
    snapshot.fund?.bankQrPayload ? JSON.stringify(snapshot.fund.bankQrPayload, null, 2) : '',
  );
  const [declaredAmount, setDeclaredAmount] = useState('');
  const [transferNote, setTransferNote] = useState('');

  const pendingRows = useMemo(
    () => snapshot.contributions.filter((item) => item.status === 'PLEDGED'),
    [snapshot.contributions],
  );

  const momoText = extractQrText(snapshot.fund?.momoQrPayload);
  const bankText = extractQrText(snapshot.fund?.bankQrPayload);

  return (
    <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
      <div className="space-y-4 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
        <div>
          <p className="text-sm font-black text-gray-900">
            {snapshot.isLeader ? 'Cấu hình quỹ và mã góp quỹ' : 'Góp quỹ cho chuyến đi'}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Một bề mặt góp quỹ thống nhất cho MoMo và Chuyển khoản, để ai cũng biết phải làm gì tiếp theo.
          </p>
        </div>

        {snapshot.isLeader ? (
          <div className="space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              <input
                value={targetAmount}
                onChange={(event) => setTargetAmount(event.target.value)}
                placeholder="Mục tiêu quỹ"
                className="rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-brand-blue"
              />
              <input
                value={currency}
                onChange={(event) => setCurrency(event.target.value)}
                placeholder="currency"
                className="rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-brand-blue"
              />
            </div>
            <textarea
              value={momoQrPayload}
              onChange={(event) => setMomoQrPayload(event.target.value)}
              placeholder='MoMo QR payload JSON, ví dụ {"rawText":"MOMO-QR"}'
              className="min-h-[110px] w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-brand-blue"
            />
            <textarea
              value={bankQrPayload}
              onChange={(event) => setBankQrPayload(event.target.value)}
              placeholder='Chuyển khoản QR payload JSON, ví dụ {"url":"https://vietqr.io/..."}'
              className="min-h-[110px] w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-brand-blue"
            />
            <button
              type="button"
              disabled={busy}
              onClick={() =>
                onCreateOrUpdateFund({
                  targetAmount,
                  currency,
                  momoQrPayload: momoQrPayload ? JSON.parse(momoQrPayload) : undefined,
                  bankQrPayload: bankQrPayload ? JSON.parse(bankQrPayload) : undefined,
                })
              }
              className="rounded-2xl bg-brand-dark px-4 py-3 text-sm font-black text-white"
            >
              {snapshot.hasFund ? 'Cập nhật quỹ chuyến đi' : 'Mở quỹ chuyến đi'}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl bg-brand-light px-4 py-4">
                <p className="text-xs font-black uppercase tracking-wide text-gray-400">MoMo</p>
                <pre className="mt-2 whitespace-pre-wrap break-words text-xs text-gray-600">
                  {momoText ?? 'MoMo sẽ hiện ở đây khi trưởng đoàn cấu hình xong.'}
                </pre>
              </div>
              <div className="rounded-2xl bg-brand-light px-4 py-4">
                <p className="text-xs font-black uppercase tracking-wide text-gray-400">Chuyển khoản</p>
                <pre className="mt-2 whitespace-pre-wrap break-words text-xs text-gray-600">
                  {bankText ?? 'Chuyển khoản sẽ hiện ở đây khi trưởng đoàn cấu hình xong.'}
                </pre>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <input
                value={declaredAmount}
                onChange={(event) => setDeclaredAmount(event.target.value)}
                placeholder="Số tiền bạn đã góp"
                className="rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-brand-blue"
              />
              <input
                value={transferNote}
                onChange={(event) => setTransferNote(event.target.value)}
                placeholder="Ghi chú chuyển khoản"
                className="rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-brand-blue"
              />
            </div>
            <button
              type="button"
              disabled={busy || !declaredAmount}
              onClick={() =>
                onSubmitContribution({
                  declaredAmount,
                  method: momoText ? 'MOMO' : 'BANK_TRANSFER',
                  transferNote,
                })
              }
              className="rounded-2xl bg-brand-blue px-4 py-3 text-sm font-black text-white"
            >
              Xem mã góp quỹ
            </button>
          </div>
        )}
      </div>

      <div className="space-y-4 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
        <div>
          <p className="text-sm font-black text-gray-900">Trạng thái góp quỹ</p>
          <p className="mt-1 text-sm text-gray-500">
            Phân biệt rõ Đang chờ xác nhận và Đã xác nhận để cả nhóm không phải đoán.
          </p>
        </div>

        {snapshot.contributions.length === 0 ? (
          <div className="rounded-2xl bg-gray-50 px-4 py-5 text-sm text-gray-500">
            Chưa có xác nhận góp quỹ nào.
          </div>
        ) : (
          <div className="space-y-3">
            {snapshot.contributions.map((item) => (
              <div key={item.id} className="rounded-2xl bg-brand-light px-4 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-black text-gray-900">{item.member.name ?? 'Thành viên'}</p>
                    <p className="mt-1 text-xs text-gray-500">
                      {item.method === 'MOMO' ? 'MoMo' : item.method === 'BANK_TRANSFER' ? 'Chuyển khoản' : item.method}
                      {item.transferNote ? ` • ${item.transferNote}` : ''}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-black ${
                      item.status === 'CONFIRMED'
                        ? 'bg-brand-green/15 text-brand-green'
                        : 'bg-brand-yellow/20 text-gray-700'
                    }`}
                  >
                    {item.status === 'CONFIRMED' ? 'Đã xác nhận' : 'Đang chờ xác nhận'}
                  </span>
                </div>
                {snapshot.isLeader && item.status === 'PLEDGED' && (
                  <button
                    type="button"
                    onClick={() => onConfirmContribution(item.id)}
                    className="mt-3 rounded-xl bg-brand-dark px-3 py-2 text-xs font-black text-white"
                  >
                    Xác nhận khoản góp
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {snapshot.isLeader && pendingRows.length > 0 && (
          <div className="rounded-2xl bg-brand-yellow/15 px-4 py-3 text-sm text-gray-700">
            Còn {pendingRows.length} khoản góp đang chờ leader xác nhận.
          </div>
        )}
      </div>
    </div>
  );
}
