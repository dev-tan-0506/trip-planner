import { describe, expect, it } from 'vitest';
import {
  benchmarkWarningCaution,
  healthWarningHigh,
  lowConfidenceBookingDraft,
  lowConfidenceRoute,
} from './fixtures/phase-05-ai-fixtures';

describe('Phase 5 AI workspace', () => {
  it('TODO culinary routing: keeps culinary routing smoke coverage ready', () => {
    const aiWorkspaceCard = {
      section: 'culinary routing',
      actionLabel: 'Goi y lo trinh',
      route: lowConfidenceRoute,
    };

    expect(aiWorkspaceCard.section).toBe('culinary routing');
    expect(aiWorkspaceCard.actionLabel).toContain('Goi y');
    expect(aiWorkspaceCard.route.confidenceLabel).toBe('Can xem lai');
  });

  it('TODO booking import review: keeps booking import smoke coverage ready', () => {
    const reviewSheet = {
      section: 'booking import',
      statusLabel: 'Ban nhap can duyet',
      draft: lowConfidenceBookingDraft,
    };

    expect(reviewSheet.section).toBe('booking import');
    expect(reviewSheet.statusLabel).toContain('duyet');
    expect(reviewSheet.draft.fieldsNeedingReview).toContain('gio bay');
  });

  it('TODO local expert cards: keeps local expert smoke coverage ready', () => {
    const localExpertCard = {
      section: 'local expert',
      title: 'Mon nen thu',
      cta: 'Xem them',
    };

    expect(localExpertCard.section).toBe('local expert');
    expect(localExpertCard.title.length).toBeGreaterThan(0);
    expect(localExpertCard.cta).toBe('Xem them');
  });

  it('TODO daily podcast recap: keeps daily podcast smoke coverage ready', () => {
    const podcastRecap = {
      section: 'daily podcast',
      durationLabel: '90 giay',
      textPreview: 'Hom nay di duoc 4 diem an.',
      healthWarning: healthWarningHigh,
    };

    expect(podcastRecap.section).toBe('daily podcast');
    expect(podcastRecap.durationLabel).toContain('giay');
    expect(podcastRecap.textPreview).toContain('Hom nay');
    expect(podcastRecap.healthWarning.severity).toBe('Nguy co cao');
  });

  it('TODO cost benchmark warnings: keeps cost benchmark smoke coverage ready', () => {
    const costBenchmark = {
      section: 'cost benchmark',
      warning: benchmarkWarningCaution,
    };

    expect(costBenchmark.section).toBe('cost benchmark');
    expect(costBenchmark.warning.severity).toBe('Can xem lai');
    expect(costBenchmark.warning.message).toContain('Chi phi');
  });
});
