import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { AnchorHTMLAttributes, HTMLAttributes, PropsWithChildren, ReactNode } from 'react';

type MockMotionProps = PropsWithChildren<HTMLAttributes<HTMLElement> & Record<string, unknown>>;
type MockIconProps = Record<string, unknown>;
type MockLinkProps = PropsWithChildren<
  { href: string } & AnchorHTMLAttributes<HTMLAnchorElement> & Record<string, unknown>
>;
type MockMotionConfig = {
  initial?: unknown;
  animate?: unknown;
  exit?: unknown;
  transition?: unknown;
  whileHover?: unknown;
  whileTap?: unknown;
  layout?: unknown;
};

// Mock framer-motion
vi.mock('framer-motion', () => {
  const React = require('react') as typeof import('react');
  return {
    motion: new Proxy({}, {
      get: (_target: unknown, prop: string) => {
        return React.forwardRef<HTMLElement, MockMotionProps>(({ children, ...rest }, ref) => {
          const {
            initial, animate, exit, transition, whileHover, whileTap, layout,
            ...domProps
          } = rest as MockMotionProps & MockMotionConfig;
          return React.createElement(prop, { ...domProps, ref }, children as ReactNode);
        });
      },
    }),
    AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
  };
});

// Mock lucide-react
vi.mock('lucide-react', () => {
  const React = require('react');
  const icon = (name: string) => (props: MockIconProps) =>
    React.createElement('span', { 'data-testid': `icon-${name}`, ...props });
  return {
    MapPin: icon('MapPin'),
    Calendar: icon('Calendar'),
    Copy: icon('Copy'),
    Users: icon('Users'),
    Search: icon('Search'),
    Loader2: icon('Loader2'),
    BookOpen: icon('BookOpen'),
    Compass: icon('Compass'),
    X: icon('X'),
    Sparkles: icon('Sparkles'),
    ArrowLeft: icon('ArrowLeft'),
    Shield: icon('Shield'),
    AlertTriangle: icon('AlertTriangle'),
    Upload: icon('Upload'),
    Clock: icon('Clock'),
  };
});

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: MockLinkProps) => {
    const React = require('react') as typeof import('react');
    return React.createElement('a', { href, ...props }, children);
  },
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useParams: () => ({ templateId: 'template-1' }),
}));

// Mock api-client
vi.mock('../../lib/api-client', () => ({
  templatesApi: {
    list: vi.fn().mockResolvedValue([]),
    get: vi.fn().mockResolvedValue(null),
    getPublishedForTrip: vi.fn().mockResolvedValue(null),
    publish: vi.fn().mockResolvedValue({}),
    clone: vi.fn().mockResolvedValue({ tripId: 'new-trip', joinCode: 'NEW123' }),
  },
}));

import { TemplatePreviewCard } from '../TemplatePreviewCard';
import { PublishTemplateDialog } from '../PublishTemplateDialog';
import { CloneTemplateDialog } from '../CloneTemplateDialog';
import type { TemplateListing, CommunityTemplate } from '../../../lib/api-client';

const mockListing: TemplateListing = {
  id: 'template-1',
  title: 'Da Lat Mong Mo',
  destinationLabel: 'Da Lat',
  summary: 'A lovely trip to Da Lat',
  daysCount: 3,
  cloneCount: 42,
  createdAt: new Date().toISOString(),
  publishedBy: { id: 'user-1', name: 'Thanh', avatarUrl: null },
};

const mockTemplate: CommunityTemplate = {
  ...mockListing,
  sourceTripId: 'source-trip',
  publishedById: 'user-1',
  coverNote: 'Great tips inside',
  sanitizedSnapshot: {
    destination: 'Da Lat',
    days: [
      { dayIndex: 0, items: [{ title: 'Visit Market', startMinute: 480, locationName: 'Market', lat: 11.94, lng: 108.44, shortNote: null, sortOrder: 1 }] },
      { dayIndex: 1, items: [{ title: 'Hike', startMinute: 360, locationName: 'Mountain', lat: null, lng: null, shortNote: 'Bring water', sortOrder: 1 }] },
    ],
  },
  status: 'PUBLISHED',
  updatedAt: new Date().toISOString(),
};

describe('TemplatePreviewCard', () => {
  it('renders template listing with destination, day count, and clone count', () => {
    render(<TemplatePreviewCard template={mockListing} />);

    expect(screen.getByText('Da Lat Mong Mo')).toBeInTheDocument();
    expect(screen.getByText('Da Lat')).toBeInTheDocument();
    expect(screen.getByText(/3 ngày/)).toBeInTheDocument();
    expect(screen.getByText(/42 bản sao/)).toBeInTheDocument();
    expect(screen.getByText('Thanh')).toBeInTheDocument();
  });

  it('renders summary text when provided', () => {
    render(<TemplatePreviewCard template={mockListing} />);
    expect(screen.getByText('A lovely trip to Da Lat')).toBeInTheDocument();
  });
});

describe('PublishTemplateDialog', () => {
  it('shows privacy notice about personal data stripping', () => {
    render(
      <PublishTemplateDialog
        tripId="trip-1"
        tripName="My Trip"
        open={true}
        onClose={vi.fn()}
        publishedTemplate={null}
        onPublished={vi.fn()}
      />,
    );

    expect(screen.getByText('Du lieu ca nhan se duoc loai bo')).toBeInTheDocument();
  });

  it('shows publish button only when open', () => {
    const { rerender } = render(
      <PublishTemplateDialog
        tripId="trip-1"
        tripName="My Trip"
        open={false}
        onClose={vi.fn()}
        publishedTemplate={null}
        onPublished={vi.fn()}
      />,
    );

    expect(screen.queryByText('Xuất bản mẫu hành trình')).not.toBeInTheDocument();

    rerender(
      <PublishTemplateDialog
        tripId="trip-1"
        tripName="My Trip"
        open={true}
        onClose={vi.fn()}
        publishedTemplate={null}
        onPublished={vi.fn()}
      />,
    );

    expect(screen.getByText('Xuất bản mẫu hành trình')).toBeInTheDocument();
  });
});

describe('CloneTemplateDialog', () => {
  it('renders clone form with timeZone selector', () => {
    render(
      <CloneTemplateDialog
        template={mockTemplate}
        open={true}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByText('Clone hành trình')).toBeInTheDocument();
    // timeZone selector exists with timezone options
    expect(screen.getByText(/Asia\/Ho_Chi_Minh/)).toBeInTheDocument();
  });

  it('pre-fills name and destination from template', () => {
    render(
      <CloneTemplateDialog
        template={mockTemplate}
        open={true}
        onClose={vi.fn()}
      />,
    );

    const nameInput = screen.getByDisplayValue(/Da Lat Mong Mo — Bản sao/) as HTMLInputElement;
    expect(nameInput.value).toContain('Da Lat Mong Mo');

    const destInput = screen.getByDisplayValue('Da Lat') as HTMLInputElement;
    expect(destInput.value).toBe('Da Lat');
  });

  it('shows source template info', () => {
    render(
      <CloneTemplateDialog
        template={mockTemplate}
        open={true}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByText('Da Lat · 3 ngày')).toBeInTheDocument();
  });
});
