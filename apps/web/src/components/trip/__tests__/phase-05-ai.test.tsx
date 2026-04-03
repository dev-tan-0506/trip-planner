import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TripWorkspaceShell } from '../TripWorkspaceShell';
import { AiAssistTab } from '../AiAssistTab';
import { TimelineDaySection } from '../TimelineDaySection';
import { CostBenchmarkWarningCard } from '../CostBenchmarkWarningCard';
import type {
  BookingImportDraft,
  CostBenchmarkWarning,
  DailyPodcastRecap,
  ItineraryItem,
  ItinerarySnapshot,
  OutfitPlanCard,
  SafetyOverviewSnapshot,
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
      title: 'Nguy cơ cao',
      message: 'Món này có thể không hợp với thành viên dị ứng hải sản.',
      confidenceLabel: 'Cần xem lại',
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

const multiDayLeaderSnapshot: ItinerarySnapshot = {
  ...leaderSnapshot,
  days: [
    { dayIndex: 0, items: [itineraryItemOne] },
    {
      dayIndex: 1,
      items: [
        {
          ...itineraryItemTwo,
          id: 'item-3',
          dayIndex: 1,
          title: 'Ăn tối ven sông',
        },
      ],
    },
  ],
};

const mockTrip: Trip = {
  id: 'trip-1',
  name: 'Đà Nẵng',
  destination: 'Đà Nẵng',
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
  sourceSubject: 'Vé máy bay',
  rawContent: 'Flight VN123 dự kiến 08:30. Chờ xác nhận.',
  confidenceLabel: 'Cần xem lại',
  status: 'DRAFT',
  parseSummary: 'Đã tách nội dung đặt chỗ, nhưng còn thiếu hoặc mơ hồ một vài trường cần xem lại trước khi nhập vào lịch trình.',
  parsedItems: [
    {
      title: 'Chuyen bay',
      locationName: null,
      startTime: null,
      endTime: null,
      bookingCode: 'VN123',
      missingFields: ['locationName', 'startTime'],
      rawExcerpt: 'Flight VN123 dự kiến 08:30. Chờ xác nhận.',
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
    dailyPodcastApi: {
      getDailyPodcast: vi.fn(),
      generateDailyPodcast: vi.fn(),
    },
    localExpertApi: {
      translateMenu: vi.fn(),
      requestHiddenSpots: vi.fn(),
      requestOutfitPlan: vi.fn(),
    },
    safetyApi: {
      getSafetyOverview: vi.fn(),
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

import { bookingImportApi, dailyPodcastApi, itineraryApi, localExpertApi, safetyApi } from '../../../lib/api-client';

const podcastRecap: DailyPodcastRecap = {
  id: 'recap-1',
  tripId: 'trip-1',
  dayIndex: 0,
  title: 'Podcast ngày 1',
  recapText: 'Hôm nay team đã ghé 2 điểm và vẫn có bản text để đọc ngay.',
  transcript: 'Đoạn recap podcast ngắn gọn cho cả nhóm nghe bằng browser speech synthesis.',
  audioMode: 'BROWSER_TTS',
  audioUrl: null,
  durationSeconds: 72,
  generatedAt: '2026-04-01T12:00:00.000Z',
  createdAt: '2026-04-01T12:00:00.000Z',
  updatedAt: '2026-04-01T12:00:00.000Z',
};

const benchmarkWarnings: CostBenchmarkWarning[] = [
  {
    expenseId: 'expense-1',
    title: 'Hai san view dep',
    amount: '260000',
    category: 'FOOD',
    severity: 'NGUY_CO_CAO',
    benchmarkMedianAmount: '90000',
    sourceLabel: 'Mặt bằng quán ăn phổ biến Đà Nẵng',
    confidenceLabel: 'Gợi ý',
    note: 'Nên kiểm tra lại vị trí quán, phụ thu và số lượng trước khi chốt.',
  },
  {
    expenseId: 'expense-2',
    title: 'Thuoc du phong',
    amount: '500000',
    category: 'EMERGENCY',
    severity: 'CAN_XEM_LAI',
    benchmarkMedianAmount: '500000',
    sourceLabel: 'Cần đối chiếu tại chỗ',
    confidenceLabel: 'Cần xem lại',
    note: 'Chưa có mốc giá ổn định, hãy đối chiếu thêm với nhà thuốc hoặc lễ tân.',
  },
  {
    expenseId: 'expense-3',
    title: 'Bua trua gan bien',
    amount: '95000',
    category: 'FOOD',
    severity: 'LUU_Y',
    benchmarkMedianAmount: '90000',
    sourceLabel: 'Mặt bằng quán ăn phổ biến Đà Nẵng',
    confidenceLabel: 'Ước lượng',
    note: 'Giá này gần median, vẫn nên đối chiếu với set ăn đã chọn.',
  },
];

const safetyOverview: SafetyOverviewSnapshot = {
  tripId: 'trip-1',
  destinationLabel: 'Đà Nẵng',
  contextLabel: 'Đà Nẵng • 2026-05-01',
  weather: [
    {
      date: '2026-05-01',
      label: 'Đà Nẵng - Hôm nay',
      condition: 'nắng nhẹ',
      temperatureC: 31,
      rainChancePercent: 10,
    },
    {
      date: '2026-05-02',
      label: 'Đà Nẵng - Ngày 2',
      condition: 'mưa nhẹ',
      temperatureC: 27,
      rainChancePercent: 60,
    },
  ],
  crowd: [],
  directoryQuickPicks: [],
};

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
    vi.mocked(dailyPodcastApi.getDailyPodcast).mockResolvedValue({ recap: podcastRecap });
    vi.mocked(dailyPodcastApi.generateDailyPodcast).mockResolvedValue(podcastRecap);
    vi.mocked(safetyApi.getSafetyOverview).mockResolvedValue(safetyOverview);
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: {
        speak: vi.fn(),
        cancel: vi.fn(),
      },
    });
    Object.defineProperty(window, 'SpeechSynthesisUtterance', {
      configurable: true,
      value: function SpeechSynthesisUtterance(this: { text?: string; lang?: string; rate?: number }, text: string) {
        this.text = text;
      },
    });
  });

  it('renders the Trợ lý AI tab inside the trip workspace', async () => {
    render(<TripWorkspaceShell trip={mockTrip} joinCode="join-code" />);

    expect(await screen.findByText('Trợ lý AI')).toBeInTheDocument();
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
      confidenceLabel: 'Ước lượng',
    });

    render(<AiAssistTab tripId="trip-1" initialSnapshot={leaderSnapshot} />);

    fireEvent.click(screen.getByRole('button', { name: 'Gợi ý lộ trình ăn uống' }));

    expect(await screen.findByText('Ước lượng')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Áp dụng vào lịch trình' })).toBeInTheDocument();
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
      confidenceLabel: 'Cần xem lại',
    });

    render(<AiAssistTab tripId="trip-1" initialSnapshot={memberSnapshot} />);

    fireEvent.click(screen.getByRole('button', { name: 'Gợi ý lộ trình ăn uống' }));

    expect((await screen.findAllByText('Cần xem lại')).length).toBeGreaterThan(0);
    expect(screen.queryByRole('button', { name: 'Ap dung vao lich trinh' })).not.toBeInTheDocument();
  });

  it('renders inline health warnings in the timeline day section', async () => {
    render(
      <TimelineDaySection
        day={leaderSnapshot.days[0]!}
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
      expect(screen.getAllByText('Nguy cơ cao').length).toBeGreaterThan(0);
      expect(screen.getByText(/dị ứng hải sản/i)).toBeInTheDocument();
    });
  });

  it('renders booking import forwarding address and recent draft list', async () => {
    render(<AiAssistTab tripId="trip-1" initialSnapshot={leaderSnapshot} />);

    expect((await screen.findAllByText('Địa chỉ chuyển tiếp')).length).toBeGreaterThan(0);
    expect(screen.getByText('booking+join-code@minhdidauthe.local')).toBeInTheDocument();
    expect(screen.getByText('Vé máy bay')).toBeInTheDocument();
  });

  it('shows low-confidence caution UI and the Nhập vào lịch trình CTA in booking review sheet', async () => {
    render(<AiAssistTab tripId="trip-1" initialSnapshot={leaderSnapshot} />);

    fireEvent.click(await screen.findByText('Vé máy bay'));

    expect(await screen.findAllByText('Cần xem lại')).not.toHaveLength(0);
    expect(screen.getByText(/^Raw excerpt$/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Nhập vào lịch trình' })).toBeInTheDocument();
  });

  it('renders menu translation CTA and shows local expert result cards with Bước tiếp theo', async () => {
    vi.mocked(localExpertApi.translateMenu).mockResolvedValue({
      localeHint: 'en',
      confidenceLabel: 'Cần xem lại',
      cards: [
        {
          originalText: 'Muc nuong sa',
          translatedText: 'Seafood dish',
          cautionNote: 'Tên món có thể dùng hải sản, cần xem lại với quán.',
          confidenceLabel: 'Cần xem lại',
          nextAction: 'Hoi quan ve thanh phan de chot mon an phu hop.',
        },
      ],
    });

    render(<AiAssistTab tripId="trip-1" initialSnapshot={leaderSnapshot} />);

    fireEvent.click(screen.getByRole('button', { name: 'Dịch menu' }));

    expect(await screen.findByText('Seafood dish')).toBeInTheDocument();
    expect(screen.getByText('Bước tiếp theo')).toBeInTheDocument();
    expect(screen.getAllByText('Cần xem lại').length).toBeGreaterThan(0);
  });

  it('renders hidden-spot cards from local expert without turning into chat text', async () => {
    vi.mocked(localExpertApi.requestHiddenSpots).mockResolvedValue({
      areaLabel: 'Hai Chau',
      vibe: 'yen tinh',
      budgetHint: 're',
      cards: [
        {
          title: 'Ngõ nhỏ gần Hai Chau',
          areaLabel: 'Hai Chau',
          whyItFits: 'Hợp với không khí yên tĩnh và dễ tránh điểm đông.',
          confidenceLabel: 'Gợi ý',
          nextAction: 'Mở map và đối chiếu đường đi bộ trước khi rẽ vào hẻm.',
        },
      ],
    });

    render(<AiAssistTab tripId="trip-1" initialSnapshot={leaderSnapshot} />);

    fireEvent.click(screen.getByRole('button', { name: 'Gợi ý chơi gì quanh đây' }));

    expect(await screen.findByText('Ngõ nhỏ gần Hai Chau')).toBeInTheDocument();
    expect(screen.getByText(/đối chiếu đường đi bộ/i)).toBeInTheDocument();
  });

  it('renders outfit planner cards with a maximum of three options', async () => {
    const cards: OutfitPlanCard[] = [
      {
        title: 'Set 1',
        colorDirection: 'kem, xanh biển',
        packingNotes: 'Áo thoáng và giày đi bộ.',
        confidenceLabel: 'Gợi ý',
        nextAction: 'Lấy set này làm option mặc chính cho buổi đầu.',
      },
      {
        title: 'Set 2',
        colorDirection: 'trắng ngà, denim sáng',
        packingNotes: 'Mang thêm khoác mỏng.',
        confidenceLabel: 'Ước lượng',
        nextAction: 'Gấp gọn sẵn trong vali.',
      },
      {
        title: 'Set 3',
        colorDirection: 'đỏ gạch, đen, kem',
        packingNotes: 'Cần xem lại nếu trời mưa thêm.',
        confidenceLabel: 'Cần xem lại',
        nextAction: 'Thử nhanh với giày và túi đang mang.',
      },
      {
        title: 'Set 4',
        colorDirection: 'sẽ không hiện',
        packingNotes: 'Không được render.',
        confidenceLabel: 'Gợi ý',
        nextAction: 'Không hiện.',
      },
    ];

    vi.mocked(localExpertApi.requestOutfitPlan).mockResolvedValue({
      dayIndex: 1,
      weatherLabel: 'mưa nhẹ, dễ mưa 60%',
      aestheticHint: 'nổi bật',
      activityLabels: ['Ăn tối ven sông'],
      cards,
    });

    render(<AiAssistTab tripId="trip-1" initialSnapshot={multiDayLeaderSnapshot} />);

    expect(await screen.findByDisplayValue('mưa nhẹ, dễ mưa 60%')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Lên đồ cho hôm nay' }));

    expect(await screen.findByText('Lên đồ cho hôm nay')).toBeInTheDocument();
    expect(screen.getByText('Set 1')).toBeInTheDocument();
    expect(screen.getByText('Set 3')).toBeInTheDocument();
    expect(screen.queryByText('Set 4')).not.toBeInTheDocument();
    expect(screen.getAllByText('Cần xem lại').length).toBeGreaterThan(0);
    await waitFor(() => {
      expect(localExpertApi.requestOutfitPlan).toHaveBeenCalledWith('trip-1', {
        dayIndex: 1,
        aestheticHint: 'nổi bật',
        weatherLabel: 'mưa nhẹ, dễ mưa 60%',
        activityLabels: ['Ăn tối ven sông'],
      });
    });
  });

  it('lets the user override the derived weather label before requesting outfits', async () => {
    vi.mocked(localExpertApi.requestOutfitPlan).mockResolvedValue({
      dayIndex: 1,
      weatherLabel: 'gió mạnh về tối',
      aestheticHint: 'nổi bật',
      activityLabels: ['Ăn tối ven sông'],
      cards: [],
    });

    render(<AiAssistTab tripId="trip-1" initialSnapshot={multiDayLeaderSnapshot} />);

    const weatherInput = await screen.findByDisplayValue('mưa nhẹ, dễ mưa 60%');
    fireEvent.change(weatherInput, { target: { value: 'gió mạnh về tối' } });
    fireEvent.click(screen.getByRole('button', { name: 'Lên đồ cho hôm nay' }));

    await waitFor(() => {
      expect(localExpertApi.requestOutfitPlan).toHaveBeenCalledWith('trip-1', {
        dayIndex: 1,
        aestheticHint: 'nổi bật',
        weatherLabel: 'gió mạnh về tối',
        activityLabels: ['Ăn tối ven sông'],
      });
    });
  });

  it('renders podcast recap controls and uses the browser tts playback branch', async () => {
    render(<AiAssistTab tripId="trip-1" initialSnapshot={leaderSnapshot} />);

    expect(await screen.findByText('Podcast ngày')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Phát recap' })).toBeInTheDocument();
    expect(screen.getByText('Tóm tắt nhanh')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Phát recap' }));

    expect(window.speechSynthesis.speak).toHaveBeenCalledTimes(1);
  });

  it('keeps the text recap visible when browser speech synthesis is unavailable', async () => {
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: undefined,
    });

    vi.mocked(dailyPodcastApi.getDailyPodcast).mockResolvedValue({
      recap: {
        ...podcastRecap,
        recapText: 'Bản text vẫn hiện rõ ràng dù máy không phát audio.',
      },
    });

    render(<AiAssistTab tripId="trip-1" initialSnapshot={leaderSnapshot} />);

    expect(await screen.findByText('Tóm tắt nhanh')).toBeInTheDocument();
    expect(screen.getByText('Bản text vẫn hiện rõ ràng dù máy không phát audio.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Phát recap' }));

    expect(
      await screen.findByText(/Máy này chưa hỗ trợ speechSynthesis/i),
    ).toBeInTheDocument();
    expect(screen.getByText('Bản text vẫn hiện rõ ràng dù máy không phát audio.')).toBeInTheDocument();
  });

  it('renders Chi phí địa phương warnings with all three severity labels', () => {
    render(
      <CostBenchmarkWarningCard
        warnings={benchmarkWarnings}
        currency="VND"
        destinationLabel="Đà Nẵng"
      />,
    );

    expect(screen.getByText('Chi phí địa phương')).toBeInTheDocument();
    expect(screen.getByText('Nguy cơ cao')).toBeInTheDocument();
    expect(screen.getAllByText('Cần xem lại').length).toBeGreaterThan(0);
    expect(screen.getByText('Lưu ý')).toBeInTheDocument();
    expect(screen.getAllByText(/Mặt bằng quán ăn phổ biến Đà Nẵng/i).length).toBeGreaterThan(0);
  });

  it('renders missing-data fallback copy for cost benchmarks as non-blocking guidance', () => {
    render(
      <CostBenchmarkWarningCard
        warnings={[benchmarkWarnings[1]!]}
        currency="VND"
        destinationLabel="Đà Nẵng"
      />,
    );

    expect(screen.getAllByText('Cần xem lại').length).toBeGreaterThan(0);
    expect(screen.getByText(/Chưa có mốc giá ổn định/i)).toBeInTheDocument();
    expect(screen.getByText(/Nguồn đối chiếu/i)).toBeInTheDocument();
  });
});
