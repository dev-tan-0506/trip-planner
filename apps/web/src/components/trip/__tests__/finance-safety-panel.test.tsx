import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FinanceSafetyTab } from '../FinanceSafetyTab';
import { SOSPanel } from '../SOSPanel';
import type {
  FundSnapshot,
  SafetyDirectoryEntry,
  SafetyOverviewSnapshot,
  SafetyWarningsSnapshot,
} from '../../../lib/api-client';

const mockFundSnapshot: FundSnapshot = {
  tripId: 'trip-1',
  hasFund: true,
  isLeader: true,
  currentTripMemberId: 'tm-leader',
  fund: {
    id: 'fund-1',
    status: 'ACTIVE',
    currency: 'VND',
    targetAmount: '2000000',
    collectedAmount: '500000',
    spentAmount: '100000',
    remainingAmount: '1900000',
    burnRatePercent: '5',
    momoQrPayload: { rawText: 'MOMO-QR' },
    bankQrPayload: { url: 'https://vietqr.io/qr' },
    ownerTripMemberId: 'tm-leader',
  },
  contributions: [],
  expenses: [],
  summary: {
    targetAmount: '2000000',
    collectedAmount: '500000',
    spentAmount: '100000',
    remainingAmount: '1900000',
    burnRatePercent: '5',
  },
  roleFlags: {
    canManageFund: true,
    canSubmitContribution: true,
    canConfirmContribution: true,
    canCreateExpense: true,
  },
};

const mockMemberFundSnapshot: FundSnapshot = {
  ...mockFundSnapshot,
  isLeader: false,
  roleFlags: {
    ...mockFundSnapshot.roleFlags,
    canManageFund: false,
  },
};

const mockOverview: SafetyOverviewSnapshot = {
  tripId: 'trip-1',
  destinationLabel: 'Da Nang',
  contextLabel: 'Da Nang • 2026-06-10',
  weather: [
    {
      date: '2026-06-10',
      label: 'Da Nang - Hôm nay',
      condition: 'Nắng nhẹ',
      temperatureC: 31,
      rainChancePercent: 10,
    },
  ],
  crowd: [
    {
      locationLabel: 'Da Nang - trung tâm',
      level: 'CAO',
      note: 'Nên đi sớm hơn 30 phút để tránh chen đông.',
    },
  ],
  directoryQuickPicks: [],
};

const mockDirectory: SafetyDirectoryEntry[] = [
  {
    id: 'dir-1',
    kind: 'CLINIC',
    title: 'Phòng khám gần biển',
    phone: '02361234567',
    address: '12 Trần Phú',
    lat: 16.0678,
    lng: 108.2208,
    source: 'stub',
    verifiedAt: new Date().toISOString(),
  },
];

const mockWarnings: SafetyWarningsSnapshot = {
  tripId: 'trip-1',
  warnings: [
    {
      id: 'culture-1',
      title: 'Lưu ý văn hóa',
      message: 'Nếu ghé chùa, nên ăn mặc kín đáo và giữ trật tự.',
      linkedItineraryItemId: null,
    },
  ],
  alerts: [],
  quickDial: [
    { label: '113', phone: '113' },
    { label: '114', phone: '114' },
    { label: '115', phone: '115' },
  ],
};

vi.mock('../../../store/useAuthStore', () => ({
  useAuthStore: () => ({
    user: { id: 'u-leader' },
    isHydrated: true,
  }),
}));

vi.mock('../../../lib/api-client', async () => {
  const actual = await vi.importActual('../../../lib/api-client');
  return {
    ...actual,
    fundApi: {
      getFund: vi.fn(),
      createFund: vi.fn(),
      updateFund: vi.fn(),
      submitContribution: vi.fn(),
      confirmContribution: vi.fn(),
      createExpense: vi.fn(),
    },
    safetyApi: {
      getSafetyOverview: vi.fn(),
      getSafetyDirectory: vi.fn(),
      getSafetyWarnings: vi.fn(),
      createSosAlert: vi.fn(),
      acknowledgeSafetyAlert: vi.fn(),
      resolveSafetyAlert: vi.fn(),
    },
    connectSafetySocket: vi.fn(() => ({
      on: vi.fn(),
      emit: vi.fn(),
      disconnect: vi.fn(),
    })),
  };
});

import { fundApi, safetyApi } from '../../../lib/api-client';

describe('FinanceSafetyTab', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fundApi.getFund).mockResolvedValue(mockFundSnapshot);
    vi.mocked(safetyApi.getSafetyOverview).mockResolvedValue(mockOverview);
    vi.mocked(safetyApi.getSafetyDirectory).mockResolvedValue(mockDirectory);
    vi.mocked(safetyApi.getSafetyWarnings).mockResolvedValue(mockWarnings);
    vi.mocked(safetyApi.createSosAlert).mockResolvedValue({
      ...mockWarnings,
      alerts: [
        {
          id: 'alert-1',
          type: 'SOS',
          status: 'OPEN',
          message: 'Mình bị lạc nhóm',
          createdAt: new Date().toISOString(),
          linkedItineraryItemId: null,
          createdBy: null,
        },
      ],
    });
    vi.stubGlobal('Notification', {
      permission: 'denied',
      requestPermission: vi.fn().mockResolvedValue('denied'),
    });
  });

  it('renders Quỹ & an toàn summary cards and finance surfaces', async () => {
    vi.mocked(fundApi.getFund).mockResolvedValue(mockMemberFundSnapshot);
    render(<FinanceSafetyTab tripId="trip-1" />);

    expect(await screen.findByText('Quỹ chung')).toBeInTheDocument();
    expect(screen.getByText('Mục tiêu')).toBeInTheDocument();
    expect(screen.getByText('Đã góp')).toBeInTheDocument();
    expect(screen.getByText('Đã chi')).toBeInTheDocument();
    expect(screen.getByText('MoMo')).toBeInTheDocument();
    expect(screen.getByText('Chuyển khoản')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Xem mã góp quỹ' })).toBeInTheDocument();
  });

  it('renders safety overview, directory actions and cultural warning banner', async () => {
    render(<FinanceSafetyTab tripId="trip-1" />);

    expect(await screen.findByText('Dự báo 5 ngày')).toBeInTheDocument();
    expect(screen.getByText('Mức đông')).toBeInTheDocument();
    expect(screen.getByText('Gọi ngay')).toBeInTheDocument();
    expect(screen.getByText('Mở bản đồ')).toBeInTheDocument();
    expect(screen.getAllByText('Lưu ý văn hóa').length).toBeGreaterThan(0);
  });

  it('sends SOS and shows urgent follow-up state with quick dials', async () => {
    const onSend = vi.fn().mockResolvedValue(undefined);
    const onAcknowledge = vi.fn().mockResolvedValue(undefined);
    const onResolve = vi.fn().mockResolvedValue(undefined);

    render(
      <SOSPanel
        snapshot={{
          ...mockWarnings,
          alerts: [
            {
              id: 'alert-1',
              type: 'SOS',
              status: 'OPEN',
              message: 'Mình bị lạc nhóm',
              createdAt: new Date().toISOString(),
              linkedItineraryItemId: null,
              createdBy: null,
            },
          ],
        }}
        onSend={onSend}
        onAcknowledge={onAcknowledge}
        onResolve={onResolve}
      />,
    );

    const sosButton = screen.getByRole('button', { name: 'Gửi SOS' });
    fireEvent.change(screen.getByPlaceholderText('Mô tả ngắn tình huống nếu bạn kịp nhập...'), {
      target: { value: 'Mình bị lạc nhóm' },
    });

    await act(async () => {
      fireEvent.click(sosButton);
    });

    expect(onSend).toHaveBeenCalled();
    expect(screen.getByText('Đã gửi cảnh báo')).toBeInTheDocument();
    expect(screen.getByText('113')).toBeInTheDocument();
    expect(screen.getByText('114')).toBeInTheDocument();
    expect(screen.getByText('115')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Notification' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Đã an toàn, tắt khẩn cấp' })).toBeInTheDocument();
  });

  it('dedupes browser notifications and lets user resolve SOS state', async () => {
    const onSend = vi.fn().mockResolvedValue(undefined);
    const onAcknowledge = vi.fn().mockResolvedValue(undefined);
    const onResolve = vi.fn().mockResolvedValue(undefined);
    const notificationMock = vi.fn();
    vi.stubGlobal('Notification', Object.assign(notificationMock, {
      permission: 'granted',
      requestPermission: vi.fn().mockResolvedValue('granted'),
    }));

    const alertSnapshot = {
      ...mockWarnings,
      alerts: [
        {
          id: 'alert-1',
          type: 'SOS',
          status: 'OPEN',
          message: 'Mình bị lạc nhóm',
          createdAt: new Date().toISOString(),
          linkedItineraryItemId: null,
          createdBy: null,
        },
      ],
    } satisfies SafetyWarningsSnapshot;
    const resolvedAlert = {
      ...alertSnapshot.alerts[0]!,
      status: 'RESOLVED',
    };

    const { rerender } = render(
      <SOSPanel
        snapshot={alertSnapshot}
        onSend={onSend}
        onAcknowledge={onAcknowledge}
        onResolve={onResolve}
      />,
    );

    expect(notificationMock).toHaveBeenCalledTimes(1);

    rerender(
      <SOSPanel
        snapshot={{ ...alertSnapshot }}
        onSend={onSend}
        onAcknowledge={onAcknowledge}
        onResolve={onResolve}
      />,
    );

    expect(notificationMock).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'Đã an toàn, tắt khẩn cấp' }));
    expect(onResolve).toHaveBeenCalledWith('alert-1');

    rerender(
      <SOSPanel
        snapshot={{
          ...alertSnapshot,
          alerts: [resolvedAlert],
        }}
        onSend={onSend}
        onAcknowledge={onAcknowledge}
        onResolve={onResolve}
      />,
    );

    expect(screen.getByText('Tình huống đã khép lại')).toBeInTheDocument();
    expect(screen.getByText('Đã an toàn')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Đã an toàn, tắt khẩn cấp' })).not.toBeInTheDocument();
  });
});
