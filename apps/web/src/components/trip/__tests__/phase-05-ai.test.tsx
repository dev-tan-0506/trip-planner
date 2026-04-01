import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TripWorkspaceShell } from '../TripWorkspaceShell';
import { AiAssistTab } from '../AiAssistTab';
import { TimelineDaySection } from '../TimelineDaySection';
import type {
  BookingImportDraft,
  ItineraryItem,
  ItinerarySnapshot,
  Trip,
} from '../../../lib/api-client';

vi.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }: { children: React.ReactNode }) => children,
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

vi.mock('../ItineraryComposerSheet', () => ({
  ItineraryComposerSheet: () => null,
}));

vi.mock('../ItineraryItemEditor', () => ({
  ItineraryItemEditor: () => null,
}));

vi.mock('../DeleteItineraryItemDialog', () => ({
  DeleteItineraryItemDialog: () => null,
}));

vi.mock('../ProposalComposerSheet', () => ({
  ProposalComposerSheet: () => null,
}));

vi.mock('../ProposalInboxPanel', () => ({
  ProposalInboxPanel: () => <div>ProposalInboxPanel</div>,
}));

vi.mock('../LogisticsBoardTab', () => ({
  LogisticsBoardTab: () => <div>LogisticsBoardTab</div>,
}));

vi.mock('../ChecklistTab', () => ({
  ChecklistTab: () => <div>ChecklistTab</div>,
}));

vi.mock('../AttendanceTab', () => ({
  AttendanceTab: () => <div>AttendanceTab</div>,
}));

vi.mock('../FinanceSafetyTab', () => ({
  FinanceSafetyTab: () => <div>FinanceSafetyTab</div>,
}));

vi.mock('../../templates/PublishTemplateDialog', () => ({
  PublishTemplateDialog: () => null,
}));

const itineraryItemOne: ItineraryItem = {
  id: 'item-1',
  tripId: 'trip-1',
  dayIndex: 0,
  sortOrder: 1,
  startMinute: 540,
  startTime: '09:00',
  title: 'An bun cha',
  locationName: 'Quan ngon',
  locationAddress: null,
  placeId: null,
  lat: 16.054,
  lng: 108.221,
  shortNote: 'Mon de di bo',
  version: 1,
  progress: 'sap toi',
  proposalCount: 0,
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
};

const itineraryItemTwo: ItineraryItem = {
  ...itineraryItemOne,
  id: 'item-2',
  sortOrder: 2,
  title: 'Tra sua dem',
  locationName: 'Pho bien',
  lat: 16.056,
  lng: 108.223,
};

const leaderSnapshot: ItinerarySnapshot = {
  tripId: 'trip-1',
  days: [{ dayIndex: 0, items: [itineraryItemOne, itineraryItemTwo] }],
  overlapWarnings: [],
  healthWarnings: [
    {
      itemId: 'item-1',
      severity: 'NGUY_CO_CAO',
      title: 'Nguy co cao',
      message: 'Mon nay co the khong hop voi thanh vien di ung hai san.',
      confidenceLabel: 'Can xem lai',
      affectedMemberIds: ['user-2'],
    },
  ],
  mapItems: [
    {
      id: 'item-1',
      title: 'An bun cha',
      lat: 16.054,
      lng: 108.221,
      dayIndex: 0,
      sortOrder: 1,
    },
  ],
  totalItems: 2,
  isLeader: true,
  canEdit: true,
};

const memberSnapshot: ItinerarySnapshot = {
  ...leaderSnapshot,
  isLeader: false,
  canEdit: false,
};

const mockTrip: Trip = {
  id: 'trip-1',
  name: 'Da Nang',
  destination: 'Da Nang',
  startDate: '2026-05-01',
  endDate: '2026-05-03',
  joinCode: 'join-code',
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
  members: [],
};

const bookingDraft: BookingImportDraft = {
  id: 'draft-1',
  tripId: 'trip-1',
  createdByTripMemberId: 'member-1',
  reviewedByTripMemberId: null,
  sourceChannel: 'MANUAL_PASTE',
  forwardingAddress: 'booking+join-code@minhdidauthe.local',
  sourceMessageId: null,
  sourceSender: null,
  sourceSubject: 'Ve may bay',
  rawContent: 'Flight VN123 du kien 08:30. Cho xac nhan.',
  confidenceLabel: 'Can xem lai',
  status: 'DRAFT',
  parseSummary: 'Da tach noi dung dat cho, nhung con thieu hoac mo ho mot vai truong can xem lai truoc khi nhap vao lich trinh.',
  parsedItems: [
    {
      title: 'Chuyen bay',
      locationName: null,
      startTime: null,
      endTime: null,
      bookingCode: 'VN123',
      missingFields: ['locationName', 'startTime'],
      rawExcerpt: 'Flight VN123 du kien 08:30. Cho xac nhan.',
    },
  ],
  createdAt: '2026-04-01T10:00:00.000Z',
  updatedAt: '2026-04-01T10:00:00.000Z',
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
      requestCulinaryRoute: vi.fn(),
      applyCulinaryRoute: vi.fn(),
    },
    bookingImportApi: {
      getBookingImportConfig: vi.fn(),
      listBookingImportDrafts: vi.fn(),
      createBookingImportDraft: vi.fn(),
      confirmBookingImportDraft: vi.fn(),
    },
    proposalsApi: {
      listProposals: vi.fn().mockResolvedValue([]),
    },
    votesApi: {
      listSessions: vi.fn().mockResolvedValue([]),
    },
    templatesApi: {
      getPublishedForTrip: vi.fn().mockResolvedValue(null),
    },
  };
});

import { bookingImportApi, itineraryApi } from '../../../lib/api-client';

describe('Phase 5 AI workspace', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(itineraryApi.getSnapshot).mockResolvedValue(leaderSnapshot);
    vi.mocked(bookingImportApi.getBookingImportConfig).mockResolvedValue({
      tripId: 'trip-1',
      forwardingAddress: 'booking+join-code@minhdidauthe.local',
      joinCode: 'join-code',
      manualPasteEnabled: true,
    });
    vi.mocked(bookingImportApi.listBookingImportDrafts).mockResolvedValue([bookingDraft]);
  });

  it('renders the Tro ly AI tab inside the trip workspace', async () => {
    render(<TripWorkspaceShell trip={mockTrip} joinCode="join-code" />);

    expect(await screen.findByText('Tro ly AI')).toBeInTheDocument();
  });

  it('renders route suggestion confidence chips and leader apply CTA', async () => {
    vi.mocked(itineraryApi.requestCulinaryRoute).mockResolvedValue({
      suggestionId: 'culinary-trip-1-token',
      orderedItems: [
        {
          itemId: 'item-1',
          title: 'An bun cha',
          dayIndex: 0,
          sortOrder: 1,
          lat: 16.054,
          lng: 108.221,
          reason: 'Diem nay gan diem hien tai nhat.',
        },
        {
          itemId: 'item-2',
          title: 'Tra sua dem',
          dayIndex: 0,
          sortOrder: 2,
          lat: 16.056,
          lng: 108.223,
          reason: 'Diem nay noi tiep 8 phut di bo.',
        },
      ],
      totalEstimatedMinutes: 8,
      confidenceLabel: 'Uoc luong',
    });

    render(<AiAssistTab tripId="trip-1" initialSnapshot={leaderSnapshot} />);

    fireEvent.click(screen.getByRole('button', { name: 'Goi y lo trinh an uong' }));

    expect(await screen.findByText('Uoc luong')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ap dung vao lich trinh' })).toBeInTheDocument();
  });

  it('keeps route apply read-only for non-leaders', async () => {
    vi.mocked(itineraryApi.requestCulinaryRoute).mockResolvedValue({
      suggestionId: 'culinary-trip-1-token',
      orderedItems: [
        {
          itemId: 'item-1',
          title: 'An bun cha',
          dayIndex: 0,
          sortOrder: 1,
          lat: 16.054,
          lng: 108.221,
          reason: 'Diem nay gan diem hien tai nhat.',
        },
        {
          itemId: 'item-2',
          title: 'Tra sua dem',
          dayIndex: 0,
          sortOrder: 2,
          lat: 16.056,
          lng: 108.223,
          reason: 'Diem nay noi tiep 8 phut di bo.',
        },
      ],
      totalEstimatedMinutes: 8,
      confidenceLabel: 'Can xem lai',
    });

    render(<AiAssistTab tripId="trip-1" initialSnapshot={memberSnapshot} />);

    fireEvent.click(screen.getByRole('button', { name: 'Goi y lo trinh an uong' }));

    expect(await screen.findByText('Can xem lai')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Ap dung vao lich trinh' })).not.toBeInTheDocument();
  });

  it('renders inline health warnings in the timeline day section', async () => {
    render(
      <TimelineDaySection
        day={leaderSnapshot.days[0]}
        tripStartDate="2026-05-01"
        canEdit
        overlapWarnings={[]}
        healthWarnings={leaderSnapshot.healthWarnings}
        currentItemRef={{ current: null }}
        joinCode="join-code"
        onAddItem={vi.fn()}
        onEditItem={vi.fn()}
        onDeleteItem={vi.fn()}
        onReorderItem={vi.fn()}
        onProposeChange={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(screen.getAllByText('Nguy co cao').length).toBeGreaterThan(0);
      expect(screen.getByText(/di ung hai san/i)).toBeInTheDocument();
    });
  });

  it('renders booking import forwarding address and recent draft list', async () => {
    render(<AiAssistTab tripId="trip-1" initialSnapshot={leaderSnapshot} />);

    expect((await screen.findAllByText('Dia chi chuyen tiep')).length).toBeGreaterThan(0);
    expect(screen.getByText('booking+join-code@minhdidauthe.local')).toBeInTheDocument();
    expect(screen.getByText('Ve may bay')).toBeInTheDocument();
  });

  it('shows low-confidence caution UI and the Nhap vao lich trinh CTA in booking review sheet', async () => {
    render(<AiAssistTab tripId="trip-1" initialSnapshot={leaderSnapshot} />);

    fireEvent.click(await screen.findByText('Ve may bay'));

    expect(await screen.findAllByText('Can xem lai')).not.toHaveLength(0);
    expect(screen.getByText(/^Raw excerpt$/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Nhap vao lich trinh' })).toBeInTheDocument();
  });
});
