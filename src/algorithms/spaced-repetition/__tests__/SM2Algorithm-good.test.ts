import { SM2Algorithm } from '../SM2Algorithm';
import { SpacedRepetitionCard } from '../../../types/spaced-repetition';
import { StudyQuality } from '../../../types/flashcard';

describe('SM2Algorithm - Good Quality', () => {
  let algorithm: SM2Algorithm;

  beforeEach(() => {
    algorithm = new SM2Algorithm();
  });

  it('should apply ease factor to interval when quality is GOOD', () => {
    const card: SpacedRepetitionCard = {
      cardId: 1,
      easeFactor: 2.5,
      interval: 4,
      repetitions: 2,
      nextReviewDate: new Date(),
      lastReviewDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = algorithm.calculateNextReview(card, StudyQuality.GOOD);

    expect(result.interval).toBe(10); // 4 * 2.5 = 10
    expect(result.repetitions).toBe(3); // incremented
  });

  it('should maintain ease factor when quality is GOOD', () => {
    const card: SpacedRepetitionCard = {
      cardId: 1,
      easeFactor: 2.5,
      interval: 4,
      repetitions: 2,
      nextReviewDate: new Date(),
      lastReviewDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = algorithm.calculateNextReview(card, StudyQuality.GOOD);

    expect(result.easeFactor).toBe(2.5); // unchanged for GOOD
  });
});
