const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

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
  mapItems: MapItem[];
  totalItems: number;
  isLeader: boolean;
  canEdit: boolean;
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
}

export interface AllocationUnit {
  id: string;
  type: 'ROOM' | 'RIDE';
  label: string;
  capacity: number;
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
    body: { type: 'ROOM' | 'RIDE'; label: string; capacity: number; note?: string },
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

  async selfJoin(tripId: string, body: { unitId: string }): Promise<AllocationSnapshot> {
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
    body: { tripMemberId: string; targetUnitId: string },
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

