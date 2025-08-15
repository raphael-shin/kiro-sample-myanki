import { ErrorCode, ErrorFactory } from '@/types/errors';

describe('Extended Error Types', () => {
  describe('Session Error Codes', () => {
    it('should include session-related error codes', () => {
      expect(ErrorCode.SESSION_NOT_FOUND).toBe('SESSION_NOT_FOUND');
      expect(ErrorCode.SESSION_ALREADY_ACTIVE).toBe('SESSION_ALREADY_ACTIVE');
      expect(ErrorCode.SESSION_PAUSED).toBe('SESSION_PAUSED');
      expect(ErrorCode.INVALID_SESSION_STATE).toBe('INVALID_SESSION_STATE');
    });
  });

  describe('Statistics Error Codes', () => {
    it('should include statistics-related error codes', () => {
      expect(ErrorCode.STATS_CALCULATION_FAILED).toBe('STATS_CALCULATION_FAILED');
      expect(ErrorCode.INVALID_TIME_RANGE).toBe('INVALID_TIME_RANGE');
      expect(ErrorCode.GOAL_UPDATE_FAILED).toBe('GOAL_UPDATE_FAILED');
    });
  });

  describe('Session Error Factory', () => {
    it('should create session not found error', () => {
      const sessionId = 'test-session-123';
      const error = ErrorFactory.session.notFound(sessionId);
      
      expect(error.code).toBe(ErrorCode.SESSION_NOT_FOUND);
      expect(error.message).toContain(sessionId);
      expect(error.details?.sessionId).toBe(sessionId);
    });

    it('should create session already active error', () => {
      const deckId = 42;
      const error = ErrorFactory.session.alreadyActive(deckId);
      
      expect(error.code).toBe(ErrorCode.SESSION_ALREADY_ACTIVE);
      expect(error.message).toContain(deckId.toString());
      expect(error.details?.deckId).toBe(deckId);
    });

    it('should create invalid session state error', () => {
      const currentState = 'paused';
      const expectedState = 'active';
      const error = ErrorFactory.session.invalidState(currentState, expectedState);
      
      expect(error.code).toBe(ErrorCode.INVALID_SESSION_STATE);
      expect(error.message).toContain(currentState);
      expect(error.message).toContain(expectedState);
      expect(error.details?.currentState).toBe(currentState);
      expect(error.details?.expectedState).toBe(expectedState);
    });
  });

  describe('Statistics Error Factory', () => {
    it('should create statistics calculation failed error', () => {
      const operation = 'calculateDeckStats';
      const originalError = new Error('Database connection failed');
      const error = ErrorFactory.statistics.calculationFailed(operation, originalError);
      
      expect(error.code).toBe(ErrorCode.STATS_CALCULATION_FAILED);
      expect(error.message).toContain(operation);
      expect(error.details?.operation).toBe(operation);
      expect(error.details?.originalError).toBe(originalError.message);
    });

    it('should create invalid time range error', () => {
      const timeRange = 'invalid-range';
      const error = ErrorFactory.statistics.invalidTimeRange(timeRange);
      
      expect(error.code).toBe(ErrorCode.INVALID_TIME_RANGE);
      expect(error.message).toContain(timeRange);
      expect(error.details?.timeRange).toBe(timeRange);
    });
  });
});
