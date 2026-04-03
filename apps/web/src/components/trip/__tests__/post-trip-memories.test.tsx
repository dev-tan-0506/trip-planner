import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a>,
}));

vi.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }: { children: React.ReactNode }) => children,
  PointerSensor: function PointerSensor() {
    return null;
  },
  closestCorners: vi.fn(),
  useSensor: vi.fn(() => ({})),
  useSensors: vi.fn(() => []),
}));

vi.mock('../../templates/PublishTemplateDialog', () => ({
  PublishTemplateDialog: () => null,
}));

vi.mock('../TimelineDaySection', () => ({
  TimelineDaySection: ({ day }: { day: { dayIndex: number } }) => <div>Ngày {day.dayIndex + 1}</div>,
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
  ProposalInboxPanel: () => <div>Proposal Inbox</div>,
}));

vi.mock('../LogisticsBoardTab', () => ({
  LogisticsBoardTab: () => <div>Logistics</div>,
}));

vi.mock('../ChecklistTab', () => ({
  ChecklistTab: () => <div>Checklist</div>,
}));

vi.mock('../AttendanceTab', () => ({
  AttendanceTab: () => <div>Attendance</div>,
}));

vi.mock('../FinanceSafetyTab', () => ({
  FinanceSafetyTab: () => <div>Finance Safety</div>,
}));

vi.mock('../AiAssistTab', () => ({
  AiAssistTab: () => <div>AI Assist</div>,
}));

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
      listProposals: vi.fn().mockResolvedValue([]),
    },
    votesApi: {
      listSessions: vi.fn().mockResolvedValue([]),
    },
    templatesApi: {
      getPublishedForTrip: vi.fn().mockResolvedValue(null),
    },
    memoriesApi: {
      getVaultSnapshot: vi.fn(),
      uploadVaultDocument: vi.fn(),
      reviewVaultDocument: vi.fn(),
      getFeedbackSnapshot: vi.fn(),
      submitAnonymousFeedback: vi.fn(),
      closeFeedbackPoll: vi.fn(),
      getSouvenirSnapshot: vi.fn(),
      getReunionSnapshot: vi.fn(),
      respondReunionAvailability: vi.fn(),
      finalizeReunionInvite: vi.fn(),
    },
  };
});

import {
  itineraryApi,
  memoriesApi,
  type FeedbackSnapshot,
  type ItinerarySnapshot,
  type ReunionSnapshot,
  type SouvenirSnapshot,
  type Trip,
  type VaultSnapshot,
} from '../../../lib/api-client';
import { AnonymousFeedbackPanel } from '../AnonymousFeedbackPanel';
import { ReunionOrganizerPanel } from '../ReunionOrganizerPanel';
import { SouvenirReminderCard } from '../SouvenirReminderCard';
import { TripWorkspaceShell } from '../TripWorkspaceShell';
import { DigitalVaultPanel } from '../DigitalVaultPanel';

const mockTrip: Trip = {
  id: 'trip-1',
  name: 'Trip Memories',
  destination: 'Đà Nẵng',
  startDate: '2026-08-01',
  endDate: '2026-08-03',
  joinCode: 'trip-join',
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
  members: [
    {
      id: 'member-leader',
      userId: 'user-1',
      tripId: 'trip-1',
      role: 'LEADER',
      joinedAt: '2026-01-01',
      user: { id: 'user-1', name: 'Leader', avatarUrl: null },
    },
  ],
};

const mockItinerarySnapshot: ItinerarySnapshot = {
  tripId: 'trip-1',
  days: [{ dayIndex: 0, items: [] }],
  overlapWarnings: [],
  healthWarnings: [],
  mapItems: [],
  totalItems: 0,
  isLeader: true,
  canEdit: true,
};

const mockLeaderVaultSnapshot: VaultSnapshot = {
  tripId: 'trip-1',
  isLeader: true,
  currentTripMemberId: 'member-leader',
  retentionLabel: 'Tài liệu trong Kho tạm được giữ đến 7 ngày sau khi chuyến đi kết thúc.',
  supportedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
  documents: [
    {
      id: 'doc-1',
      kind: 'PASSPORT',
      status: 'PENDING_REVIEW',
      fileName: 'ho-chieu.pdf',
      mimeType: 'application/pdf',
      fileUrl: '/memories/vault/ho-chieu.pdf',
      note: 'Bản scan',
      expiresAt: '2026-08-10T00:00:00.000Z',
      createdAt: '2026-08-02T08:00:00.000Z',
      updatedAt: '2026-08-02T08:00:00.000Z',
      reviewedAt: null,
      uploadedBy: {
        tripMemberId: 'member-2',
        userId: 'user-2',
        name: 'Minh',
        avatarUrl: null,
      },
      reviewedBy: null,
    },
  ],
};

const mockMemberVaultSnapshot: VaultSnapshot = {
  ...mockLeaderVaultSnapshot,
  isLeader: false,
  currentTripMemberId: 'member-2',
};

const mockMemberFeedbackSnapshot: FeedbackSnapshot = {
  tripId: 'trip-1',
  isLeader: false,
  currentTripMemberId: 'member-2',
  status: 'OPEN',
  isEligible: true,
  canSubmit: true,
  hasSubmitted: false,
  submittedCount: 1,
  openedAt: '2026-08-03T08:00:00.000Z',
  closedAt: null,
  moodBreakdown: [
    { score: 1, count: 0 },
    { score: 2, count: 0 },
    { score: 3, count: 0 },
    { score: 4, count: 1 },
    { score: 5, count: 0 },
  ],
  responses: [],
};

const mockLeaderFeedbackSnapshot: FeedbackSnapshot = {
  ...mockMemberFeedbackSnapshot,
  isLeader: true,
  currentTripMemberId: 'member-leader',
  canSubmit: false,
  responses: [
    {
      id: 'response-1',
      moodScore: 4,
      highlight: 'Cả nhóm phối hợp rất ổn',
      wishNextTime: 'Nghỉ trưa dài hơn',
      createdAt: '2026-08-04T08:00:00.000Z',
    },
  ],
};

const mockSouvenirSnapshot: SouvenirSnapshot = {
  tripId: 'trip-1',
  eligible: true,
  destinationLabel: 'Đà Nẵng',
  reminderLabel: 'Mua quà trước khi về',
  suggestions: [
    {
      locationName: 'Đà Nẵng Central Market',
      locationType: 'Chợ',
      areaLabel: 'Khu gợi ý 1',
      reason: 'Dễ mua quà gọn cho cả nhóm.',
      souvenirHint: 'Đặc sản đóng gói.',
    },
  ],
};

const mockReunionSnapshot: ReunionSnapshot = {
  tripId: 'trip-1',
  eligible: true,
  isLeader: true,
  status: 'SENT',
  unlocksAt: '2026-08-10T00:00:00.000Z',
  title: 'Hẹn reunion',
  message: 'Đã tới lúc hẹn reunion',
  suggestedDateOptions: ['2026-08-17', '2026-08-24'],
  recommendedDate: '2026-08-17',
  finalizedDate: null,
  deliveryStatus: [{ recipientEmail: 'member@test.com', status: 'SENT', sentAt: '2026-08-10T00:00:00.000Z', errorMessage: null }],
  availability: [],
};

describe('Post-trip memories workspace', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(itineraryApi.getSnapshot).mockResolvedValue(mockItinerarySnapshot);
    vi.mocked(memoriesApi.getVaultSnapshot).mockResolvedValue(mockLeaderVaultSnapshot);
    vi.mocked(memoriesApi.getFeedbackSnapshot).mockResolvedValue(mockLeaderFeedbackSnapshot);
    vi.mocked(memoriesApi.getSouvenirSnapshot).mockResolvedValue(mockSouvenirSnapshot);
    vi.mocked(memoriesApi.getReunionSnapshot).mockResolvedValue(mockReunionSnapshot);
  });

  it('renders the Kỷ niệm tab inside the existing trip workspace and mounts the memories host', async () => {
    render(<TripWorkspaceShell trip={mockTrip} joinCode="trip-join" />);

    const memoriesTab = await screen.findByRole('button', { name: /Kỷ niệm/i });
    fireEvent.click(memoriesTab);

    expect(await screen.findByText('Kho tạm cho một chuyến đi')).toBeInTheDocument();
    expect(screen.getByText('Tải ảnh hoặc PDF')).toBeInTheDocument();
    expect(screen.getAllByText('Chờ duyệt').length).toBeGreaterThan(0);
  });

  it('shows a leader overview with deterministic review controls in the Digital Vault panel', async () => {
    render(
      <DigitalVaultPanel
        snapshot={mockLeaderVaultSnapshot}
        loading={false}
        busy={false}
        onUpload={vi.fn().mockResolvedValue(undefined)}
        onReview={vi.fn().mockResolvedValue(undefined)}
      />,
    );

    expect(screen.getByText('Góc nhìn trưởng đoàn')).toBeInTheDocument();
    expect(screen.getByText('Duyệt check-in')).toBeInTheDocument();
    expect(screen.getByText('Chuyển lưu trữ')).toBeInTheDocument();
    expect(screen.getByText('Sẵn sàng check-in')).toBeInTheDocument();
  });

  it('keeps member vault copy focused on personal documents without leader review controls', async () => {
    render(
      <DigitalVaultPanel
        snapshot={mockMemberVaultSnapshot}
        loading={false}
        busy={false}
        onUpload={vi.fn().mockResolvedValue(undefined)}
        onReview={vi.fn().mockResolvedValue(undefined)}
      />,
    );

    expect(screen.getByText('Góc nhìn thành viên')).toBeInTheDocument();
    expect(screen.getByText('Tải ảnh hoặc PDF')).toBeInTheDocument();
    expect(screen.queryByText('Duyệt check-in')).not.toBeInTheDocument();
  });

  it('refreshes the memories host from the typed vault client contract', async () => {
    render(<TripWorkspaceShell trip={mockTrip} joinCode="trip-join" />);

    fireEvent.click(await screen.findByRole('button', { name: /Kỷ niệm/i }));
    const refreshButton = (await screen.findAllByRole('button', { name: /Làm mới/i }))[1]!;
    fireEvent.click(refreshButton);

    await waitFor(() => {
      expect(memoriesApi.getVaultSnapshot).toHaveBeenCalledWith('trip-1');
    });
  });

  it('renders a playful member feedback form with one-time anonymous copy', async () => {
    render(
      <AnonymousFeedbackPanel
        tripId="trip-1"
        snapshot={mockMemberFeedbackSnapshot}
        busy={false}
        onSnapshotUpdate={vi.fn()}
      />,
    );

    expect(screen.getByText('Góp ý ẩn danh')).toBeInTheDocument();
    expect(screen.getByText(/một lần/i)).toBeInTheDocument();
    expect(screen.getByText('Mức vui 4')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Gửi góp ý ẩn danh/i })).toBeInTheDocument();
  });

  it('renders leader feedback aggregates without any identity chips or member names', async () => {
    render(
      <AnonymousFeedbackPanel
        tripId="trip-1"
        snapshot={mockLeaderFeedbackSnapshot}
        busy={false}
        onSnapshotUpdate={vi.fn()}
      />,
    );

    expect(screen.getByText('Góp ý ẩn danh')).toBeInTheDocument();
    expect(screen.getByText('Cả nhóm phối hợp rất ổn')).toBeInTheDocument();
    expect(screen.queryByText('Minh')).not.toBeInTheDocument();
    expect(screen.queryByText(/avatar/i)).not.toBeInTheDocument();
  });

  it('renders the souvenir reminder card with authentic location suggestions', async () => {
    render(<SouvenirReminderCard snapshot={mockSouvenirSnapshot} />);

    expect(screen.getByText('Mua quà trước khi về')).toBeInTheDocument();
    expect(screen.getByText('Khu gợi ý')).toBeInTheDocument();
    expect(screen.getByText('Đà Nẵng Central Market')).toBeInTheDocument();
  });

  it('renders the reunion organizer with e-invite status and Ngày gợi ý', async () => {
    render(
      <ReunionOrganizerPanel
        tripId="trip-1"
        snapshot={mockReunionSnapshot}
        onSnapshotUpdate={vi.fn()}
      />,
    );

    expect(screen.getByText('Hẹn reunion')).toBeInTheDocument();
    expect(screen.getByText(/e-invite/i)).toBeInTheDocument();
    expect(screen.getByText(/Ngày gợi ý/i)).toBeInTheDocument();
  });
});
