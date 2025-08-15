import { SpacedRepetitionService } from '../SpacedRepetitionService';
import { SpacedRepetitionCard } from '../../types/spaced-repetition';

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

describe('SpacedRepetitionService - CRUD Operations', () => {
  let service: SpacedRepetitionService;
  let mockDb: any;

  beforeEach(() => {
    service = new SpacedRepetitionService();
    mockDb = db.spacedRepetitionData;
    jest.clearAllMocks();
  });

  it('should create new spaced repetition data', async () => {
    const cardData = {
      cardId: 1,
      easeFactor: 2.5,
      interval: 1,
      repetitions: 0,
      nextReviewDate: new Date(),
      lastReviewDate: new Date()
    };

    mockDb.add.mockResolvedValue(undefined);

    const result = await service.create(cardData);
    
    expect(result).toBe(1); // Should return cardId
    expect(mockDb.add).toHaveBeenCalledWith({
      ...cardData,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date)
    });
  });

  it('should retrieve spaced repetition data by cardId', async () => {
    const cardData = {
      cardId: 1,
      easeFactor: 2.5,
      interval: 1,
      repetitions: 0,
      nextReviewDate: new Date(),
      lastReviewDate: new Date()
    };

    mockDb.where.mockReturnValue({
      equals: jest.fn().mockReturnValue({
        first: jest.fn().mockResolvedValue(cardData)
      })
    });

    const retrieved = await service.getByCardId(1);

    expect(retrieved).toBeDefined();
    expect(retrieved?.cardId).toBe(1);
    expect(retrieved?.easeFactor).toBe(2.5);
  });

  it('should update spaced repetition data', async () => {
    const updates = {
      easeFactor: 2.6,
      interval: 2,
      repetitions: 1
    };
    
    mockDb.where.mockReturnValue({
      equals: jest.fn().mockReturnValue({
        modify: jest.fn().mockResolvedValue(1)
      })
    });
    
    await service.update(1, updates);
    
    expect(mockDb.where).toHaveBeenCalledWith('cardId');
  });

  it('should delete spaced repetition data', async () => {
    mockDb.where.mockReturnValue({
      equals: jest.fn().mockReturnValue({
        delete: jest.fn().mockResolvedValue(1)
      })
    });

    await service.delete(1);
    
    expect(mockDb.where).toHaveBeenCalledWith('cardId');
  });
});
