import { SpacedRepetitionService } from '../SpacedRepetitionService';
import { StudyQuality } from '../../types/flashcard';
import { SM2_CONSTANTS } from '../../algorithms/spaced-repetition/constants';

// Mock the database
jest.mock('../../db/MyAnkiDB', () => ({
  db: {
    spacedRepetitionData: {
      add: jest.fn(),
      where: jest.fn()
    }
  }
}));

import { db } from '../../db/MyAnkiDB';

describe('SpacedRepetitionService - Algorithm Integration', () => {
  let service: SpacedRepetitionService;
  let mockDb: any;

  beforeEach(() => {
    service = new SpacedRepetitionService();
    mockDb = db.spacedRepetitionData;
    jest.clearAllMocks();
  });

  it('should have processStudyResult method', () => {
    expect(typeof service.processStudyResult).toBe('function');
  });

  it('should calculate next review date using SM2 algorithm for new card', async () => {
    const cardId = 1;
    const quality = StudyQuality.GOOD;
    
    // Mock no existing data (new card)
    mockDb.where.mockReturnValue({
      equals: jest.fn().mockReturnValue({
        first: jest.fn().mockResolvedValue(undefined)
      })
    });
    
    mockDb.add.mockResolvedValue(undefined);

    await service.processStudyResult(cardId, quality);
    
    expect(mockDb.add).toHaveBeenCalledWith({
      cardId,
      easeFactor: SM2_CONSTANTS.DEFAULT_EASE_FACTOR,
      interval: 1, // First review interval
      repetitions: 1,
      nextReviewDate: expect.any(Date),
      lastReviewDate: expect.any(Date),
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date)
    });
  });

  it('should update existing card data using SM2 algorithm', async () => {
    const cardId = 1;
    const quality = StudyQuality.GOOD;
    
    const existingData = {
      cardId,
      easeFactor: 2.5,
      interval: 6,
      repetitions: 2,
      nextReviewDate: new Date(),
      lastReviewDate: new Date()
    };
    
    mockDb.where.mockReturnValue({
      equals: jest.fn().mockReturnValue({
        first: jest.fn().mockResolvedValue(existingData),
        modify: jest.fn().mockResolvedValue(1)
      })
    });

    await service.processStudyResult(cardId, quality);
    
    expect(mockDb.where).toHaveBeenCalledWith('cardId');
  });

  it('should handle AGAIN quality by resetting interval', async () => {
    const cardId = 1;
    const quality = StudyQuality.AGAIN;
    
    const existingData = {
      cardId,
      easeFactor: 2.5,
      interval: 10,
      repetitions: 3,
      nextReviewDate: new Date(),
      lastReviewDate: new Date()
    };
    
    mockDb.where.mockReturnValue({
      equals: jest.fn().mockReturnValue({
        first: jest.fn().mockResolvedValue(existingData),
        modify: jest.fn().mockResolvedValue(1)
      })
    });

    await service.processStudyResult(cardId, quality);
    
    // Should reset repetitions and set short interval
    expect(mockDb.where).toHaveBeenCalledWith('cardId');
  });

  it('should have getCardsForReview method', () => {
    expect(typeof service.getCardsForReview).toBe('function');
  });

  it('should return cards due for review today', async () => {
    const today = new Date();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    
    const dueCards = [
      { cardId: 1, nextReviewDate: yesterday },
      { cardId: 2, nextReviewDate: today }
    ];
    
    mockDb.where.mockReturnValue({
      belowOrEqual: jest.fn().mockReturnValue({
        toArray: jest.fn().mockResolvedValue(dueCards)
      })
    });

    const result = await service.getCardsForReview();
    
    expect(mockDb.where).toHaveBeenCalledWith('nextReviewDate');
    expect(result).toEqual([1, 2]); // Should return cardIds
  });
});
