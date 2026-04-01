import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { HTMLAttributes, PropsWithChildren, ReactNode } from 'react';

type MockMotionProps = PropsWithChildren<HTMLAttributes<HTMLElement> & Record<string, unknown>>;
type MockIconProps = Record<string, unknown>;
type MockMotionConfig = {
  initial?: unknown;
  animate?: unknown;
  exit?: unknown;
  transition?: unknown;
  drag?: unknown;
  dragConstraints?: unknown;
  dragElastic?: unknown;
  onDragEnd?: unknown;
  whileHover?: unknown;
  whileTap?: unknown;
  layout?: unknown;
};

// Mock framer-motion for vote components
vi.mock('framer-motion', () => {
  const React = require('react') as typeof import('react');
  return {
    motion: new Proxy({}, {
      get: (_target: unknown, prop: string) => {
        return React.forwardRef<HTMLElement, MockMotionProps>(({ children, ...rest }, ref) => {
          const {
            initial, animate, exit, transition, drag, dragConstraints,
            dragElastic, onDragEnd, whileHover, whileTap, layout,
            ...domProps
          } = rest as MockMotionProps & MockMotionConfig;
          return React.createElement(prop, { ...domProps, ref }, children as ReactNode);
        });
      },
    }),
    AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
    useMotionValue: (init: number) => ({
      get: () => init,
      set: () => {},
      on: () => () => {},
    }),
    useTransform: (_value: unknown, _input: unknown, output: number[]) => ({
      get: () => output?.[1] ?? 0,
    }),
  };
});

// Mock lucide-react icons
vi.mock('lucide-react', () => {
  const React = require('react');
  const icon = (name: string) => (props: MockIconProps) =>
    React.createElement('span', { 'data-testid': `icon-${name}`, ...props });
  return {
    ThumbsUp: icon('ThumbsUp'),
    ThumbsDown: icon('ThumbsDown'),
    ArrowLeft: icon('ArrowLeft'),
    Clock: icon('Clock'),
    Users: icon('Users'),
    ChevronLeft: icon('ChevronLeft'),
    ChevronRight: icon('ChevronRight'),
    CheckCircle2: icon('CheckCircle2'),
    Timer: icon('Timer'),
    Trophy: icon('Trophy'),
    Crown: icon('Crown'),
    BarChart3: icon('BarChart3'),
    MapPin: icon('MapPin'),
    Replace: icon('Replace'),
    Zap: icon('Zap'),
    Plus: icon('Plus'),
    AlertCircle: icon('AlertCircle'),
    Lock: icon('Lock'),
    Eye: icon('Eye'),
    Vote: icon('Vote'),
    Loader2: icon('Loader2'),
    Wifi: icon('Wifi'),
    WifiOff: icon('WifiOff'),
    Compass: icon('Compass'),
    Share2: icon('Share2'),
    Copy: icon('Copy'),
    Check: icon('Check'),
    UserPlus: icon('UserPlus'),
    Calendar: icon('Calendar'),
  };
});

import { VoteCardDeck } from '../VoteCardDeck';
import { VoteResultsPanel } from '../VoteResultsPanel';
import type { VoteSession } from '../../../lib/api-client';

function makeSession(overrides: Partial<VoteSession> = {}): VoteSession {
  return {
    id: 'session-1',
    tripId: 'trip-1',
    createdById: 'user-leader',
    targetItemId: null,
    targetDayIndex: 0,
    targetInsertAfterItemId: null,
    mode: 'NEW_OPTION',
    status: 'OPEN',
    deadline: new Date(Date.now() + 3600000).toISOString(),
    parentSessionId: null,
    tieBreakRound: 0,
    options: [
      {
        id: 'opt-a',
        voteSessionId: 'session-1',
        title: 'Option A',
        payload: { title: 'Option A', locationName: 'Place A' },
        status: 'ACTIVE',
        voteCount: 3,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'opt-b',
        voteSessionId: 'session-1',
        title: 'Option B',
        payload: { title: 'Option B', locationName: 'Place B' },
        status: 'ACTIVE',
        voteCount: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    ballots: [],
    createdBy: { id: 'user-leader', name: 'Leader', avatarUrl: null },
    outcome: null,
    totalVotes: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  } as VoteSession;
}

describe('VoteCardDeck', () => {
  const mockOnVote = vi.fn().mockResolvedValue(undefined);
  const mockOnBack = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders desktop fallback buttons for skip and vote', () => {
    const session = makeSession();
    render(
      <VoteCardDeck
        session={session}
        userId="user-1"
        onVote={mockOnVote}
        onBack={mockOnBack}
      />,
    );

    // Desktop buttons exist (using getAllByText since text appears in swipe hints too)
    const skipButtons = screen.getAllByText('Khong chon');
    expect(skipButtons.length).toBeGreaterThanOrEqual(1);
    const voteButtons = screen.getAllByText('Chon phuong an nay');
    expect(voteButtons.length).toBeGreaterThanOrEqual(1);
  });

  it('shows the first option card title', () => {
    const session = makeSession();
    render(
      <VoteCardDeck
        session={session}
        userId="user-1"
        onVote={mockOnVote}
        onBack={mockOnBack}
      />,
    );

    // Option A appears in both the swipe card and interim results
    const optionTexts = screen.getAllByText('Option A');
    expect(optionTexts.length).toBeGreaterThanOrEqual(1);
  });

  it('renders interim results section while session is open', () => {
    const session = makeSession();
    render(
      <VoteCardDeck
        session={session}
        userId="user-1"
        onVote={mockOnVote}
        onBack={mockOnBack}
      />,
    );

    expect(screen.getByText(/Kết quả tạm thời/)).toBeInTheDocument();
  });

  it('calls onVote with current option id when vote button clicked', async () => {
    const session = makeSession();
    render(
      <VoteCardDeck
        session={session}
        userId="user-1"
        onVote={mockOnVote}
        onBack={mockOnBack}
      />,
    );

    // Click the desktop vote button (the <button> contains the text)
    const voteButtons = screen.getAllByText('Chon phuong an nay');
    // The desktop button is the last one (the other is the swipe hint)
    fireEvent.click(voteButtons[voteButtons.length - 1]!);
    expect(mockOnVote).toHaveBeenCalledWith('opt-a');
  });

  it('shows already-voted indicator when user ballot exists', () => {
    const session = makeSession({
      ballots: [{ id: 'ballot-1', userId: 'user-1', voteOptionId: 'opt-a' }],
    });
    render(
      <VoteCardDeck
        session={session}
        userId="user-1"
        onVote={mockOnVote}
        onBack={mockOnBack}
      />,
    );

    expect(screen.getByText(/Bạn đã bình chọn/)).toBeInTheDocument();
  });

  it('marks user choice with checkmark in interim results', () => {
    const session = makeSession({
      ballots: [{ id: 'ballot-1', userId: 'user-1', voteOptionId: 'opt-b' }],
    });
    render(
      <VoteCardDeck
        session={session}
        userId="user-1"
        onVote={mockOnVote}
        onBack={mockOnBack}
      />,
    );

    expect(screen.getByText(/Option B ✓/)).toBeInTheDocument();
  });
});

describe('VoteResultsPanel', () => {
  const mockOnResolve = vi.fn().mockResolvedValue(undefined);
  const mockOnBack = vi.fn();

  it('shows REPLACE_ITEM comparison with current and winning activities', () => {
    const session = makeSession({
      mode: 'REPLACE_ITEM',
      status: 'CLOSED',
      currentItem: {
        id: 'item-1',
        tripId: 'trip-1',
        dayIndex: 0,
        sortOrder: 1,
        startMinute: null,
        startTime: null,
        title: 'Current Activity',
        locationName: 'Old Location',
        locationAddress: null,
        placeId: null,
        lat: null,
        lng: null,
        shortNote: null,
        version: 1,
        progress: 'sap toi',
        proposalCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      options: [
        {
          id: 'opt-winner',
          voteSessionId: 'session-1',
          title: 'Better Activity',
          payload: {},
          status: 'WINNER',
          voteCount: 4,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    });

    render(
      <VoteResultsPanel
        session={session}
        isLeader={true}
        onResolve={mockOnResolve}
        onBack={mockOnBack}
      />,
    );

    expect(screen.getByText('Current Activity')).toBeInTheDocument();
    expect(screen.getByText('Hiện tại')).toBeInTheDocument();
    // "Better Activity" may appear in both the winner banner and detail chart
    const betterActivities = screen.getAllByText('Better Activity');
    expect(betterActivities.length).toBeGreaterThanOrEqual(1);
  });

  it('shows leader decision buttons for LEADER_DECISION_REQUIRED', () => {
    const session = makeSession({
      status: 'LEADER_DECISION_REQUIRED',
      tieBreakRound: 2,
      options: [
        {
          id: 'opt-a',
          voteSessionId: 'session-1',
          title: 'Tied A',
          payload: {},
          status: 'ACTIVE',
          voteCount: 2,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'opt-b',
          voteSessionId: 'session-1',
          title: 'Tied B',
          payload: {},
          status: 'ACTIVE',
          voteCount: 2,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    });

    render(
      <VoteResultsPanel
        session={session}
        isLeader={true}
        onResolve={mockOnResolve}
        onBack={mockOnBack}
      />,
    );

    expect(screen.getByText(/Hòa lần 2/)).toBeInTheDocument();
    const resolveButtons = screen.getAllByText('Chọn phương án này');
    expect(resolveButtons).toHaveLength(2);
  });
});
