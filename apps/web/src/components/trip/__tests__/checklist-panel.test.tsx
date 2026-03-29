import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ChecklistTab } from '../ChecklistTab';
import type { ChecklistSnapshot, TripMember } from '../../../lib/api-client';

const tripMembers: TripMember[] = [
  {
    id: 'tm-1',
    userId: 'u-1',
    tripId: 'trip-1',
    role: 'LEADER',
    joinedAt: new Date().toISOString(),
    user: {
      id: 'u-1',
      name: 'Leader',
      avatarUrl: null,
    },
  },
  {
    id: 'tm-2',
    userId: 'u-2',
    tripId: 'trip-1',
    role: 'MEMBER',
    joinedAt: new Date().toISOString(),
    user: {
      id: 'u-2',
      name: 'Member',
      avatarUrl: null,
    },
  },
];

const emptySnapshot: ChecklistSnapshot = {
  tripId: 'trip-1',
  isLeader: true,
  currentTripMemberId: 'tm-1',
  sharedCategories: [],
  personalTasks: [],
  documentGroups: [],
  myItems: [],
  totalItems: 0,
  completedItems: 0,
};

const populatedSnapshot: ChecklistSnapshot = {
  tripId: 'trip-1',
  isLeader: false,
  currentTripMemberId: 'tm-2',
  sharedCategories: [
    {
      id: 'group-1',
      title: 'Giấy tờ',
      kind: 'SHARED_CATEGORY',
      sortOrder: 1,
      itemCount: 1,
      completedCount: 0,
      items: [
        {
          id: 'item-1',
          title: 'Mang CCCD',
          notes: null,
          status: 'TODO',
          sortOrder: 1,
          assignee: {
            tripMemberId: 'tm-2',
            userId: 'u-2',
            name: 'Member',
            avatarUrl: null,
          },
          completedAt: null,
        },
      ],
    },
  ],
  personalTasks: [
    {
      id: 'group-2',
      title: 'Việc cá nhân',
      kind: 'PERSONAL_TASKS',
      sortOrder: 1,
      itemCount: 1,
      completedCount: 0,
      items: [
        {
          id: 'item-2',
          title: 'Sạc pin dự phòng',
          notes: null,
          status: 'TODO',
          sortOrder: 1,
          assignee: {
            tripMemberId: 'tm-2',
            userId: 'u-2',
            name: 'Member',
            avatarUrl: null,
          },
          completedAt: null,
        },
      ],
    },
  ],
  documentGroups: [],
  myItems: [
    {
      itemId: 'item-2',
      groupId: 'group-2',
      groupTitle: 'Việc cá nhân',
      title: 'Sạc pin dự phòng',
      notes: null,
      status: 'TODO',
      sortOrder: 1,
    },
  ],
  totalItems: 2,
  completedItems: 0,
};

vi.mock('../../../lib/api-client', async () => {
  const actual = await vi.importActual('../../../lib/api-client');
  return {
    ...actual,
    checklistsApi: {
      getSnapshot: vi.fn(),
      createGroup: vi.fn(),
      deleteGroup: vi.fn(),
      createItem: vi.fn(),
      updateItem: vi.fn(),
      toggleItem: vi.fn(),
      deleteItem: vi.fn(),
    },
  };
});

import { checklistsApi } from '../../../lib/api-client';

describe('Checklist', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders empty state', async () => {
    vi.mocked(checklistsApi.getSnapshot).mockResolvedValue(emptySnapshot);
    render(<ChecklistTab tripId="trip-1" members={tripMembers} />);
    expect(await screen.findByText('Checklist còn trống')).toBeInTheDocument();
  });

  it('renders shared category and personal task separation', async () => {
    vi.mocked(checklistsApi.getSnapshot).mockResolvedValue(populatedSnapshot);
    render(<ChecklistTab tripId="trip-1" members={tripMembers} />);
    expect(await screen.findByText('Giấy tờ')).toBeInTheDocument();
    expect(screen.getAllByText('Việc cá nhân').length).toBeGreaterThan(0);
    expect(screen.getByText('Chỉ xem việc của tôi')).toBeInTheDocument();
  });
});
