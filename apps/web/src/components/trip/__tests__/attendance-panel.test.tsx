import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AttendanceTab } from '../AttendanceTab';
import type { AttendanceSnapshot } from '../../../lib/api-client';

function buildSnapshot(overrides?: Partial<AttendanceSnapshot>): AttendanceSnapshot {
  const base: AttendanceSnapshot = {
    tripId: 'trip-1',
    isLeader: true,
    currentTripMemberId: 'tm-leader',
    session: {
      id: 'session-1',
      tripId: 'trip-1',
      title: 'Điểm tập trung',
      meetingLabel: 'Cổng chính',
      meetingAddress: '1 Le Loi',
      lat: 16.0,
      lng: 108.2,
      opensAt: new Date().toISOString(),
      closesAt: new Date(Date.now() + 1000 * 60 * 30).toISOString(),
      status: 'OPEN',
    },
    counts: {
      arrived: 1,
      missing: 1,
      noLocation: 0,
    },
    mapPoints: [
      {
        tripMemberId: 'tm-leader',
        name: 'Leader A',
        lat: 16.01,
        lng: 108.21,
        status: 'ARRIVED',
      },
    ],
    members: [
      {
        tripMemberId: 'tm-member',
        userId: 'u-member',
        name: 'Member B',
        avatarUrl: null,
        role: 'MEMBER',
        hasSubmitted: false,
        submittedAt: null,
        status: 'MISSING',
        photoUrl: null,
        lat: null,
        lng: null,
        accuracyMeters: null,
        locationStatus: null,
      },
      {
        tripMemberId: 'tm-leader',
        userId: 'u-leader',
        name: 'Leader A',
        avatarUrl: null,
        role: 'LEADER',
        hasSubmitted: true,
        submittedAt: new Date().toISOString(),
        status: 'ARRIVED',
        photoUrl: null,
        lat: 16.01,
        lng: 108.21,
        accuracyMeters: 12,
        locationStatus: 'GRANTED',
      },
    ],
  };

  return {
    ...base,
    ...overrides,
    session: overrides?.session === undefined ? base.session : overrides.session,
    counts: overrides?.counts ?? base.counts,
    mapPoints: overrides?.mapPoints ?? base.mapPoints,
    members: overrides?.members ?? base.members,
  };
}

vi.mock('../../../store/useAuthStore', () => ({
  useAuthStore: () => ({
    user: { id: 'u-leader' },
    isHydrated: true,
  }),
}));

vi.mock('../AttendanceMapPanel', () => ({
  AttendanceMapPanel: () => <div>map</div>,
}));

vi.mock('../CheckInCaptureSheet', () => ({
  CheckInCaptureSheet: ({ open }: { open: boolean }) =>
    open ? <div data-testid="capture-sheet">capture-sheet-open</div> : null,
}));

vi.mock('../../../lib/api-client', async () => {
  const actual = await vi.importActual('../../../lib/api-client');
  return {
    ...actual,
    attendanceApi: {
      getCurrentSession: vi.fn(),
      createSession: vi.fn(),
      submitProof: vi.fn(),
      closeSession: vi.fn(),
    },
    connectAttendanceSocket: vi.fn(() => ({
      on: vi.fn(),
      emit: vi.fn(),
      disconnect: vi.fn(),
    })),
  };
});

import { attendanceApi } from '../../../lib/api-client';

describe('Check-in', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders dashboard counts and missing member first', async () => {
    vi.mocked(attendanceApi.getCurrentSession).mockResolvedValue(buildSnapshot());

    render(<AttendanceTab tripId="trip-1" />);

    expect((await screen.findAllByText('Đã đến')).length).toBeGreaterThan(0);
    expect(screen.getAllByText('Chưa đến').length).toBeGreaterThan(0);
    expect(screen.getByText('map')).toBeInTheDocument();
    expect(screen.getByText('Member B')).toBeInTheDocument();
  });

  it('cho phép leader thấy check-in CTA và giữ nguyên nút quản lý phiên', async () => {
    vi.mocked(attendanceApi.getCurrentSession).mockResolvedValue(buildSnapshot());

    render(<AttendanceTab tripId="trip-1" />);

    expect(await screen.findByRole('button', { name: 'Mở check-in' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Đóng phiên' })).toBeInTheDocument();
    const captureButton = screen.getByRole('button', { name: 'Chụp ảnh check-in' });
    expect(captureButton).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(captureButton);
    });

    expect(await screen.findByTestId('capture-sheet')).toBeInTheDocument();
  });

  it('hiển thị trạng thái cá nhân của leader trong phiên đang mở', async () => {
    vi.mocked(attendanceApi.getCurrentSession).mockResolvedValue(buildSnapshot());

    render(<AttendanceTab tripId="trip-1" />);

    expect(await screen.findByText('Trạng thái của tôi')).toBeInTheDocument();
    expect(screen.getByText('Bạn đã gửi check-in kèm vị trí.')).toBeInTheDocument();
    expect(screen.getByText('Phiên đang mở')).toBeInTheDocument();
  });
});
