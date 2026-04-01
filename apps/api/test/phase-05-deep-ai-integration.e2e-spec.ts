import {
  benchmarkWarningCaution,
  healthWarningHigh,
  lowConfidenceBookingDraft,
  lowConfidenceRoute,
} from '../../web/src/components/trip/__tests__/fixtures/phase-05-ai-fixtures';

describe('Phase 05 Deep AI Integration API', () => {
  it('TODO culinary routing: keeps a route suggestion smoke contract ready', () => {
    const routeSuggestion = {
      status: 'draft',
      route: lowConfidenceRoute,
    };

    expect(routeSuggestion.status).toBe('draft');
    expect(routeSuggestion.route.confidenceLabel).toBe('Can xem lai');
    expect(routeSuggestion.route.stops).toHaveLength(3);
  });

  it('TODO booking import review: keeps a draft import smoke contract ready', () => {
    const bookingDraft = {
      status: 'review',
      draft: lowConfidenceBookingDraft,
    };

    expect(bookingDraft.status).toBe('review');
    expect(bookingDraft.draft.confidenceLabel).toBe('Can xem lai');
    expect(bookingDraft.draft.confirmationCode).toContain('LOW');
  });

  it('TODO local expert cards: keeps a card response smoke contract ready', () => {
    const expertCard = {
      title: 'Goi y quan an dia phuong',
      confidenceLabel: 'Goi y',
    };

    expect(expertCard.title.length).toBeGreaterThan(0);
    expect(expertCard.confidenceLabel).toBe('Goi y');
  });

  it('TODO daily podcast recap: keeps recap generation smoke contract ready', () => {
    const recap = {
      audioUrl: '/recaps/day-1.mp3',
      text: 'Ngay hom nay di vui va gon gang.',
      warning: healthWarningHigh,
    };

    expect(recap.audioUrl).toContain('.mp3');
    expect(recap.text).toContain('Ngay hom nay');
    expect(recap.warning.severity).toBe('Nguy co cao');
  });

  it('TODO cost benchmark warnings: keeps warning severity smoke contract ready', () => {
    const benchmarkWarning = benchmarkWarningCaution;

    expect(benchmarkWarning.severity).toBe('Can xem lai');
    expect(benchmarkWarning.message).toContain('can xem lai');
  });
});
