'use client';

import { useEffect, useState } from 'react';
import {
  bookingImportApi,
  type BookingImportConfig,
  type BookingImportDraft,
  type BookingImportParsedItem,
  itineraryApi,
  type CulinaryRouteSuggestion,
  type ItineraryItem,
  type ItinerarySnapshot,
} from '../../lib/api-client';
import { BookingImportCard } from './BookingImportCard';
import { BookingImportReviewSheet } from './BookingImportReviewSheet';
import { CulinaryRouteCard } from './CulinaryRouteCard';
import { LocalExpertPanel } from './LocalExpertPanel';
import { OutfitPlannerPanel } from './OutfitPlannerPanel';

function isFoodStop(item: ItineraryItem) {
  const text = `${item.title} ${item.locationName ?? ''} ${item.shortNote ?? ''}`.toLowerCase();
  return ['an', 'quan', 'bun', 'pho', 'com', 'che', 'tra', 'cafe', 'hai san'].some((keyword) =>
    text.includes(keyword),
  );
}

interface AiAssistTabProps {
  tripId: string;
  initialSnapshot?: ItinerarySnapshot | null;
  onSnapshotUpdate?: (snapshot: ItinerarySnapshot) => void;
}

export function AiAssistTab({
  tripId,
  initialSnapshot = null,
  onSnapshotUpdate,
}: AiAssistTabProps) {
  const [snapshot, setSnapshot] = useState<ItinerarySnapshot | null>(initialSnapshot);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [suggestion, setSuggestion] = useState<CulinaryRouteSuggestion | null>(null);
  const [loading, setLoading] = useState(!initialSnapshot);
  const [requesting, setRequesting] = useState(false);
  const [applying, setApplying] = useState(false);
  const [bookingConfig, setBookingConfig] = useState<BookingImportConfig | null>(null);
  const [bookingDrafts, setBookingDrafts] = useState<BookingImportDraft[]>([]);
  const [loadingBooking, setLoadingBooking] = useState(true);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [selectedDraft, setSelectedDraft] = useState<BookingImportDraft | null>(null);
  const [creatingDraft, setCreatingDraft] = useState(false);
  const [confirmingDraft, setConfirmingDraft] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialSnapshot) {
      setSnapshot(initialSnapshot);
      return;
    }

    let active = true;
    itineraryApi
      .getSnapshot(tripId)
      .then((nextSnapshot) => {
        if (!active) return;
        setSnapshot(nextSnapshot);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Khong tai duoc du lieu AI');
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [initialSnapshot, tripId]);

  useEffect(() => {
    if (!snapshot) return;
    const defaultSelection = snapshot.days
      .flatMap((day) => day.items)
      .filter(isFoodStop)
      .slice(0, 4)
      .map((item) => item.id);
    setSelectedItemIds((current) => (current.length > 0 ? current : defaultSelection));
  }, [snapshot]);

  useEffect(() => {
    let active = true;
    setLoadingBooking(true);
    Promise.all([
      bookingImportApi.getBookingImportConfig(tripId),
      bookingImportApi.listBookingImportDrafts(tripId),
    ])
      .then(([config, drafts]) => {
        if (!active) return;
        setBookingConfig(config);
        setBookingDrafts(drafts);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Khong tai duoc booking import');
      })
      .finally(() => {
        if (active) {
          setLoadingBooking(false);
        }
      });

    return () => {
      active = false;
    };
  }, [tripId]);

  const foodStops = snapshot?.days.flatMap((day) => day.items).filter(isFoodStop) ?? [];

  const toggleItem = (itemId: string) => {
    setSelectedItemIds((current) =>
      current.includes(itemId) ? current.filter((id) => id !== itemId) : [...current, itemId],
    );
  };

  const requestSuggestion = async () => {
    if (selectedItemIds.length < 2) {
      setError('Can chon it nhat 2 diem an uong de goi y lo trinh.');
      return;
    }

    try {
      setRequesting(true);
      setError(null);
      const nextSuggestion = await itineraryApi.requestCulinaryRoute(tripId, {
        itemIds: selectedItemIds,
      });
      setSuggestion(nextSuggestion);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Khong tao duoc goi y AI');
    } finally {
      setRequesting(false);
    }
  };

  const applySuggestion = async () => {
    if (!suggestion) return;

    try {
      setApplying(true);
      setError(null);
      const nextSnapshot = await itineraryApi.applyCulinaryRoute(tripId, {
        orderedItemIds: suggestion.orderedItems.map((item) => item.itemId),
        sourceSuggestionId: suggestion.suggestionId,
      });
      setSnapshot(nextSnapshot);
      onSnapshotUpdate?.(nextSnapshot);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Khong ap dung duoc goi y');
    } finally {
      setApplying(false);
    }
  };

  const refreshBookingDrafts = async () => {
    const drafts = await bookingImportApi.listBookingImportDrafts(tripId);
    setBookingDrafts(drafts);
    return drafts;
  };

  const createBookingDraft = async (rawContent: string) => {
    try {
      setCreatingDraft(true);
      setError(null);
      const draft = await bookingImportApi.createBookingImportDraft(tripId, { rawContent });
      setSelectedDraft(draft);
      setReviewOpen(true);
      await refreshBookingDrafts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Khong tao duoc ban nhap booking');
    } finally {
      setCreatingDraft(false);
    }
  };

  const confirmBookingDraft = async (items: BookingImportParsedItem[]) => {
    if (!selectedDraft) return;

    try {
      setConfirmingDraft(true);
      setError(null);
      const result = await bookingImportApi.confirmBookingImportDraft(tripId, selectedDraft.id, {
        parsedItems: items,
      });
      setSelectedDraft(result.draft);
      setSnapshot(result.snapshot);
      onSnapshotUpdate?.(result.snapshot);
      await refreshBookingDrafts();
      setReviewOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Khong nhap duoc booking vao lich trinh');
    } finally {
      setConfirmingDraft(false);
    }
  };

  return (
    <div className="space-y-4">
      <section className="rounded-[28px] border border-gray-200 bg-gradient-to-br from-amber-50 via-white to-sky-50 p-5 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500">Tro ly AI</p>
        <h2 className="mt-2 text-xl font-black text-gray-900">Goi y lo trinh an uong</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
          Day la ban nhap de duyet. Lich trinh chi doi thu tu sau khi truong doan bam
          {' '}
          "Ap dung vao lich trinh".
        </p>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
          Booking duoc phan tich truoc, nhung khong duoc dua vao lich trinh cho toi khi ban review
          xong va leader xac nhan.
        </p>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
          Them hai tac vu nhe hon ben duoi: dich menu, tim diem ghe nhanh, va len do bang card ngan.
        </p>
      </section>

      {loading ? (
        <div className="rounded-3xl bg-white p-6 text-sm text-gray-500 shadow-sm">Dang tai ngu canh chuyen di...</div>
      ) : (
        <section className="rounded-[28px] border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-black text-gray-900">Chon diem an dang muon ghe</h3>
              <p className="text-xs text-gray-500">AI se sap xep thu tu di chuyen gon de ca nhom xem lai.</p>
            </div>
            <button
              type="button"
              onClick={requestSuggestion}
              disabled={requesting || foodStops.length < 2}
              className="rounded-2xl bg-brand-dark px-4 py-3 text-sm font-black text-white transition hover:bg-brand-dark/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {requesting ? 'Dang goi y...' : 'Goi y lo trinh an uong'}
            </button>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {foodStops.map((item) => (
              <label
                key={item.id}
                className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 text-sm transition ${
                  selectedItemIds.includes(item.id)
                    ? 'border-brand-blue bg-brand-blue/5'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={selectedItemIds.includes(item.id)}
                  onChange={() => toggleItem(item.id)}
                />
                <span>
                  <span className="block font-bold text-gray-900">{item.title}</span>
                  <span className="block text-xs text-gray-500">
                    Ngay {item.dayIndex + 1}
                    {item.locationName ? ` · ${item.locationName}` : ''}
                  </span>
                </span>
              </label>
            ))}
          </div>

          {foodStops.length === 0 && (
            <p className="mt-4 rounded-2xl bg-gray-50 px-4 py-3 text-sm text-gray-500">
              Chua co diem an nao trong lich trinh de AI sap tuyen.
            </p>
          )}
        </section>
      )}

      {selectedItemIds.length > 0 && snapshot && (
        <section className="rounded-[28px] border border-dashed border-gray-300 bg-white/80 p-5">
          <h3 className="text-sm font-black text-gray-900">Cac diem dang chon</h3>
          <ul className="mt-3 flex flex-wrap gap-2">
            {selectedItemIds.map((itemId) => {
              const item = snapshot.days.flatMap((day) => day.items).find((candidate) => candidate.id === itemId);
              if (!item) return null;
              return (
                <li key={itemId} className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                  {item.title}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {suggestion && (
        <CulinaryRouteCard
          suggestion={suggestion}
          canApply={snapshot?.isLeader ?? false}
          applying={applying}
          onApply={applySuggestion}
        />
      )}

      <BookingImportCard
        config={bookingConfig}
        drafts={bookingDrafts}
        loading={loadingBooking}
        onOpenManualPaste={() => {
          setSelectedDraft(null);
          setReviewOpen(true);
        }}
        onSelectDraft={(draft) => {
          setSelectedDraft(draft);
          setReviewOpen(true);
        }}
      />

      <LocalExpertPanel tripId={tripId} />

      <OutfitPlannerPanel tripId={tripId} />

      <BookingImportReviewSheet
        open={reviewOpen}
        draft={selectedDraft}
        canConfirm={snapshot?.isLeader ?? false}
        creating={creatingDraft}
        confirming={confirmingDraft}
        onClose={() => setReviewOpen(false)}
        onCreateDraft={createBookingDraft}
        onConfirm={confirmBookingDraft}
      />
    </div>
  );
}
