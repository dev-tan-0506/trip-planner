'use client';

import { RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import {
  memoriesApi,
  type FeedbackSnapshot,
  type ReviewVaultDocumentPayload,
  type ReunionSnapshot,
  type SouvenirSnapshot,
  type UploadVaultDocumentPayload,
  type VaultSnapshot,
} from '../../lib/api-client';
import { AnonymousFeedbackPanel } from './AnonymousFeedbackPanel';
import { DigitalVaultPanel } from './DigitalVaultPanel';
import { ReunionOrganizerPanel } from './ReunionOrganizerPanel';
import { SouvenirReminderCard } from './SouvenirReminderCard';

interface MemoriesTabProps {
  tripId: string;
}

export function MemoriesTab({ tripId }: MemoriesTabProps) {
  const [vaultSnapshot, setVaultSnapshot] = useState<VaultSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [feedbackSnapshot, setFeedbackSnapshot] = useState<FeedbackSnapshot | null>(null);
  const [souvenirSnapshot, setSouvenirSnapshot] = useState<SouvenirSnapshot | null>(null);
  const [reunionSnapshot, setReunionSnapshot] = useState<ReunionSnapshot | null>(null);

  const loadVault = useCallback(async () => {
    try {
      setLoading(true);
      const [vault, feedback, souvenirs, reunion] = await Promise.all([
        memoriesApi.getVaultSnapshot(tripId),
        memoriesApi.getFeedbackSnapshot(tripId),
        memoriesApi.getSouvenirSnapshot(tripId),
        memoriesApi.getReunionSnapshot(tripId),
      ]);
      setVaultSnapshot(vault);
      setFeedbackSnapshot(feedback);
      setSouvenirSnapshot(souvenirs);
      setReunionSnapshot(reunion);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tải được kho tạm');
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    loadVault();
  }, [loadVault]);

  const handleUpload = async (payload: UploadVaultDocumentPayload) => {
    setBusy(true);
    try {
      const snapshot = await memoriesApi.uploadVaultDocument(tripId, payload);
      setVaultSnapshot(snapshot);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tải được giấy tờ');
      throw err;
    } finally {
      setBusy(false);
    }
  };

  const handleReview = async (documentId: string, payload: ReviewVaultDocumentPayload) => {
    setBusy(true);
    try {
      const snapshot = await memoriesApi.reviewVaultDocument(tripId, documentId, payload);
      setVaultSnapshot(snapshot);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không cập nhật được trạng thái giấy tờ');
      throw err;
    } finally {
      setBusy(false);
    }
  };

  const handleFeedbackUpdate = async (snapshot: FeedbackSnapshot) => {
    setFeedbackSnapshot(snapshot);
  };

  return (
    <div className="space-y-4">
      <section className="rounded-[28px] border border-gray-200 bg-gradient-to-br from-sky-50 via-white to-amber-50 p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500">Kỷ niệm</p>
            <h2 className="mt-2 text-xl font-black text-gray-900">Những thứ cần giữ gọn sau chuyến đi</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
              Tab này là ngôi nhà chung cho Kho tạm, góp ý ẩn danh, quà lưu niệm và hẹn reunion của Phase 6.
            </p>
          </div>
          <button
            type="button"
            onClick={loadVault}
            disabled={loading || busy}
            className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-700 transition hover:border-brand-blue hover:text-brand-blue disabled:opacity-60"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Làm mới
          </button>
        </div>
      </section>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <DigitalVaultPanel
        snapshot={vaultSnapshot}
        loading={loading}
        busy={busy}
        onUpload={handleUpload}
        onReview={handleReview}
      />

      {feedbackSnapshot && feedbackSnapshot.isEligible && (
        <AnonymousFeedbackPanel
          snapshot={feedbackSnapshot}
          busy={busy}
          onSnapshotUpdate={handleFeedbackUpdate}
          tripId={tripId}
        />
      )}

      {souvenirSnapshot && <SouvenirReminderCard snapshot={souvenirSnapshot} />}

      {reunionSnapshot && (
        <ReunionOrganizerPanel
          tripId={tripId}
          snapshot={reunionSnapshot}
          onSnapshotUpdate={setReunionSnapshot}
        />
      )}
    </div>
  );
}
