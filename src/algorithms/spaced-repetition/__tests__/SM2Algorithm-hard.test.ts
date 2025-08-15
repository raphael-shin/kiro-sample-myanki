import { SM2Algorithm } from '../SM2Algorithm';
import { SpacedRepetitionCard } from '../../../types/spaced-repetition';
import { StudyQuality } from '../../../types/flashcard';

describe('SM2Algorithm - Hard Quality', () => {
  let algorithm: SM2Algorithm;

  beforeEach(() => {
    algorithm = new SM2Algorithm();
  });

  it('should multiply interval by 1.2 when quality is HARD', () => {
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

    const result = algorithm.calculateNextReview(card, StudyQuality.HARD);

    expect(result.interval).toBe(6); // 5 * 1.2 = 6
    expect(result.repetitions).toBe(3); // incremented
  });

  it('should decrease ease factor when quality is HARD', () => {
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

    const result = algorithm.calculateNextReview(card, StudyQuality.HARD);

    expect(result.easeFactor).toBeLessThan(2.5);
  });
});
