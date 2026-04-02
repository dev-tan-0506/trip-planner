'use client';

import { ChangeEvent, useMemo, useRef, useState } from 'react';
import { FileArchive, FileText, Loader2, ShieldCheck, UploadCloud } from 'lucide-react';
import {
  toApiAssetUrl,
  type ReviewVaultDocumentPayload,
  type UploadVaultDocumentPayload,
  type VaultDocumentKind,
  type VaultDocumentRow,
  type VaultSnapshot,
} from '../../lib/api-client';

interface DigitalVaultPanelProps {
  snapshot: VaultSnapshot | null;
  loading: boolean;
  busy: boolean;
  onUpload: (payload: UploadVaultDocumentPayload) => Promise<void>;
  onReview: (documentId: string, payload: ReviewVaultDocumentPayload) => Promise<void>;
}

const kindOptions: Array<{ value: VaultDocumentKind; label: string }> = [
  { value: 'ID_CARD', label: 'CCCD / CMND' },
  { value: 'PASSPORT', label: 'Hộ chiếu' },
  { value: 'FLIGHT_TICKET', label: 'Vé máy bay' },
  { value: 'HOTEL_BOOKING', label: 'Xác nhận khách sạn' },
  { value: 'OTHER', label: 'Giấy tờ khác' },
];

const statusLabelMap: Record<VaultDocumentRow['status'], string> = {
  PENDING_REVIEW: 'Chờ duyệt',
  READY_FOR_CHECK_IN: 'Sẵn sàng check-in',
  ARCHIVED: 'Lưu trữ',
};

function formatDateLabel(value: string) {
  return new Date(value).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Không đọc được tệp'));
      }
    };
    reader.onerror = () => reject(new Error('Không đọc được tệp'));
    reader.readAsDataURL(file);
  });
}

export function DigitalVaultPanel({
  snapshot,
  loading,
  busy,
  onUpload,
  onReview,
}: DigitalVaultPanelProps) {
  const uploadInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedKind, setSelectedKind] = useState<VaultDocumentKind>('PASSPORT');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const documentCountLabel = useMemo(() => {
    if (!snapshot) return 'Chưa có giấy tờ nào';
    return snapshot.isLeader
      ? `${snapshot.documents.length} giấy tờ trong kho chung`
      : `${snapshot.documents.length} giấy tờ của bạn`;
  }, [snapshot]);

  const handleFilePicked = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setError(null);
      setStatusMessage('Đang đọc tệp để gửi lên Kho tạm...');
      const fileDataUrl = await fileToDataUrl(file);
      await onUpload({
        documentKind: selectedKind,
        fileName: file.name,
        mimeType: file.type,
        fileDataUrl,
      });
      setStatusMessage('Tải giấy tờ thành công. Trạng thái hiện là Chờ duyệt.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tải được giấy tờ');
    } finally {
      event.target.value = '';
    }
  };

  const handleReview = async (
    documentId: string,
    status: ReviewVaultDocumentPayload['status'],
  ) => {
    try {
      setError(null);
      setStatusMessage('Đang cập nhật trạng thái giấy tờ...');
      await onReview(documentId, { status });
      setStatusMessage(
        status === 'READY_FOR_CHECK_IN'
          ? 'Giấy tờ đã được chuyển sang Sẵn sàng check-in.'
          : 'Giấy tờ đã được chuyển vào Lưu trữ.',
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không cập nhật được giấy tờ');
    }
  };

  return (
    <section className="rounded-[28px] border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500">Digital Vault</p>
          <h3 className="mt-2 text-xl font-black text-gray-900">Kho tạm cho một chuyến đi</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
            Giấy tờ ở đây chỉ phục vụ check-in và điều phối ngắn hạn, không phải kho lưu trữ lâu dài.
          </p>
        </div>

        <div className="rounded-2xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
          {snapshot?.retentionLabel ?? 'Tài liệu sẽ được giữ tạm sau chuyến đi.'}
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4 rounded-3xl border border-dashed border-gray-200 bg-gray-50 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-brand-blue/10 p-3 text-brand-blue">
              <ShieldCheck size={20} />
            </div>
            <div>
              <p className="text-sm font-black text-gray-900">{snapshot?.isLeader ? 'Góc nhìn trưởng đoàn' : 'Góc nhìn thành viên'}</p>
              <p className="text-xs text-gray-500">{documentCountLabel}</p>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-4 text-sm text-gray-600">
            <p className="font-bold text-gray-900">Hỗ trợ tệp</p>
            <p className="mt-1">Tải ảnh hoặc PDF để leader xem nhanh khi cần check-in tập thể.</p>
            <p className="mt-2 text-xs text-gray-500">
              {snapshot?.supportedMimeTypes.join(' · ') ?? 'image/jpeg · image/png · image/webp · application/pdf'}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <select
              value={selectedKind}
              onChange={(event) => setSelectedKind(event.target.value as VaultDocumentKind)}
              className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 outline-none focus:border-brand-blue"
            >
              {kindOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => uploadInputRef.current?.click()}
              disabled={loading || busy}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-dark px-4 py-3 text-sm font-black text-white transition hover:bg-brand-dark/90 disabled:opacity-60"
            >
              {busy ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />}
              Tải ảnh hoặc PDF
            </button>
            <input
              ref={uploadInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              className="hidden"
              onChange={handleFilePicked}
            />
          </div>

          {statusMessage && (
            <div className="rounded-2xl bg-brand-blue/10 px-4 py-3 text-sm font-medium text-brand-blue">
              {statusMessage}
            </div>
          )}

          {error && (
            <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
              {error}
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white p-4">
          <p className="text-sm font-black text-gray-900">Trạng thái nổi bật</p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs font-black">
            <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-800">Chờ duyệt</span>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-800">Sẵn sàng check-in</span>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-700">Lưu trữ</span>
          </div>
          <p className="mt-4 text-sm leading-6 text-gray-600">
            Leader thấy toàn bộ ảnh/PDF của nhóm để điều phối, còn thành viên chỉ thấy giấy tờ của chính mình.
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {loading && (
          <div className="rounded-2xl bg-gray-50 px-4 py-5 text-sm text-gray-500">
            Đang tải Kho tạm...
          </div>
        )}

        {!loading && snapshot && snapshot.documents.length === 0 && (
          <div className="rounded-2xl bg-gray-50 px-4 py-5 text-sm text-gray-500">
            Chưa có giấy tờ nào trong Kho tạm.
          </div>
        )}

        {!loading &&
          snapshot?.documents.map((document) => (
            <article
              key={document.id}
              className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-black text-gray-700">
                      {kindOptions.find((option) => option.value === document.kind)?.label ?? document.kind}
                    </span>
                    <span className="rounded-full bg-brand-blue/10 px-3 py-1 text-xs font-black text-brand-blue">
                      {statusLabelMap[document.status]}
                    </span>
                  </div>
                  <p className="text-base font-black text-gray-900">{document.fileName}</p>
                  <p className="text-sm text-gray-600">
                    Người tải: {document.uploadedBy.name ?? 'Thành viên'} · Hạn giữ: {formatDateLabel(document.expiresAt)}
                  </p>
                  {document.note && <p className="text-sm text-gray-500">{document.note}</p>}
                </div>

                <div className="flex flex-col items-start gap-2 sm:items-end">
                  <a
                    href={toApiAssetUrl(document.fileUrl) ?? '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 px-4 py-2 text-sm font-bold text-gray-700 transition hover:border-brand-blue hover:text-brand-blue"
                  >
                    {document.mimeType === 'application/pdf' ? <FileText size={16} /> : <FileArchive size={16} />}
                    Xem tệp
                  </a>

                  {snapshot.isLeader && (
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={busy || document.status === 'READY_FOR_CHECK_IN'}
                        onClick={() => handleReview(document.id, 'READY_FOR_CHECK_IN')}
                        className="rounded-2xl bg-emerald-600 px-3 py-2 text-xs font-black text-white transition hover:bg-emerald-700 disabled:opacity-60"
                      >
                        Duyệt check-in
                      </button>
                      <button
                        type="button"
                        disabled={busy || document.status === 'ARCHIVED'}
                        onClick={() => handleReview(document.id, 'ARCHIVED')}
                        className="rounded-2xl bg-gray-900 px-3 py-2 text-xs font-black text-white transition hover:bg-gray-800 disabled:opacity-60"
                      >
                        Chuyển lưu trữ
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </article>
          ))}
      </div>
    </section>
  );
}
