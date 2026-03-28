const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

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

  let response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  // Auto-refresh on 401
  if (response.status === 401 && getStoredRefreshToken()) {
    const refreshed = await refreshTokens();
    if (refreshed) {
      headers['Authorization'] = `Bearer ${accessToken}`;
      response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers,
      });
    }
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
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

  async join(joinCode: string): Promise<TripMember> {
    return request<TripMember>(`/trips/${joinCode}/join`, {
      method: 'POST',
    });
  },
};
