import { SM2Algorithm } from '../SM2Algorithm';
import { SpacedRepetitionCard } from '../../../types/spaced-repetition';
import { StudyQuality } from '../../../types/flashcard';

describe('SM2Algorithm - Easy Quality', () => {
  let algorithm: SM2Algorithm;

  beforeEach(() => {
    algorithm = new SM2Algorithm();
  });

  it('should multiply interval by 1.3 and apply ease factor when quality is EASY', () => {
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

    const result = algorithm.calculateNextReview(card, StudyQuality.EASY);

    expect(result.interval).toBe(13); // 4 * 2.5 * 1.3 = 13
    expect(result.repetitions).toBe(3); // incremented
  });

  it('should maintain ease factor when quality is EASY', () => {
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

    const result = algorithm.calculateNextReview(card, StudyQuality.EASY);

    expect(result.easeFactor).toBe(2.5); // EASY maintains EF in SM-2
  });
});
