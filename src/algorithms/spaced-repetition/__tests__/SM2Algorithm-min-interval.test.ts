import { SM2Algorithm } from '../SM2Algorithm';
import { SpacedRepetitionCard } from '../../../types/spaced-repetition';
import { StudyQuality } from '../../../types/flashcard';

describe('SM2Algorithm - Minimum Interval Logic', () => {
  let algorithm: SM2Algorithm;

  beforeEach(() => {
    algorithm = new SM2Algorithm();
  });

  it('should enforce minimum interval of 1 day when HARD calculation results in less than 1', () => {
    const card: SpacedRepetitionCard = {
      cardId: 1,
      easeFactor: 1.3,
      interval: 0.4, // 0.4 * 1.2 = 0.48, Math.round = 0, should be enforced to 1
      repetitions: 1,
      nextReviewDate: new Date(),
      lastReviewDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = algorithm.calculateNextReview(card, StudyQuality.HARD);

    expect(result.interval).toBe(1); // Should be enforced to 1, not 0
  });

  it('should enforce minimum interval of 1 day when GOOD calculation results in less than 1', () => {
    const card: SpacedRepetitionCard = {
      cardId: 1,
      easeFactor: 1.3,
      interval: 0.7, // 0.7 * 1.3 = 0.91, should be enforced to 1
      repetitions: 1,
      nextReviewDate: new Date(),
      lastReviewDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = algorithm.calculateNextReview(card, StudyQuality.GOOD);

    expect(result.interval).toBe(1); // Should be exactly 1, not 0.91
  });
});
