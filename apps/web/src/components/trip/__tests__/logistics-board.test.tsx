import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LogisticsBoardTab } from '../LogisticsBoardTab';
import type { AllocationSnapshot } from '../../../lib/api-client';

// ─── Mock Data ───────────────────────────────────────

const emptySnapshot: AllocationSnapshot = {
  tripId: 'trip-1',
  isLeader: false,
  currentTripMemberId: 'tm-member',
  roomUnits: [],
  rideUnits: [],
  totalMembers: 2,
  members: [],
};

const leaderEmptySnapshot: AllocationSnapshot = {
  ...emptySnapshot,
  isLeader: true,
  currentTripMemberId: 'tm-leader',
};

const populatedSnapshot: AllocationSnapshot = {
  tripId: 'trip-1',
  isLeader: true,
  currentTripMemberId: 'tm-leader',
  roomUnits: [
    {
      id: 'room-1',
      type: 'ROOM',
      label: 'Phòng 101',
      capacity: 4,
      sortOrder: 1,
      note: 'Phòng có view biển',
      occupancy: 2,
      remainingCapacity: 2,
      isOverbooked: false,
      overCapacityBy: 0,
      members: [
        {
          assignmentId: 'a1',
          tripMemberId: 'tm-1',
          userId: 'u1',
          name: 'Alice',
          avatarUrl: null,
          source: 'LEADER',
          role: 'MEMBER',
        },
        {
          assignmentId: 'a2',
          tripMemberId: 'tm-2',
          userId: 'u2',
          name: 'Bob',
          avatarUrl: null,
          source: 'SELF_JOIN',
          role: 'MEMBER',
        },
      ],
    },
  ],
  rideUnits: [
    {
      id: 'ride-1',
      type: 'RIDE',
      label: 'Xe 7 chỗ',
      capacity: 7,
      sortOrder: 1,
      note: null,
      occupancy: 0,
      remainingCapacity: 7,
      isOverbooked: false,
      overCapacityBy: 0,
      members: [],
    },
  ],
  totalMembers: 4,
  members: [],
};

const overbookedSnapshot: AllocationSnapshot = {
  ...populatedSnapshot,
  roomUnits: [
    {
      id: 'room-overbooked',
      type: 'ROOM',
      label: 'Phòng đông',
      capacity: 2,
      sortOrder: 1,
      note: null,
      occupancy: 3,
      remainingCapacity: 0,
      isOverbooked: true,
      overCapacityBy: 1,
      members: [
        { assignmentId: 'a1', tripMemberId: 'tm-1', userId: 'u1', name: 'A', avatarUrl: null, source: 'LEADER', role: 'MEMBER' },
        { assignmentId: 'a2', tripMemberId: 'tm-2', userId: 'u2', name: 'B', avatarUrl: null, source: 'LEADER', role: 'MEMBER' },
        { assignmentId: 'a3', tripMemberId: 'tm-3', userId: 'u3', name: 'C', avatarUrl: null, source: 'LEADER', role: 'MEMBER' },
      ],
    },
  ],
};

// ─── Mock API ────────────────────────────────────────

vi.mock('../../../lib/api-client', async () => {
  const actual = await vi.importActual('../../../lib/api-client');
  return {
    ...actual,
    logisticsApi: {
      getAllocations: vi.fn(),
      createUnit: vi.fn(),
      updateUnit: vi.fn(),
      deleteUnit: vi.fn(),
      selfJoin: vi.fn(),
      leave: vi.fn(),
      reassign: vi.fn(),
      autoFill: vi.fn(),
    },
  };
});

import { logisticsApi } from '../../../lib/api-client';

describe('LogisticsBoardTab', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('empty state rendering', () => {
    it('should show empty state for member', async () => {
      vi.mocked(logisticsApi.getAllocations).mockResolvedValue(emptySnapshot);

      render(<LogisticsBoardTab tripId="trip-1" />);

      expect(
        await screen.findByText('Chưa có gì để chia chỗ cả'),
      ).toBeInTheDocument();
      expect(
        screen.getByText('Chờ trưởng đoàn tạo phòng hoặc xe nhé!'),
      ).toBeInTheDocument();
    });

    it('should show empty state with create prompt for leader', async () => {
      vi.mocked(logisticsApi.getAllocations).mockResolvedValue(leaderEmptySnapshot);

      render(<LogisticsBoardTab tripId="trip-1" />);

      expect(
        await screen.findByText('Chưa có gì để chia chỗ cả'),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          'Tạo phòng hoặc xe đầu tiên để cả nhóm bắt đầu vào chỗ.',
        ),
      ).toBeInTheDocument();
    });
  });

  describe('card-grid rendering', () => {
    it('should render room and ride cards', async () => {
      vi.mocked(logisticsApi.getAllocations).mockResolvedValue(populatedSnapshot);

      render(<LogisticsBoardTab tripId="trip-1" />);

      expect(await screen.findByText('Phòng 101')).toBeInTheDocument();
      expect(screen.getByText('Xe 7 chỗ')).toBeInTheDocument();
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
    });

    it('should show Phân phòng/xe heading', async () => {
      vi.mocked(logisticsApi.getAllocations).mockResolvedValue(populatedSnapshot);

      render(<LogisticsBoardTab tripId="trip-1" />);

      expect(await screen.findByText('Phân phòng/xe')).toBeInTheDocument();
    });

    it('should show leader actions including Chia nhanh and Tạo chỗ mới', async () => {
      vi.mocked(logisticsApi.getAllocations).mockResolvedValue(populatedSnapshot);

      render(<LogisticsBoardTab tripId="trip-1" />);

      await screen.findByText('Phòng 101');

      const createButtons = screen.getAllByText('Tạo chỗ mới');
      expect(createButtons.length).toBe(2); // One for room, one for ride

      expect(screen.getByText('Chia nhanh phòng')).toBeInTheDocument();
      expect(screen.getByText('Chia nhanh xe')).toBeInTheDocument();
    });
  });

  describe('overbooked state rendering', () => {
    it('should render overbooked warning', async () => {
      vi.mocked(logisticsApi.getAllocations).mockResolvedValue(overbookedSnapshot);

      render(<LogisticsBoardTab tripId="trip-1" />);

      expect(
        await screen.findByText(/Đang quá số chỗ/),
      ).toBeInTheDocument();
    });
  });

  describe('role-based actions', () => {
    it('should show Vào chỗ này for member on open slots', async () => {
      const memberSnapshot: AllocationSnapshot = {
        ...populatedSnapshot,
        isLeader: false,
        currentTripMemberId: 'tm-unassigned',
      };
      vi.mocked(logisticsApi.getAllocations).mockResolvedValue(memberSnapshot);

      render(<LogisticsBoardTab tripId="trip-1" />);

      await screen.findByText('Phòng 101');
      const joinButtons = screen.getAllByText('Vào chỗ này');
      expect(joinButtons.length).toBeGreaterThan(0);
    });
  });
});
