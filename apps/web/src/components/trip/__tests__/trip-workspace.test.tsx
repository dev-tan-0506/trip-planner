import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TripWorkspaceShell } from '../TripWorkspaceShell';
import type { ItinerarySnapshot, Proposal, Trip } from '../../../lib/api-client';

// ─── Mock API ────────────────────────────────────────

const mockSnapshot: ItinerarySnapshot = {
  tripId: 'trip-1',
  days: [
    {
      dayIndex: 0,
      items: [
        {
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
        },
        {
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
        },
      ],
    },
  ],
  overlapWarnings: [],
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

// Mock the API modules
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

// Import mocked modules
import { itineraryApi, proposalsApi, templatesApi, votesApi } from '../../../lib/api-client';

describe('TripWorkspaceShell', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

      // Wait for data to load
      expect(await screen.findByText('Visit Museum')).toBeInTheDocument();

      // Member should NOT see "Thêm hoạt động" button (leader-only)
      expect(screen.queryByText('Thêm hoạt động')).not.toBeInTheDocument();

      // Member SHOULD see proposal CTA
      expect(screen.getByText('Đề xuất hoạt động mới')).toBeInTheDocument();
    });

    it('should display status chips for items', async () => {
      render(<TripWorkspaceShell trip={mockTrip} joinCode="test-code" />);

      // Wait for rendering — use regex since chips have emoji prefix
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

      // Wait for content
      await screen.findByText('Visit Museum');

      // Check for map link with focusItemId
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
