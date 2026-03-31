'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  connectSafetySocket,
  fundApi,
  safetyApi,
  type FundSnapshot,
  type SafetyDirectoryEntry,
  type SafetyOverviewSnapshot,
  type SafetyWarningsSnapshot,
} from '../../lib/api-client';
import { useAuthStore } from '../../store/useAuthStore';
import { Loader2, RefreshCw } from 'lucide-react';
import { FundOverviewPanel } from './FundOverviewPanel';
import { FundContributionSheet } from './FundContributionSheet';
import { SafetyOverviewPanel } from './SafetyOverviewPanel';
import { SafetyDirectoryList } from './SafetyDirectoryList';
import { CulturalWarningBanner } from './CulturalWarningBanner';
import { SOSPanel } from './SOSPanel';

interface FinanceSafetyTabProps {
  tripId: string;
}

export function FinanceSafetyTab({ tripId }: FinanceSafetyTabProps) {
  const { user, isHydrated } = useAuthStore();
  const [fundSnapshot, setFundSnapshot] = useState<FundSnapshot | null>(null);
  const [safetyOverview, setSafetyOverview] = useState<SafetyOverviewSnapshot | null>(null);
  const [directoryEntries, setDirectoryEntries] = useState<SafetyDirectoryEntry[]>([]);
  const [warningSnapshot, setWarningSnapshot] = useState<SafetyWarningsSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const [fund, overview, directory, warnings] = await Promise.all([
        fundApi.getFund(tripId),
        safetyApi.getSafetyOverview(tripId),
        safetyApi.getSafetyDirectory(tripId),
        safetyApi.getSafetyWarnings(tripId),
      ]);
      setFundSnapshot(fund);
      setSafetyOverview(overview);
      setDirectoryEntries(directory);
      setWarningSnapshot(warnings);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tải được quỹ và an toàn');
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    if (!isHydrated || !user) return;
    fetchAll();
  }, [fetchAll, isHydrated, user]);

  useEffect(() => {
    if (!user) return;
    const socket = connectSafetySocket();

    socket.on('connect', () => {
      socket.emit('safety.join', { tripId, userId: user.id });
    });

    socket.on('safety.snapshot', (payload: SafetyWarningsSnapshot) => {
      setWarningSnapshot(payload);
    });

    socket.on('safety.updated', () => {
      fetchAll();
    });

    return () => {
      socket.emit('safety.leave', { tripId });
      socket.disconnect();
    };
  }, [fetchAll, tripId, user]);

  const runBusy = async (task: () => Promise<void>) => {
    try {
      setBusy(true);
      await task();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không cập nhật được ngay lúc này. Thử lại một lần nữa hoặc làm mới trang.');
    } finally {
      setBusy(false);
    }
  };

  if (loading && !fundSnapshot) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 size={28} className="animate-spin text-brand-blue" />
      </div>
    );
  }

  if (!fundSnapshot) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-gray-900">Quỹ & an toàn</h2>
          <p className="text-sm text-gray-500">
            Theo dõi quỹ chuyến đi, dự báo 5 ngày, danh bạ khẩn cấp và SOS trong cùng một tab.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchAll}
          className="rounded-2xl bg-white p-3 text-gray-400 shadow-sm transition-all hover:text-brand-blue"
          title="Làm mới"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {error && (
        <div className="rounded-2xl bg-brand-coral/10 px-4 py-3 text-sm font-medium text-brand-coral">
          {error}
        </div>
      )}

      <FundOverviewPanel snapshot={fundSnapshot} />

      <FundContributionSheet
        snapshot={fundSnapshot}
        busy={busy}
        onCreateOrUpdateFund={(payload) =>
          runBusy(async () => {
            const next = fundSnapshot.hasFund
              ? await fundApi.updateFund(tripId, payload)
              : await fundApi.createFund(tripId, payload);
            setFundSnapshot(next);
          })
        }
        onSubmitContribution={(payload) =>
          runBusy(async () => {
            const next = await fundApi.submitContribution(tripId, payload);
            setFundSnapshot(next);
          })
        }
        onConfirmContribution={(contributionId) =>
          runBusy(async () => {
            const next = await fundApi.confirmContribution(tripId, contributionId);
            setFundSnapshot(next);
          })
        }
      />

      <SafetyOverviewPanel snapshot={safetyOverview} />
      <SafetyDirectoryList entries={directoryEntries} />
      <CulturalWarningBanner warnings={warningSnapshot?.warnings ?? []} />
      <SOSPanel
        snapshot={warningSnapshot}
        busy={busy}
        onSend={(body) =>
          runBusy(async () => {
            const next = await safetyApi.createSosAlert(tripId, body);
            setWarningSnapshot(next);
          })
        }
        onAcknowledge={(alertId) =>
          runBusy(async () => {
            const next = await safetyApi.acknowledgeSafetyAlert(tripId, alertId);
            setWarningSnapshot(next);
          })
        }
        onResolve={(alertId) =>
          runBusy(async () => {
            const next = await safetyApi.resolveSafetyAlert(tripId, alertId);
            setWarningSnapshot(next);
          })
        }
      />
    </div>
  );
}
