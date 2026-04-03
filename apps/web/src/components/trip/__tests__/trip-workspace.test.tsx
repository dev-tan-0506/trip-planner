import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { TripWorkspaceShell } from '../TripWorkspaceShell';
import type { ItineraryItem, ItinerarySnapshot, Proposal, Trip } from '../../../lib/api-client';

let latestOnDragEnd: ((event: {
  active: { id: string; data: { current: Record<string, unknown> } };
  over: { id: string; data: { current: Record<string, unknown> } } | null;
}) => void | Promise<void>) | null = null;

vi.mock('@dnd-kit/core', () => ({
  DndContext: ({
    children,
    onDragEnd,
  }: {
    children: React.ReactNode;
    onDragEnd?: typeof latestOnDragEnd;
  }) => {
    latestOnDragEnd = onDragEnd ?? null;
    return children;
  },
  PointerSensor: function PointerSensor() {
    return null;
  },
  closestCorners: vi.fn(),
  useSensor: vi.fn(() => ({})),
  useSensors: vi.fn(() => []),
  useDroppable: vi.fn(() => ({
    isOver: false,
    setNodeRef: vi.fn(),
  })),
}));

vi.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }: { children: React.ReactNode }) => children,
  useSortable: vi.fn(({ id }: { id: string }) => ({
    attributes: { 'data-sortable-id': id },
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: undefined,
    isDragging: false,
  })),
  verticalListSortingStrategy: vi.fn(),
}));

vi.mock('@dnd-kit/utilities', () => ({
  CSS: {
    Transform: {
      toString: () => undefined,
    },
  },
}));

const itemOne: ItineraryItem = {
  id: 'item-1',
  tripId: 'trip-1',
  dayIndex: 0,
  sortOrder: 1,
  startMinute: 540,
  startTime: '09:00',
  title: 'Visit Museum',
  locationName: 'National Museum',
  locationAddress: null,
  placeId: null,
  lat: 16.054,
  lng: 108.221,
  shortNote: null,
  version: 1,
  progress: 'sap toi',
  proposalCount: 2,
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
};

const itemTwo: ItineraryItem = {
  id: 'item-2',
  tripId: 'trip-1',
  dayIndex: 0,
  sortOrder: 2,
  startMinute: null,
  startTime: null,
  title: 'Free Exploration',
  locationName: null,
  locationAddress: null,
  placeId: null,
  lat: null,
  lng: null,
  shortNote: 'Roam around',
  version: 1,
  progress: 'chua chot gio',
  proposalCount: 0,
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
};

const itemThree: ItineraryItem = {
  id: 'item-3',
  tripId: 'trip-1',
  dayIndex: 1,
  sortOrder: 1,
  startMinute: 660,
  startTime: '11:00',
  title: 'Beach Stop',
  locationName: 'My Khe',
  locationAddress: null,
  placeId: null,
  lat: 16.0601,
  lng: 108.2468,
  shortNote: null,
  version: 1,
  progress: 'sap toi',
  proposalCount: 0,
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
};

const mockSnapshot: ItinerarySnapshot = {
  tripId: 'trip-1',
  days: [
    {
      dayIndex: 0,
      items: [itemOne, itemTwo],
    },
  ],
  overlapWarnings: [],
  healthWarnings: [],
  mapItems: [
    {
      id: 'item-1',
      title: 'Visit Museum',
      lat: 16.054,
      lng: 108.221,
      dayIndex: 0,
      sortOrder: 1,
    },
  ],
  totalItems: 2,
  isLeader: false,
  canEdit: false,
};

const mockLeaderSnapshot: ItinerarySnapshot = {
  ...mockSnapshot,
  isLeader: true,
  canEdit: true,
};

const mockLeaderSnapshotWithTwoDays: ItinerarySnapshot = {
  ...mockLeaderSnapshot,
  days: [
    {
      dayIndex: 0,
      items: [itemOne, itemTwo],
    },
    {
      dayIndex: 1,
      items: [itemThree],
    },
  ],
};

const mockProposals: Proposal[] = [
  {
    id: 'proposal-1',
    tripId: 'trip-1',
    proposerId: 'user-2',
    targetItemId: 'item-1',
    type: 'UPDATE_TIME',
    payload: { startMinute: 600 },
    baseVersion: 1,
    status: 'PENDING',
    reviewedById: null,
    reviewedAt: null,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
    proposer: { id: 'user-2', name: 'Member', avatarUrl: null },
    reviewer: null,
    targetItem: { id: 'item-1', title: 'Visit Museum', dayIndex: 0, version: 1 },
  },
];

const mockTrip: Trip = {
  id: 'trip-1',
  name: 'Test Trip',
  destination: 'Da Nang',
  startDate: '2026-05-01',
  endDate: '2026-05-03',
  joinCode: 'test-code',
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
  members: [
    {
      id: 'm1',
      userId: 'user-1',
      tripId: 'trip-1',
      role: 'LEADER',
      joinedAt: '2026-01-01',
      user: { id: 'user-1', name: 'Leader', avatarUrl: null },
    },
    {
      id: 'm2',
      userId: 'user-2',
      tripId: 'trip-1',
      role: 'MEMBER',
      joinedAt: '2026-01-01',
      user: { id: 'user-2', name: 'Member', avatarUrl: null },
    },
  ],
};

vi.mock('../../../lib/api-client', async () => {
  const actual = await vi.importActual('../../../lib/api-client');
  return {
    ...actual,
    itineraryApi: {
      getSnapshot: vi.fn(),
      createItem: vi.fn(),
      updateItem: vi.fn(),
      deleteItem: vi.fn(),
      reorder: vi.fn(),
    },
    proposalsApi: {
      listProposals: vi.fn(),
      createProposal: vi.fn(),
      acceptProposal: vi.fn(),
      rejectProposal: vi.fn(),
    },
    votesApi: {
      listSessions: vi.fn().mockResolvedValue([]),
    },
    templatesApi: {
      getPublishedForTrip: vi.fn().mockResolvedValue(null),
    },
  };
});

import { itineraryApi, proposalsApi, templatesApi, votesApi } from '../../../lib/api-client';

describe('TripWorkspaceShell', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    latestOnDragEnd = null;
  });

  describe('Member read-only rendering', () => {
    beforeEach(() => {
      vi.mocked(itineraryApi.getSnapshot).mockResolvedValue(mockSnapshot);
      vi.mocked(proposalsApi.listProposals).mockResolvedValue(mockProposals);
      vi.mocked(votesApi.listSessions).mockResolvedValue([]);
      vi.mocked(templatesApi.getPublishedForTrip).mockResolvedValue(null);
    });

    it('should show read-only view for members without structural controls', async () => {
      render(<TripWorkspaceShell trip={mockTrip} joinCode="test-code" />);

      expect(await screen.findByText('Visit Museum')).toBeInTheDocument();
      expect(screen.queryByText('Thêm hoạt động')).not.toBeInTheDocument();
      expect(screen.queryByTitle('Giữ và kéo để đổi thứ tự')).not.toBeInTheDocument();
      expect(screen.getByText('Đề xuất hoạt động mới')).toBeInTheDocument();
    });

    it('should display status chips for items', async () => {
      render(<TripWorkspaceShell trip={mockTrip} joinCode="test-code" />);

      expect(await screen.findByText(/Sắp tới/)).toBeInTheDocument();
      expect(screen.getByText(/Chưa chốt giờ/)).toBeInTheDocument();
    });

    it('should display proposal badges on items with proposals', async () => {
      render(<TripWorkspaceShell trip={mockTrip} joinCode="test-code" />);

      expect(await screen.findByText('2 đề xuất')).toBeInTheDocument();
    });
  });

  describe('Leader structural controls', () => {
    beforeEach(() => {
      vi.mocked(itineraryApi.getSnapshot).mockResolvedValue(mockLeaderSnapshot);
      vi.mocked(proposalsApi.listProposals).mockResolvedValue(mockProposals);
      vi.mocked(votesApi.listSessions).mockResolvedValue([]);
      vi.mocked(templatesApi.getPublishedForTrip).mockResolvedValue(null);
    });

    it('should show leader-only structural buttons', async () => {
      render(<TripWorkspaceShell trip={mockTrip} joinCode="test-code" />);

      expect(await screen.findByText('Thêm hoạt động')).toBeInTheDocument();
    });

    it('should trigger same-day drag reorder with normalized payload', async () => {
      vi.mocked(itineraryApi.reorder).mockResolvedValue({
        ...mockLeaderSnapshot,
        days: [
          {
            dayIndex: 0,
            items: [
              { ...itemTwo, sortOrder: 1 },
              { ...itemOne, sortOrder: 2 },
            ],
          },
        ],
      });

      render(<TripWorkspaceShell trip={mockTrip} joinCode="test-code" />);
      await screen.findByText('Visit Museum');

      await latestOnDragEnd?.({
        active: {
          id: 'item-1',
          data: { current: { itemId: 'item-1', dayIndex: 0, index: 0 } },
        },
        over: {
          id: 'drop-0-1',
          data: { current: { type: 'dropzone', dayIndex: 0, index: 1 } },
        },
      });

      await waitFor(() => {
        expect(itineraryApi.reorder).toHaveBeenCalledWith('trip-1', {
          items: [
            { itemId: 'item-2', dayIndex: 0, sortOrder: 1 },
            { itemId: 'item-1', dayIndex: 0, sortOrder: 2 },
          ],
        });
      });
    });

    it('should trigger cross-day drag reorder with updated dayIndex values', async () => {
      vi.mocked(itineraryApi.getSnapshot).mockResolvedValue(mockLeaderSnapshotWithTwoDays);
      vi.mocked(proposalsApi.listProposals).mockResolvedValue(mockProposals);
      vi.mocked(itineraryApi.reorder).mockResolvedValue({
        ...mockLeaderSnapshotWithTwoDays,
        days: [
          {
            dayIndex: 0,
            items: [{ ...itemTwo, sortOrder: 1 }],
          },
          {
            dayIndex: 1,
            items: [
              { ...itemOne, dayIndex: 1, sortOrder: 1 },
              { ...itemThree, sortOrder: 2 },
            ],
          },
        ],
      });

      render(<TripWorkspaceShell trip={mockTrip} joinCode="test-code" />);
      await screen.findByText('Beach Stop');

      await latestOnDragEnd?.({
        active: {
          id: 'item-1',
          data: { current: { itemId: 'item-1', dayIndex: 0, index: 0 } },
        },
        over: {
          id: 'drop-1-0',
          data: { current: { type: 'dropzone', dayIndex: 1, index: 0 } },
        },
      });

      await waitFor(() => {
        expect(itineraryApi.reorder).toHaveBeenCalledWith('trip-1', {
          items: [
            { itemId: 'item-2', dayIndex: 0, sortOrder: 1 },
            { itemId: 'item-1', dayIndex: 1, sortOrder: 1 },
            { itemId: 'item-3', dayIndex: 1, sortOrder: 2 },
          ],
        });
      });
    });

    it('should show proposal inbox badge when pending proposals exist', async () => {
      render(<TripWorkspaceShell trip={mockTrip} joinCode="test-code" />);

      expect(await screen.findByText('1 đề xuất mới')).toBeInTheDocument();
    });
  });

  describe('Map launch links', () => {
    beforeEach(() => {
      vi.mocked(itineraryApi.getSnapshot).mockResolvedValue(mockSnapshot);
      vi.mocked(proposalsApi.listProposals).mockResolvedValue([]);
      vi.mocked(votesApi.listSessions).mockResolvedValue([]);
      vi.mocked(templatesApi.getPublishedForTrip).mockResolvedValue(null);
    });

    it('should render map launch link with focusItemId for geolocated items', async () => {
      render(<TripWorkspaceShell trip={mockTrip} joinCode="test-code" />);

      await screen.findByText('Visit Museum');
      const mapLinks = document.querySelectorAll('a[href*="focusItemId"]');
      expect(mapLinks.length).toBeGreaterThan(0);

      const firstMapLink = mapLinks[0] as HTMLAnchorElement;
      expect(firstMapLink.href).toContain('focusItemId=item-1');
    });

    it('should show map tab with item count', async () => {
      render(<TripWorkspaceShell trip={mockTrip} joinCode="test-code" />);

      expect(await screen.findByText('Bản đồ')).toBeInTheDocument();
    });
  });
});
