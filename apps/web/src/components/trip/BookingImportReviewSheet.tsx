'use client';

import { useEffect, useState } from 'react';
import type { BookingImportDraft, BookingImportParsedItem } from '../../lib/api-client';

interface BookingImportReviewSheetProps {
  open: boolean;
  draft: BookingImportDraft | null;
  canConfirm: boolean;
  creating: boolean;
  confirming: boolean;
  onClose: () => void;
  onCreateDraft: (rawContent: string) => Promise<void>;
  onConfirm: (items: BookingImportParsedItem[]) => Promise<void>;
}

export function BookingImportReviewSheet({
  open,
  draft,
  canConfirm,
  creating,
  confirming,
  onClose,
  onCreateDraft,
  onConfirm,
}: BookingImportReviewSheetProps) {
  const [rawContent, setRawContent] = useState('');
  const [items, setItems] = useState<BookingImportParsedItem[]>([]);

  useEffect(() => {
    setItems(draft?.parsedItems ?? []);
    setRawContent(draft?.rawContent ?? '');
  }, [draft]);

  if (!open) {
    return null;
  }

  const updateItem = (
    index: number,
    field: keyof BookingImportParsedItem,
    value: string | string[],
  ) => {
    setItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-gray-900/40 md:items-center md:justify-center">
      <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-[32px] bg-white p-5 shadow-2xl md:max-w-4xl md:rounded-[32px]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500">Booking review</p>
            <h3 className="mt-2 text-xl font-black text-gray-900">Kiểm tra bản nháp booking trước khi đưa vào lịch</h3>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              Nội dung này không được đưa vào lịch trình cho tới khi người dẫn đầu xác nhận lại.
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded-2xl bg-gray-100 px-3 py-2 text-sm font-bold text-gray-700">
            Đóng
          </button>
        </div>

        {!draft && (
          <div className="mt-5 space-y-3">
            <label className="block text-sm font-bold text-gray-900">
              Dán nội dung đặt chỗ
              <textarea
                value={rawContent}
                onChange={(event) => setRawContent(event.target.value)}
                rows={8}
                className="mt-2 w-full rounded-3xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-brand-blue"
                placeholder="Dán email, booking code, giờ nhận phòng, giờ bay..."
              />
            </label>
            <button
              type="button"
              onClick={() => onCreateDraft(rawContent)}
              disabled={creating || rawContent.trim().length === 0}
              className="rounded-2xl bg-brand-dark px-4 py-3 text-sm font-black text-white transition hover:bg-brand-dark/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {creating ? 'Đang tách booking...' : 'Tạo bản nháp booking'}
            </button>
          </div>
        )}

        {draft && (
          <div className="mt-5 space-y-4">
            {draft.confidenceLabel === 'Cần xem lại' && (
              <div className="rounded-3xl border border-amber-200 bg-amber-50 px-4 py-4">
                <p className="text-sm font-black text-amber-900">Cần xem lại</p>
                <p className="mt-1 text-sm leading-6 text-amber-800">
                  Hệ thống thấy một vài trường đang mơ hồ. Bạn nên đối chiếu với raw excerpt trước khi xác nhận.
                </p>
              </div>
            )}

            <div className="rounded-3xl border border-gray-200 bg-gray-50 px-4 py-4">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-gray-500">Raw excerpt</p>
              <pre className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-700">{draft.rawContent}</pre>
            </div>

            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={`${draft.id}-${index}`} className="rounded-3xl border border-gray-200 p-4">
                  <div className="grid gap-3 md:grid-cols-2">
                    <label className="text-sm font-bold text-gray-900">
                      Tiêu đề
                      <input
                        value={item.title}
                        onChange={(event) => updateItem(index, 'title', event.target.value)}
                        className="mt-2 w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm"
                      />
                    </label>
                    <label className="text-sm font-bold text-gray-900">
                      Địa điểm
                      <input
                        value={item.locationName ?? ''}
                        onChange={(event) => updateItem(index, 'locationName', event.target.value)}
                        className="mt-2 w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm"
                      />
                    </label>
                    <label className="text-sm font-bold text-gray-900">
                      Giờ bắt đầu
                      <input
                        value={item.startTime ?? ''}
                        onChange={(event) => updateItem(index, 'startTime', event.target.value)}
                        className="mt-2 w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm"
                      />
                    </label>
                    <label className="text-sm font-bold text-gray-900">
                      Mã booking
                      <input
                        value={item.bookingCode ?? ''}
                        onChange={(event) => updateItem(index, 'bookingCode', event.target.value)}
                        className="mt-2 w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm"
                      />
                    </label>
                  </div>
                  {item.missingFields.length > 0 && (
                    <p className="mt-3 text-xs font-semibold text-rose-600">
                      Trường cần bổ sung: {item.missingFields.join(', ')}
                    </p>
                  )}
                  <details className="mt-3 rounded-2xl bg-gray-50 px-3 py-2">
                    <summary className="cursor-pointer text-xs font-bold text-gray-600">Xem raw excerpt</summary>
                    <p className="mt-2 text-sm leading-6 text-gray-700">{item.rawExcerpt}</p>
                  </details>
                </div>
              ))}
            </div>

            {canConfirm ? (
              <button
                type="button"
                onClick={() => onConfirm(items)}
                disabled={confirming || items.length === 0}
                className="rounded-2xl bg-brand-dark px-4 py-3 text-sm font-black text-white transition hover:bg-brand-dark/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {confirming ? 'Đang nhập vào lịch...' : 'Nhập vào lịch trình'}
              </button>
            ) : (
              <p className="rounded-2xl bg-gray-100 px-4 py-3 text-sm text-gray-600">
                Bạn vẫn có thể sửa thông tin, nhưng chỉ trưởng đoàn mới có thể nhấn "Nhập vào lịch trình".
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
