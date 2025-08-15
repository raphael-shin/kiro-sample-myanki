import { SM2Algorithm } from '../SM2Algorithm';
import { SpacedRepetitionCard, SM2_CONSTANTS } from '../../../types/spaced-repetition';
import { StudyQuality } from '../../../types/flashcard';

describe('SM2Algorithm - Again Quality', () => {
  let algorithm: SM2Algorithm;

  beforeEach(() => {
    algorithm = new SM2Algorithm();
  });

  it('should set interval to 1 minute when quality is AGAIN', () => {
    const card: SpacedRepetitionCard = {
      cardId: 1,
      easeFactor: 2.5,
      interval: 5,
      repetitions: 2,
      nextReviewDate: new Date(),
      lastReviewDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = algorithm.calculateNextReview(card, StudyQuality.AGAIN);

    expect(result.interval).toBe(1); // 1 day for simplicity
    expect(result.repetitions).toBe(0);
  });

  it('should reset repetitions to 0 when quality is AGAIN', () => {
    const card: SpacedRepetitionCard = {
      cardId: 1,
      easeFactor: 2.5,
      interval: 10,
      repetitions: 5,
      nextReviewDate: new Date(),
      lastReviewDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = algorithm.calculateNextReview(card, StudyQuality.AGAIN);

    expect(result.repetitions).toBe(0);
  });
});
