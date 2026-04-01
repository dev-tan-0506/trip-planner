import { io, type Socket } from 'socket.io-client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
const API_ORIGIN = API_BASE_URL.replace(/\/api$/, '');
const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || API_ORIGIN;

export class ApiRequestError extends Error {
  status?: number;
  code: 'network_error' | 'http_error';

  constructor(message: string, code: 'network_error' | 'http_error', status?: number) {
    super(message);
    this.name = 'ApiRequestError';
    this.code = code;
    this.status = status;
  }
}

export function toApiAssetUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (/^https?:\/\//.test(path) || path.startsWith('data:')) {
    return path;
  }
  return `${API_ORIGIN}${path.startsWith('/') ? path : `/${path}`}`;
}

// ─── Token Management ────────────────────────────────

let accessToken: string | null = null;

function getStoredRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('refreshToken');
}

function storeTokens(tokens: { accessToken: string; refreshToken: string }) {
  accessToken = tokens.accessToken;
  if (typeof window !== 'undefined') {
    localStorage.setItem('refreshToken', tokens.refreshToken);
  }
}

function clearTokens() {
  accessToken = null;
  if (typeof window !== 'undefined') {
    localStorage.removeItem('refreshToken');
  }
}

// ─── HTTP Client ─────────────────────────────────────

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
    });
  } catch {
    throw new ApiRequestError('Không thể kết nối tới máy chủ', 'network_error');
  }

  // Auto-refresh on 401
  if (response.status === 401 && getStoredRefreshToken()) {
    const refreshed = await refreshTokens();
    if (refreshed) {
      headers['Authorization'] = `Bearer ${accessToken}`;
      try {
        response = await fetch(`${API_BASE_URL}${path}`, {
          ...options,
          headers,
        });
      } catch {
        throw new ApiRequestError('Không thể kết nối tới máy chủ', 'network_error');
      }
    }
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new ApiRequestError(
      error.message || `HTTP ${response.status}`,
      'http_error',
      response.status,
    );
  }

  return response.json();
}

async function refreshTokens(): Promise<boolean> {
  const refreshToken = getStoredRefreshToken();
  if (!refreshToken) return false;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      clearTokens();
      return false;
    }

    const data = await response.json();
    storeTokens(data);
    return true;
  } catch {
    clearTokens();
    return false;
  }
}

// ─── Auth API ────────────────────────────────────────

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string | null;
    avatarUrl: string | null;
  };
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  healthProfile: string | null;
  provider: string;
  createdAt: string;
}

export const authApi = {
  async register(email: string, password: string, name?: string): Promise<AuthResponse> {
    const data = await request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
    storeTokens(data);
    return data;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const data = await request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    storeTokens(data);
    return data;
  },

  async logout(): Promise<void> {
    const refreshToken = getStoredRefreshToken();
    if (refreshToken) {
      await request('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      }).catch(() => {}); // Best-effort
    }
    clearTokens();
  },

  async getMe(): Promise<UserProfile> {
    return request<UserProfile>('/auth/me');
  },

  isLoggedIn(): boolean {
    return !!accessToken || !!getStoredRefreshToken();
  },
};

// ─── Trips API ───────────────────────────────────────

export interface TripMember {
  id: string;
  userId: string;
  tripId: string;
  role: 'LEADER' | 'MEMBER';
  joinedAt: string;
  user: {
    id: string;
    name: string | null;
    avatarUrl: string | null;
  };
}

export interface Trip {
  id: string;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  joinCode: string;
  createdAt: string;
  updatedAt: string;
  members: TripMember[];
}

export const tripsApi = {
  async create(data: {
    name: string;
    destination: string;
    startDate: string;
    endDate: string;
  }): Promise<Trip> {
    return request<Trip>('/trips', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getByJoinCode(joinCode: string): Promise<Trip> {
    return request<Trip>(`/trips/${joinCode}`);
  },

  async getPrivateByJoinCode(joinCode: string): Promise<Trip> {
    return request<Trip>(`/trips/${joinCode}/private`);
  },

  async join(joinCode: string): Promise<TripMember> {
    return request<TripMember>(`/trips/${joinCode}/join`, {
      method: 'POST',
    });
  },
};

// ─── Itinerary API ───────────────────────────────────

export type ProgressState = 'sap toi' | 'dang di' | 'da di' | 'chua chot gio';

export interface ItineraryItem {
  id: string;
  tripId: string;
  dayIndex: number;
  sortOrder: number;
  startMinute: number | null;
  startTime: string | null;
  title: string;
  locationName: string | null;
  locationAddress: string | null;
  placeId: string | null;
  lat: number | null;
  lng: number | null;
  shortNote: string | null;
  version: number;
  progress: ProgressState;
  proposalCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface DayGroup {
  dayIndex: number;
  items: ItineraryItem[];
}

export interface OverlapWarning {
  itemId: string;
  conflictsWith: string;
  dayIndex: number;
  startMinute: number;
  message: string;
}

export type HealthWarningSeverity = 'LUU_Y' | 'CAN_XEM_LAI' | 'NGUY_CO_CAO';
export type AiConfidenceLabel = 'Goi y' | 'Uoc luong' | 'Can xem lai';

export interface HealthWarning {
  itemId: string;
  severity: HealthWarningSeverity;
  title: string;
  message: string;
  confidenceLabel: AiConfidenceLabel;
  affectedMemberIds: string[];
}

export interface MapItem {
  id: string;
  title: string;
  lat: number;
  lng: number;
  dayIndex: number;
  sortOrder: number;
}

export interface ItinerarySnapshot {
  tripId: string;
  days: DayGroup[];
  overlapWarnings: OverlapWarning[];
  healthWarnings: HealthWarning[];
  mapItems: MapItem[];
  totalItems: number;
  isLeader: boolean;
  canEdit: boolean;
}

export interface CulinaryRouteSuggestionStop {
  itemId: string;
  title: string;
  dayIndex: number;
  sortOrder: number;
  lat: number | null;
  lng: number | null;
  reason: string;
}

export interface CulinaryRouteSuggestion {
  suggestionId: string;
  orderedItems: CulinaryRouteSuggestionStop[];
  totalEstimatedMinutes: number;
  confidenceLabel: AiConfidenceLabel;
}

export interface LocalExpertCard {
  title?: string;
  originalText?: string;
  translatedText?: string;
  areaLabel?: string;
  whyItFits?: string;
  cautionNote?: string;
  confidenceLabel: AiConfidenceLabel;
  nextAction: string;
}

export interface OutfitPlanCard {
  title: string;
  colorDirection: string;
  packingNotes: string;
  confidenceLabel: AiConfidenceLabel;
  nextAction: string;
}

export interface DailyPodcastRecap {
  id: string;
  tripId: string;
  dayIndex: number;
  title: string;
  recapText: string;
  transcript: string;
  audioMode: 'BROWSER_TTS' | string;
  audioUrl: string | null;
  durationSeconds: number;
  generatedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface GenerateDailyPodcastPayload {
  tone?: string;
  refresh?: boolean;
}

export interface TranslateMenuPayload {
  menuText: string;
  localeHint?: string;
}

export interface TranslateMenuResponse {
  localeHint: string;
  confidenceLabel: AiConfidenceLabel;
  cards: LocalExpertCard[];
}

export interface RequestHiddenSpotsPayload {
  areaLabel: string;
  vibe?: string;
  budgetHint?: string;
}

export interface RequestHiddenSpotsResponse {
  areaLabel: string;
  vibe: string;
  budgetHint: string;
  cards: LocalExpertCard[];
}

export interface RequestOutfitPlanPayload {
  dayIndex: number;
  aestheticHint?: string;
  weatherLabel?: string;
  activityLabels?: string[];
}

export interface RequestOutfitPlanResponse {
  dayIndex: number;
  weatherLabel: string;
  aestheticHint: string;
  activityLabels: string[];
  cards: OutfitPlanCard[];
}

export type BookingImportDraftStatus = 'DRAFT' | 'CONFIRMED' | 'REJECTED';

export interface BookingImportParsedItem {
  title: string;
  locationName: string | null;
  startTime: string | null;
  endTime: string | null;
  bookingCode: string | null;
  missingFields: string[];
  rawExcerpt: string;
}

export interface BookingImportConfig {
  tripId: string;
  forwardingAddress: string;
  joinCode: string;
  manualPasteEnabled: boolean;
}

export interface BookingImportDraft {
  id: string;
  tripId: string;
  createdByTripMemberId: string | null;
  reviewedByTripMemberId: string | null;
  sourceChannel: string;
  forwardingAddress: string;
  sourceMessageId: string | null;
  sourceSender: string | null;
  sourceSubject: string | null;
  rawContent: string;
  confidenceLabel: AiConfidenceLabel;
  status: BookingImportDraftStatus;
  parseSummary: string;
  parsedItems: BookingImportParsedItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingImportDraftPayload {
  rawContent: string;
  sourceSender?: string;
  sourceSubject?: string;
  sourceMessageId?: string;
}

export interface ConfirmBookingImportDraftPayload {
  parsedItems?: BookingImportParsedItem[];
}

export interface CreateItineraryItemPayload {
  title: string;
  dayIndex: number;
  insertAfterItemId?: string;
  startTime?: string;
  locationName?: string;
  shortNote?: string;
  locationAddress?: string;
  placeId?: string;
  lat?: number;
  lng?: number;
}

export interface UpdateItineraryItemPayload {
  title?: string;
  dayIndex?: number;
  startTime?: string;
  locationName?: string;
  shortNote?: string;
  locationAddress?: string;
  placeId?: string;
  lat?: number;
  lng?: number;
}

export interface ReorderPayload {
  items: { itemId: string; dayIndex: number; sortOrder: number }[];
}

export interface RequestCulinaryRoutePayload {
  itemIds: string[];
  travelMode?: string;
}

export interface ApplyCulinaryRoutePayload {
  orderedItemIds: string[];
  sourceSuggestionId: string;
}

export const itineraryApi = {
  async getSnapshot(tripId: string): Promise<ItinerarySnapshot> {
    return request<ItinerarySnapshot>(`/trips/${tripId}/itinerary`);
  },

  async createItem(tripId: string, body: CreateItineraryItemPayload): Promise<ItinerarySnapshot> {
    return request<ItinerarySnapshot>(`/trips/${tripId}/itinerary/items`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  async updateItem(tripId: string, itemId: string, body: UpdateItineraryItemPayload): Promise<ItinerarySnapshot> {
    return request<ItinerarySnapshot>(`/trips/${tripId}/itinerary/items/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  },

  async deleteItem(tripId: string, itemId: string): Promise<ItinerarySnapshot> {
    return request<ItinerarySnapshot>(`/trips/${tripId}/itinerary/items/${itemId}`, {
      method: 'DELETE',
    });
  },

  async reorder(tripId: string, body: ReorderPayload): Promise<ItinerarySnapshot> {
    return request<ItinerarySnapshot>(`/trips/${tripId}/itinerary/reorder`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  async requestCulinaryRoute(
    tripId: string,
    body: RequestCulinaryRoutePayload,
  ): Promise<CulinaryRouteSuggestion> {
    return request<CulinaryRouteSuggestion>(`/trips/${tripId}/itinerary/culinary-route/suggest`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  async applyCulinaryRoute(
    tripId: string,
    body: ApplyCulinaryRoutePayload,
  ): Promise<ItinerarySnapshot> {
    return request<ItinerarySnapshot>(`/trips/${tripId}/itinerary/culinary-route/apply`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },
};

export const localExpertApi = {
  async translateMenu(
    tripId: string,
    body: TranslateMenuPayload,
  ): Promise<TranslateMenuResponse> {
    return request<TranslateMenuResponse>(`/trips/${tripId}/local-expert/menu-translate`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  async requestHiddenSpots(
    tripId: string,
    body: RequestHiddenSpotsPayload,
  ): Promise<RequestHiddenSpotsResponse> {
    return request<RequestHiddenSpotsResponse>(`/trips/${tripId}/local-expert/hidden-spots`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  async requestOutfitPlan(
    tripId: string,
    body: RequestOutfitPlanPayload,
  ): Promise<RequestOutfitPlanResponse> {
    return request<RequestOutfitPlanResponse>(`/trips/${tripId}/local-expert/outfit-plan`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },
};

export const bookingImportApi = {
  async getBookingImportConfig(tripId: string): Promise<BookingImportConfig> {
    return request<BookingImportConfig>(`/trips/${tripId}/booking-import/config`);
  },

  async listBookingImportDrafts(tripId: string): Promise<BookingImportDraft[]> {
    return request<BookingImportDraft[]>(`/trips/${tripId}/booking-import/drafts`);
  },

  async createBookingImportDraft(
    tripId: string,
    body: CreateBookingImportDraftPayload,
  ): Promise<BookingImportDraft> {
    return request<BookingImportDraft>(`/trips/${tripId}/booking-import/drafts`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  async confirmBookingImportDraft(
    tripId: string,
    draftId: string,
    body: ConfirmBookingImportDraftPayload,
  ): Promise<{ draft: BookingImportDraft; snapshot: ItinerarySnapshot }> {
    return request<{ draft: BookingImportDraft; snapshot: ItinerarySnapshot }>(
      `/trips/${tripId}/booking-import/drafts/${draftId}/confirm`,
      {
        method: 'POST',
        body: JSON.stringify(body),
      },
    );
  },
};

export const dailyPodcastApi = {
  async getDailyPodcast(tripId: string, dayIndex: number): Promise<{ recap: DailyPodcastRecap | null }> {
    return request<{ recap: DailyPodcastRecap | null }>(`/trips/${tripId}/daily-podcast/${dayIndex}`);
  },

  async generateDailyPodcast(
    tripId: string,
    dayIndex: number,
    body: GenerateDailyPodcastPayload,
  ): Promise<DailyPodcastRecap> {
    return request<DailyPodcastRecap>(`/trips/${tripId}/daily-podcast/${dayIndex}/generate`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },
};

// ─── Proposals API ───────────────────────────────────

export type ProposalType = 'ADD_ITEM' | 'UPDATE_TIME' | 'UPDATE_LOCATION' | 'UPDATE_NOTE';
export type ProposalStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'OUTDATED';

export interface Proposal {
  id: string;
  tripId: string;
  proposerId: string;
  targetItemId: string | null;
  type: ProposalType;
  payload: Record<string, unknown>;
  baseVersion: number | null;
  status: ProposalStatus;
  reviewedById: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
  proposer: { id: string; name: string | null; avatarUrl: string | null };
  reviewer: { id: string; name: string | null; avatarUrl: string | null } | null;
  targetItem: { id: string; title: string; dayIndex: number; version: number } | null;
}

export interface CreateProposalPayload {
  type: ProposalType;
  targetItemId?: string;
  payload: Record<string, unknown>;
  baseVersion?: number;
}

export const proposalsApi = {
  async listProposals(tripId: string): Promise<Proposal[]> {
    return request<Proposal[]>(`/trips/${tripId}/proposals`);
  },

  async createProposal(tripId: string, body: CreateProposalPayload): Promise<Proposal> {
    return request<Proposal>(`/trips/${tripId}/proposals`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  async acceptProposal(tripId: string, proposalId: string): Promise<Proposal> {
    return request<Proposal>(`/trips/${tripId}/proposals/${proposalId}/accept`, {
      method: 'POST',
    });
  },

  async rejectProposal(tripId: string, proposalId: string): Promise<Proposal> {
    return request<Proposal>(`/trips/${tripId}/proposals/${proposalId}/reject`, {
      method: 'POST',
    });
  },
};

// ─── Votes API ───────────────────────────────────────

export type VoteSessionMode = 'NEW_OPTION' | 'REPLACE_ITEM' | 'TIE_BREAK';
export type VoteSessionStatus = 'PENDING_APPROVAL' | 'OPEN' | 'CLOSED' | 'LEADER_DECISION_REQUIRED';
export type VoteOptionStatus = 'PENDING_APPROVAL' | 'ACTIVE' | 'REJECTED' | 'WINNER' | 'RUNNER_UP';

export interface VoteOption {
  id: string;
  voteSessionId: string;
  title: string;
  payload: Record<string, unknown>;
  status: VoteOptionStatus;
  voteCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface VoteBallotRef {
  id: string;
  userId: string;
  voteOptionId: string;
}

export interface VoteSessionOutcome {
  id: string;
  voteSessionId: string;
  winningOptionId: string;
  tripId: string;
  targetItemId: string | null;
  targetDayIndex: number | null;
  targetInsertAfterItemId: string | null;
  createdItemId: string | null;
  replacementProposalId: string | null;
  payload: Record<string, unknown>;
}

export interface VoteSession {
  id: string;
  tripId: string;
  createdById: string;
  targetItemId: string | null;
  targetDayIndex: number | null;
  targetInsertAfterItemId: string | null;
  mode: VoteSessionMode;
  status: VoteSessionStatus;
  deadline: string;
  parentSessionId: string | null;
  tieBreakRound: number;
  options: VoteOption[];
  ballots: VoteBallotRef[];
  createdBy: { id: string; name: string | null; avatarUrl: string | null };
  outcome: VoteSessionOutcome | null;
  totalVotes?: number;
  currentItem?: ItineraryItem | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVoteSessionPayload {
  mode: 'NEW_OPTION' | 'REPLACE_ITEM';
  deadline: string;
  description?: string;
  targetItemId?: string;
  targetDayIndex?: number;
  targetInsertAfterItemId?: string;
}

export interface CreateVoteOptionPayload {
  title: string;
  payload: Record<string, unknown>;
}

export const votesApi = {
  async createSession(tripId: string, body: CreateVoteSessionPayload): Promise<VoteSession> {
    return request<VoteSession>(`/trips/${tripId}/votes/sessions`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  async listSessions(tripId: string): Promise<VoteSession[]> {
    return request<VoteSession[]>(`/trips/${tripId}/votes/sessions`);
  },

  async getSession(tripId: string, sessionId: string): Promise<VoteSession> {
    return request<VoteSession>(`/trips/${tripId}/votes/sessions/${sessionId}`);
  },

  async approveSession(sessionId: string): Promise<VoteSession> {
    return request<VoteSession>(`/vote-sessions/${sessionId}/approve`, {
      method: 'POST',
    });
  },

  async submitBallot(sessionId: string, voteOptionId: string): Promise<VoteBallotRef> {
    return request<VoteBallotRef>(`/vote-sessions/${sessionId}/ballot`, {
      method: 'POST',
      body: JSON.stringify({ voteOptionId }),
    });
  },

  async createOption(sessionId: string, body: CreateVoteOptionPayload): Promise<VoteOption> {
    return request<VoteOption>(`/vote-sessions/${sessionId}/options`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  async approveOption(sessionId: string, optionId: string): Promise<VoteOption> {
    return request<VoteOption>(`/vote-sessions/${sessionId}/options/${optionId}/approve`, {
      method: 'POST',
    });
  },

  async resolveLeaderDecision(sessionId: string, winningOptionId: string): Promise<VoteSession> {
    return request<VoteSession>(`/vote-sessions/${sessionId}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ winningOptionId }),
    });
  },
};

// ─── Community Templates ────────────────────────────

export interface TemplateListing {
  id: string;
  title: string;
  destinationLabel: string;
  summary: string | null;
  daysCount: number;
  cloneCount: number;
  createdAt: string;
  publishedBy: { id: string; name: string | null; avatarUrl: string | null };
}

export interface PublishedTemplateStatus {
  id: string;
  title: string;
  status: string;
  createdAt: string;
}

export interface CommunityTemplate extends TemplateListing {
  sourceTripId: string;
  publishedById: string;
  coverNote: string | null;
  sanitizedSnapshot: {
    destination: string;
    days: Array<{
      dayIndex: number;
      items: Array<{
        title: string;
        startMinute: number | null;
        locationName: string | null;
        lat: number | null;
        lng: number | null;
        shortNote: string | null;
        sortOrder: number;
      }>;
    }>;
  };
  status: string;
  updatedAt: string;
}

export const templatesApi = {
  async list(): Promise<TemplateListing[]> {
    return request<TemplateListing[]>('/templates');
  },

  async get(templateId: string): Promise<CommunityTemplate> {
    return request<CommunityTemplate>(`/templates/${templateId}`);
  },

  async publish(tripId: string, body: { title: string; summary?: string; coverNote?: string }): Promise<CommunityTemplate> {
    return request<CommunityTemplate>(`/trips/${tripId}/templates/publish`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  async getPublishedForTrip(tripId: string): Promise<PublishedTemplateStatus | null> {
    return request<PublishedTemplateStatus | null>(`/trips/${tripId}/templates/published`);
  },

  async clone(templateId: string, body: {
    name: string;
    destination: string;
    startDate: string;
    endDate: string;
    timeZone: string;
  }): Promise<{ tripId: string; joinCode: string }> {
    return request<{ tripId: string; joinCode: string }>(`/templates/${templateId}/clone`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },
};

// ─── Logistics Allocation ────────────────────────────

export interface AllocationUnitMember {
  assignmentId: string;
  tripMemberId: string;
  userId: string;
  name: string | null;
  avatarUrl: string | null;
  source: string;
  role: string;
  seatLabel?: string | null;
}

export interface AllocationUnit {
  id: string;
  type: 'ROOM' | 'RIDE';
  label: string;
  capacity: number;
  rideKind?: 'MOTORBIKE' | 'CAR' | 'BUS' | null;
  plateNumber?: string | null;
  seatLabels?: string[];
  sortOrder: number;
  note: string | null;
  occupancy: number;
  remainingCapacity: number;
  isOverbooked: boolean;
  overCapacityBy: number;
  members: AllocationUnitMember[];
}

export interface AllocationSnapshotMember {
  tripMemberId: string;
  userId: string;
  name: string | null;
  avatarUrl: string | null;
  role: string;
}

export interface AllocationSnapshot {
  tripId: string;
  isLeader: boolean;
  currentTripMemberId: string;
  roomUnits: AllocationUnit[];
  rideUnits: AllocationUnit[];
  totalMembers: number;
  members: AllocationSnapshotMember[];
}

export const logisticsApi = {
  async getAllocations(tripId: string): Promise<AllocationSnapshot> {
    return request<AllocationSnapshot>(`/trips/${tripId}/logistics/allocations`);
  },

  async createUnit(
    tripId: string,
    body: {
      type: 'ROOM' | 'RIDE';
      label: string;
      capacity: number;
      note?: string;
      rideKind?: 'MOTORBIKE' | 'CAR' | 'BUS';
      plateNumber?: string;
      seatLabels?: string[];
    },
  ): Promise<AllocationSnapshot> {
    return request<AllocationSnapshot>(`/trips/${tripId}/logistics/units`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  async updateUnit(
    tripId: string,
    unitId: string,
    body: { label?: string; capacity?: number; note?: string },
  ): Promise<AllocationSnapshot> {
    return request<AllocationSnapshot>(`/trips/${tripId}/logistics/units/${unitId}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  },

  async deleteUnit(tripId: string, unitId: string): Promise<AllocationSnapshot> {
    return request<AllocationSnapshot>(`/trips/${tripId}/logistics/units/${unitId}`, {
      method: 'DELETE',
    });
  },

  async selfJoin(
    tripId: string,
    body: { unitId: string; seatLabel?: string },
  ): Promise<AllocationSnapshot> {
    return request<AllocationSnapshot>(`/trips/${tripId}/logistics/assignments/self-join`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  async leave(tripId: string, body: { type: 'ROOM' | 'RIDE' }): Promise<AllocationSnapshot> {
    return request<AllocationSnapshot>(`/trips/${tripId}/logistics/assignments/leave`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  async reassign(
    tripId: string,
    body: { tripMemberId: string; targetUnitId: string; targetSeatLabel?: string },
  ): Promise<AllocationSnapshot> {
    return request<AllocationSnapshot>(`/trips/${tripId}/logistics/assignments/reassign`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  async autoFill(tripId: string, type: 'ROOM' | 'RIDE'): Promise<AllocationSnapshot> {
    return request<AllocationSnapshot>(`/trips/${tripId}/logistics/auto-fill`, {
      method: 'POST',
      body: JSON.stringify({ type }),
    });
  },
};

// ─── Checklists API ──────────────────────────────────

export type ChecklistGroupKind = 'SHARED_CATEGORY' | 'PERSONAL_TASKS' | 'DOCUMENTS';
export type ChecklistItemStatus = 'TODO' | 'DONE';

export interface ChecklistAssignee {
  tripMemberId: string;
  userId: string;
  name: string | null;
  avatarUrl: string | null;
}

export interface ChecklistItem {
  id: string;
  title: string;
  notes: string | null;
  status: ChecklistItemStatus;
  sortOrder: number;
  canToggleSelf?: boolean;
  proofUrl?: string | null;
  proofSubmittedAt?: string | null;
  assignee: ChecklistAssignee | null;
  completedAt: string | null;
}

export interface ChecklistGroupSnapshot {
  id: string;
  title: string;
  kind: ChecklistGroupKind;
  sortOrder: number;
  itemCount: number;
  completedCount: number;
  items: ChecklistItem[];
}

export interface ChecklistMyItem {
  itemId: string;
  groupId: string;
  groupTitle: string;
  title: string;
  notes: string | null;
  status: ChecklistItemStatus;
  sortOrder: number;
}

export interface ChecklistSnapshot {
  tripId: string;
  isLeader: boolean;
  currentTripMemberId: string;
  sharedCategories: ChecklistGroupSnapshot[];
  personalTasks: ChecklistGroupSnapshot[];
  documentGroups: ChecklistGroupSnapshot[];
  myItems: ChecklistMyItem[];
  totalItems: number;
  completedItems: number;
}

export const checklistsApi = {
  async getSnapshot(tripId: string): Promise<ChecklistSnapshot> {
    return request<ChecklistSnapshot>(`/trips/${tripId}/checklists`);
  },

  async createGroup(
    tripId: string,
    body: { title: string; kind: ChecklistGroupKind },
  ): Promise<ChecklistSnapshot> {
    return request<ChecklistSnapshot>(`/trips/${tripId}/checklists/groups`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  async deleteGroup(tripId: string, groupId: string): Promise<ChecklistSnapshot> {
    return request<ChecklistSnapshot>(`/trips/${tripId}/checklists/groups/${groupId}`, {
      method: 'DELETE',
    });
  },

  async createItem(
    tripId: string,
    body: {
      groupId: string;
      title: string;
      notes?: string;
      assigneeTripMemberId?: string;
      applyToAllMembers?: boolean;
    },
  ): Promise<ChecklistSnapshot> {
    return request<ChecklistSnapshot>(`/trips/${tripId}/checklists/items`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  async updateItem(
    tripId: string,
    itemId: string,
    body: {
      title?: string;
      notes?: string;
      assigneeTripMemberId?: string;
    },
  ): Promise<ChecklistSnapshot> {
    return request<ChecklistSnapshot>(`/trips/${tripId}/checklists/items/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  },

  async toggleItem(tripId: string, itemId: string): Promise<ChecklistSnapshot> {
    return request<ChecklistSnapshot>(`/trips/${tripId}/checklists/items/${itemId}/toggle`, {
      method: 'POST',
    });
  },

  async deleteItem(tripId: string, itemId: string): Promise<ChecklistSnapshot> {
    return request<ChecklistSnapshot>(`/trips/${tripId}/checklists/items/${itemId}`, {
      method: 'DELETE',
    });
  },

  async submitProof(
    tripId: string,
    itemId: string,
    body: { imageDataUrl: string },
  ): Promise<ChecklistSnapshot> {
    return request<ChecklistSnapshot>(`/trips/${tripId}/checklists/items/${itemId}/proof`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },
};

// ─── Attendance API ──────────────────────────────────

export type AttendanceSessionStatus = 'OPEN' | 'CLOSED';
export type AttendanceLocationStatus = 'GRANTED' | 'DENIED' | 'UNAVAILABLE';

export interface AttendanceMemberRow {
  tripMemberId: string;
  userId: string;
  name: string | null;
  avatarUrl: string | null;
  role: 'LEADER' | 'MEMBER';
  hasSubmitted: boolean;
  submittedAt: string | null;
  status: 'ARRIVED' | 'MISSING' | 'NO_LOCATION';
  photoUrl: string | null;
  lat: number | null;
  lng: number | null;
  accuracyMeters: number | null;
  locationStatus: AttendanceLocationStatus | null;
}

export interface AttendanceSessionSnapshot {
  id: string;
  tripId: string;
  title: string;
  meetingLabel: string;
  meetingAddress: string;
  lat: number | null;
  lng: number | null;
  opensAt: string;
  closesAt: string;
  status: AttendanceSessionStatus;
}

export interface AttendanceSnapshot {
  tripId: string;
  isLeader: boolean;
  currentTripMemberId: string;
  session: AttendanceSessionSnapshot | null;
  counts: {
    arrived: number;
    missing: number;
    noLocation: number;
  };
  mapPoints: Array<{
    tripMemberId: string;
    name: string | null;
    lat: number;
    lng: number;
    status: 'ARRIVED' | 'NO_LOCATION';
  }>;
  members: AttendanceMemberRow[];
}

export interface AttendanceSocketJoinPayload {
  tripId: string;
  userId: string;
  sessionId?: string | null;
}

export function connectAttendanceSocket(): Socket {
  return io(`${WS_BASE_URL}/attendance`, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 10,
  });
}

export const attendanceApi = {
  async getCurrentSession(tripId: string): Promise<AttendanceSnapshot> {
    return request<AttendanceSnapshot>(`/trips/${tripId}/attendance/sessions/current`);
  },

  async createSession(
    tripId: string,
    body: {
      title: string;
      meetingLabel: string;
      meetingAddress: string;
      lat?: number;
      lng?: number;
      opensAt: string;
      closesAt: string;
    },
  ): Promise<AttendanceSnapshot> {
    return request<AttendanceSnapshot>(`/trips/${tripId}/attendance/sessions`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  async submitProof(
    sessionId: string,
    body: {
      imageDataUrl?: string;
      lat?: number;
      lng?: number;
      accuracyMeters?: number;
      locationStatus: AttendanceLocationStatus;
    },
  ): Promise<AttendanceSnapshot> {
    return request<AttendanceSnapshot>(`/attendance/sessions/${sessionId}/submissions`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  async closeSession(sessionId: string): Promise<AttendanceSnapshot> {
    return request<AttendanceSnapshot>(`/attendance/sessions/${sessionId}/close`, {
      method: 'POST',
    });
  },
};

// ─── Fund & Safety API ──────────────────────────────

export interface FundContributionRow {
  id: string;
  tripMemberId: string;
  declaredAmount: string;
  method: 'MOMO' | 'BANK_TRANSFER' | 'CASH' | 'OTHER';
  status: 'PLEDGED' | 'CONFIRMED' | 'REJECTED';
  transferNote: string | null;
  confirmedAt: string | null;
  createdAt: string;
  member: {
    tripMemberId: string;
    userId: string;
    name: string | null;
    avatarUrl: string | null;
    role: 'LEADER' | 'MEMBER';
  };
  confirmedBy: {
    tripMemberId: string;
    userId: string;
    name: string | null;
  } | null;
}

export interface FundExpenseRow {
  id: string;
  title: string;
  amount: string;
  category: 'FOOD' | 'TRANSPORT' | 'ACCOMMODATION' | 'TICKETS' | 'EMERGENCY' | 'OTHER';
  incurredAt: string;
  linkedItineraryItemId: string | null;
  createdBy: {
    tripMemberId: string;
    userId: string;
    name: string | null;
  };
}

export interface FundSnapshot {
  tripId: string;
  hasFund: boolean;
  isLeader: boolean;
  currentTripMemberId: string;
  fund: {
    id: string;
    status: string;
    currency: string;
    targetAmount: string;
    collectedAmount: string;
    spentAmount: string;
    remainingAmount: string;
    burnRatePercent: string;
    momoQrPayload: Record<string, unknown> | null;
    bankQrPayload: Record<string, unknown> | null;
    ownerTripMemberId: string;
  } | null;
  contributions: FundContributionRow[];
  expenses: FundExpenseRow[];
  summary: {
    targetAmount: string;
    collectedAmount: string;
    spentAmount: string;
    remainingAmount: string;
    burnRatePercent: string;
  };
  roleFlags: {
    canManageFund: boolean;
    canSubmitContribution: boolean;
    canConfirmContribution: boolean;
    canCreateExpense: boolean;
  };
}

export interface SafetyOverviewSnapshot {
  tripId: string;
  destinationLabel: string;
  contextLabel: string;
  weather: Array<{
    date: string;
    label: string;
    condition: string;
    temperatureC: number;
    rainChancePercent: number;
  }>;
  crowd: Array<{
    locationLabel: string;
    level: 'THAP' | 'VUA' | 'CAO';
    note: string;
  }>;
  directoryQuickPicks: SafetyDirectoryEntry[];
}

export interface SafetyDirectoryEntry {
  id: string;
  kind: string;
  title: string;
  phone: string | null;
  address: string;
  lat: number | null;
  lng: number | null;
  source: string;
  verifiedAt: string | null;
}

export interface SafetyWarningsSnapshot {
  tripId: string;
  warnings: Array<{
    id: string;
    title: string;
    message: string;
    linkedItineraryItemId: string | null;
  }>;
  alerts: Array<{
    id: string;
    type: string;
    status: string;
    message: string;
    createdAt: string;
    linkedItineraryItemId: string | null;
    createdBy: {
      tripMemberId: string;
      userId: string;
      name: string | null;
    } | null;
  }>;
  quickDial: Array<{
    label: string;
    phone: string;
  }>;
}

export function connectSafetySocket(): Socket {
  return io(`${WS_BASE_URL}/safety`, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 10,
  });
}

export const fundApi = {
  async getFund(tripId: string): Promise<FundSnapshot> {
    return request<FundSnapshot>(`/trips/${tripId}/fund`);
  },

  async createFund(
    tripId: string,
    body: {
      targetAmount: string;
      currency?: string;
      momoQrPayload?: Record<string, unknown>;
      bankQrPayload?: Record<string, unknown>;
    },
  ): Promise<FundSnapshot> {
    return request<FundSnapshot>(`/trips/${tripId}/fund`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  async updateFund(
    tripId: string,
    body: {
      targetAmount: string;
      currency?: string;
      momoQrPayload?: Record<string, unknown>;
      bankQrPayload?: Record<string, unknown>;
    },
  ): Promise<FundSnapshot> {
    return request<FundSnapshot>(`/trips/${tripId}/fund`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  },

  async submitContribution(
    tripId: string,
    body: { declaredAmount: string; method: 'MOMO' | 'BANK_TRANSFER' | 'CASH' | 'OTHER'; transferNote?: string },
  ): Promise<FundSnapshot> {
    return request<FundSnapshot>(`/trips/${tripId}/fund/contributions`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  async confirmContribution(tripId: string, contributionId: string): Promise<FundSnapshot> {
    return request<FundSnapshot>(`/trips/${tripId}/fund/contributions/${contributionId}/confirm`, {
      method: 'POST',
    });
  },

  async createExpense(
    tripId: string,
    body: {
      title: string;
      amount: string;
      category: 'FOOD' | 'TRANSPORT' | 'ACCOMMODATION' | 'TICKETS' | 'EMERGENCY' | 'OTHER';
      incurredAt: string;
      linkedItineraryItemId?: string;
    },
  ): Promise<FundSnapshot> {
    return request<FundSnapshot>(`/trips/${tripId}/fund/expenses`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },
};

export const safetyApi = {
  async getSafetyOverview(tripId: string): Promise<SafetyOverviewSnapshot> {
    return request<SafetyOverviewSnapshot>(`/trips/${tripId}/safety/overview`);
  },

  async getSafetyDirectory(tripId: string): Promise<SafetyDirectoryEntry[]> {
    return request<SafetyDirectoryEntry[]>(`/trips/${tripId}/safety/directory`);
  },

  async getSafetyWarnings(tripId: string): Promise<SafetyWarningsSnapshot> {
    return request<SafetyWarningsSnapshot>(`/trips/${tripId}/safety/warnings`);
  },

  async createSosAlert(
    tripId: string,
    body: { message?: string; linkedItineraryItemId?: string },
  ): Promise<SafetyWarningsSnapshot> {
    return request<SafetyWarningsSnapshot>(`/trips/${tripId}/safety/sos`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  async acknowledgeSafetyAlert(tripId: string, alertId: string): Promise<SafetyWarningsSnapshot> {
    return request<SafetyWarningsSnapshot>(`/trips/${tripId}/safety/alerts/${alertId}/acknowledge`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
  },

  async resolveSafetyAlert(tripId: string, alertId: string): Promise<SafetyWarningsSnapshot> {
    return request<SafetyWarningsSnapshot>(`/trips/${tripId}/safety/alerts/${alertId}/resolve`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
  },
};
