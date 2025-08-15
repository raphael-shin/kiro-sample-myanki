import { SpacedRepetitionCard, SM2_CONSTANTS } from '../../types/spaced-repetition';
import { StudyQuality } from '../../types/flashcard';
import { addDays } from '../../utils/date-utils';
import { calculateEaseFactor } from '../sm2-algorithm';

const HARD_MULTIPLIER = 1.2;
const EASY_MULTIPLIER = 1.3;
const MIN_INTERVAL_DAYS = 1;

export class SM2Algorithm {
  calculateNextReview(card: SpacedRepetitionCard, quality: StudyQuality): SpacedRepetitionCard {
    const now = new Date();
    
    if (quality === StudyQuality.AGAIN) {
      return this.handleAgainQuality(card, now);
    }

    if (quality === StudyQuality.HARD) {
      return this.handleHardQuality(card, now);
    }

    if (quality === StudyQuality.GOOD) {
      return this.handleGoodQuality(card, now);
    }

    if (quality === StudyQuality.EASY) {
      return this.handleEasyQuality(card, now);
    }

    // Placeholder for other qualities
    return {
      ...card,
      lastReviewDate: now,
      updatedAt: now
    };
  }

  private handleAgainQuality(card: SpacedRepetitionCard, now: Date): SpacedRepetitionCard {
    const againIntervalDays = 1;
    
    return this.createUpdatedCard(card, {
      interval: againIntervalDays,
      repetitions: 0,
      nextReviewDate: addDays(now, againIntervalDays),
      lastReviewDate: now,
      updatedAt: now
    });
  }

  private handleHardQuality(card: SpacedRepetitionCard, now: Date): SpacedRepetitionCard {
    const newEaseFactor = calculateEaseFactor(card.easeFactor, StudyQuality.HARD);
    const newInterval = this.enforceMinimumInterval(card.interval * HARD_MULTIPLIER);
    const newRepetitions = card.repetitions + 1;
    
    return this.createUpdatedCard(card, {
      easeFactor: newEaseFactor,
      interval: newInterval,
      repetitions: newRepetitions,
      nextReviewDate: addDays(now, newInterval),
      lastReviewDate: now,
      updatedAt: now
    });
  }

  private handleGoodQuality(card: SpacedRepetitionCard, now: Date): SpacedRepetitionCard {
    const newInterval = this.enforceMinimumInterval(card.interval * card.easeFactor);
    const newRepetitions = card.repetitions + 1;
    
    return this.createUpdatedCard(card, {
      interval: newInterval,
      repetitions: newRepetitions,
      nextReviewDate: addDays(now, newInterval),
      lastReviewDate: now,
      updatedAt: now
    });
  }

  private handleEasyQuality(card: SpacedRepetitionCard, now: Date): SpacedRepetitionCard {
    const newEaseFactor = calculateEaseFactor(card.easeFactor, StudyQuality.EASY);
    const newInterval = this.enforceMinimumInterval(card.interval * card.easeFactor * EASY_MULTIPLIER);
    const newRepetitions = card.repetitions + 1;
    
    return this.createUpdatedCard(card, {
      easeFactor: newEaseFactor,
      interval: newInterval,
      repetitions: newRepetitions,
      nextReviewDate: addDays(now, newInterval),
      lastReviewDate: now,
      updatedAt: now
    });
  }

  private createUpdatedCard(
    card: SpacedRepetitionCard, 
    updates: Partial<SpacedRepetitionCard>
  ): SpacedRepetitionCard {
    return { ...card, ...updates };
  }

  private enforceMinimumInterval(calculatedInterval: number): number {
    return Math.max(Math.round(calculatedInterval), MIN_INTERVAL_DAYS);
  }
}
