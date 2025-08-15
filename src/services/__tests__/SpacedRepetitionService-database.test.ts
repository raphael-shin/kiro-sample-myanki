import { SpacedRepetitionService } from '../SpacedRepetitionService';
import { db } from '../../db/MyAnkiDB';

// Mock the database
jest.mock('../../db/MyAnkiDB', () => ({
  db: {
    spacedRepetitionData: {
      add: jest.fn(),
      get: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      where: jest.fn()
    }
  }
}));

describe('SpacedRepetitionService - Database Integration', () => {
  let service: SpacedRepetitionService;
  let mockDb: any;

  beforeEach(() => {
    service = new SpacedRepetitionService();
    mockDb = db.spacedRepetitionData;
    
    // Reset all mocks
    jest.clearAllMocks();
  });

  it('should use database for create operation', async () => {
    const cardData = {
      cardId: 1,
      easeFactor: 2.5,
      interval: 1,
      repetitions: 0,
      nextReviewDate: new Date(),
      lastReviewDate: new Date()
    };

    mockDb.add.mockResolvedValue(1);

    const result = await service.create(cardData);
    
    expect(mockDb.add).toHaveBeenCalledWith({
      ...cardData,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date)
    });
    expect(result).toBe(1);
  });

  it('should use database for getByCardId operation', async () => {
    const mockData = {
      cardId: 1,
      easeFactor: 2.5,
      interval: 1,
      repetitions: 0,
      nextReviewDate: new Date(),
      lastReviewDate: new Date()
    };

    mockDb.where.mockReturnValue({
      equals: jest.fn().mockReturnValue({
        first: jest.fn().mockResolvedValue(mockData)
      })
    });

    const result = await service.getByCardId(1);
    
    expect(mockDb.where).toHaveBeenCalledWith('cardId');
    expect(result).toEqual(mockData);
  });

  it('should use database for update operation', async () => {
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

  it('should use database for delete operation', async () => {
    mockDb.where.mockReturnValue({
      equals: jest.fn().mockReturnValue({
        delete: jest.fn().mockResolvedValue(1)
      })
    });

    await service.delete(1);
    
    expect(mockDb.where).toHaveBeenCalledWith('cardId');
  });

  it('should handle database errors properly', async () => {
    const cardData = {
      cardId: 1,
      easeFactor: 2.5,
      interval: 1,
      repetitions: 0,
      nextReviewDate: new Date(),
      lastReviewDate: new Date()
    };

    mockDb.add.mockRejectedValue(new Error('Database error'));

    await expect(service.create(cardData)).rejects.toThrow('Database error');
  });
});
