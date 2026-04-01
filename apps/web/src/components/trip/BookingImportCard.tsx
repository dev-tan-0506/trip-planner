'use client';

import type { BookingImportConfig, BookingImportDraft } from '../../lib/api-client';

const confidenceClass: Record<BookingImportDraft['confidenceLabel'], string> = {
  'Goi y': 'bg-emerald-100 text-emerald-700',
  'Uoc luong': 'bg-amber-100 text-amber-700',
  'Can xem lai': 'bg-rose-100 text-rose-700',
};

interface BookingImportCardProps {
  config: BookingImportConfig | null;
  drafts: BookingImportDraft[];
  loading: boolean;
  onOpenManualPaste: () => void;
  onSelectDraft: (draft: BookingImportDraft) => void;
}

export function BookingImportCard({
  config,
  drafts,
  loading,
  onOpenManualPaste,
  onSelectDraft,
}: BookingImportCardProps) {
  return (
    <section className="rounded-[28px] border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500">
            Dia chi chuyen tiep
          </p>
          <h3 className="mt-2 text-lg font-black text-gray-900">Nhap booking vao ban nhap de xem lai</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
            Ban co the forward email vao dia chi rieng cua chuyen di, hoac dan tay noi dung dat cho
            ngay tai day.
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenManualPaste}
          className="rounded-2xl bg-brand-dark px-4 py-3 text-sm font-black text-white transition hover:bg-brand-dark/90"
        >
          Dan noi dung dat cho
        </button>
      </div>

      <div className="mt-4 rounded-3xl border border-dashed border-gray-300 bg-gray-50 px-4 py-4">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-gray-500">Dia chi chuyen tiep</p>
        <p className="mt-2 break-all font-mono text-sm font-bold text-gray-900">
          {config?.forwardingAddress ?? 'booking+...@minhdidauthe.local'}
        </p>
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between gap-3">
          <h4 className="text-sm font-black text-gray-900">Ban nhap booking gan day</h4>
          {loading && <span className="text-xs text-gray-500">Dang tai...</span>}
        </div>
        <div className="mt-3 space-y-3">
          {drafts.length === 0 ? (
            <p className="rounded-2xl bg-gray-50 px-4 py-3 text-sm text-gray-500">
              Chua co booking nao duoc dua vao hang cho review.
            </p>
          ) : (
            drafts.map((draft) => (
              <button
                key={draft.id}
                type="button"
                onClick={() => onSelectDraft(draft)}
                className="flex w-full items-start justify-between gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-left transition hover:border-brand-blue hover:bg-brand-blue/5"
              >
                <div>
                  <p className="text-sm font-bold text-gray-900">
                    {draft.sourceSubject || draft.parsedItems[0]?.title || 'Ban nhap booking'}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-gray-500">{draft.parseSummary}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${confidenceClass[draft.confidenceLabel]}`}>
                  {draft.confidenceLabel}
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
