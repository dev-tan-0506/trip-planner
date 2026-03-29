import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AttendanceTab } from '../AttendanceTab';
import type { AttendanceSnapshot } from '../../../lib/api-client';

const snapshot: AttendanceSnapshot = {
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
      tripMemberId: 'tm-1',
      name: 'Member A',
      lat: 16.01,
      lng: 108.21,
      status: 'ARRIVED',
    },
  ],
  members: [
    {
      tripMemberId: 'tm-2',
      userId: 'u-2',
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
      tripMemberId: 'tm-1',
      userId: 'u-1',
      name: 'Member A',
      avatarUrl: null,
      role: 'MEMBER',
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
  CheckInCaptureSheet: () => null,
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
    vi.mocked(attendanceApi.getCurrentSession).mockResolvedValue(snapshot);

    render(<AttendanceTab tripId="trip-1" />);

    expect((await screen.findAllByText('Đã đến')).length).toBeGreaterThan(0);
    expect(screen.getAllByText('Chưa đến').length).toBeGreaterThan(0);
    expect(screen.getByText('map')).toBeInTheDocument();
    expect(screen.getByText('Member B')).toBeInTheDocument();
  });
});
