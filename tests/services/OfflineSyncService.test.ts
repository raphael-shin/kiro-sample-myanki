import { OfflineSyncService } from '@/services/OfflineSyncService';
import { db } from '@/db/MyAnkiDB';

// Mock the database
jest.mock('@/db/MyAnkiDB', () => ({
  db: {
    offlineQueue: {
      add: jest.fn(),
      toArray: jest.fn(),
      clear: jest.fn(),
    },
    transaction: jest.fn(),
  },
}));

describe('OfflineSyncService', () => {
  let service: OfflineSyncService;
  const mockDb = db as jest.Mocked<typeof db>;

  beforeEach(() => {
    service = new OfflineSyncService();
    jest.clearAllMocks();
  });

  describe('queueOfflineAction', () => {
    it('should queue offline action', async () => {
      const action = {
        type: 'CREATE_CARD' as const,
        data: { deckId: 1, front: 'Test', back: 'Answer' },
        timestamp: new Date(),
      };

      await service.queueOfflineAction(action);

      expect(mockDb.offlineQueue.add).toHaveBeenCalledWith(action);
    });
  });

  describe('getPendingActions', () => {
    it('should return pending offline actions', async () => {
      const mockActions = [
        { id: 1, type: 'CREATE_CARD', data: {}, timestamp: new Date() },
        { id: 2, type: 'UPDATE_CARD', data: {}, timestamp: new Date() },
      ];

      mockDb.offlineQueue.toArray.mockResolvedValue(mockActions);

      const result = await service.getPendingActions();

      expect(result).toEqual(mockActions);
      expect(mockDb.offlineQueue.toArray).toHaveBeenCalled();
    });
  });

  describe('syncPendingActions', () => {
    it('should process and clear pending actions', async () => {
      const mockActions = [
        { id: 1, type: 'CREATE_CARD', data: { deckId: 1, front: 'Test' }, timestamp: new Date() },
      ];

      mockDb.offlineQueue.toArray.mockResolvedValue(mockActions);
      mockDb.transaction.mockImplementation((mode, tables, callback) => 
        callback({} as any)
      );

      await service.syncPendingActions();

      expect(mockDb.offlineQueue.toArray).toHaveBeenCalled();
      expect(mockDb.offlineQueue.clear).toHaveBeenCalled();
    });

    it('should handle empty queue', async () => {
      mockDb.offlineQueue.toArray.mockResolvedValue([]);

      await service.syncPendingActions();

      expect(mockDb.offlineQueue.clear).not.toHaveBeenCalled();
    });
  });

  describe('hasPendingActions', () => {
    it('should return true when there are pending actions', async () => {
      mockDb.offlineQueue.count = jest.fn().mockResolvedValue(3);

      const result = await service.hasPendingActions();

      expect(result).toBe(true);
    });

    it('should return false when there are no pending actions', async () => {
      mockDb.offlineQueue.count = jest.fn().mockResolvedValue(0);

      const result = await service.hasPendingActions();

      expect(result).toBe(false);
    });
  });
});
