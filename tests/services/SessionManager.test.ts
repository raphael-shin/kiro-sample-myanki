import { SessionManager } from '@/services/SessionManager';
import { StudySessionData } from '@/types/flashcard';
import { ErrorCode } from '@/types/errors';

// Mock IndexedDB
import 'fake-indexeddb/auto';

describe('SessionManager', () => {
  let sessionManager: SessionManager;

  beforeEach(() => {
    sessionManager = new SessionManager();
  });

  describe('createSession', () => {
    it('should create a new session and return session ID', async () => {
      const deckId = 1;
      const sessionId = await sessionManager.createSession(deckId);
      
      expect(sessionId).toBeDefined();
      expect(typeof sessionId).toBe('string');
      expect(sessionId.length).toBeGreaterThan(0);
    });

    it('should create session with correct initial data', async () => {
      const deckId = 1;
      const sessionId = await sessionManager.createSession(deckId);
      const sessionData = await sessionManager.getSessionData(sessionId);
      
      expect(sessionData.id).toBe(sessionId);
      expect(sessionData.deckId).toBe(deckId);
      expect(sessionData.status).toBe('active');
      expect(sessionData.totalCards).toBe(0);
      expect(sessionData.completedCards).toBe(0);
      expect(sessionData.currentCardIndex).toBe(0);
      expect(sessionData.correctAnswers).toBe(0);
      expect(sessionData.totalResponseTime).toBe(0);
      expect(sessionData.qualityScores).toEqual([]);
      expect(sessionData.keyboardShortcuts).toBe(true);
      expect(sessionData.autoAdvance).toBe(false);
      expect(sessionData.pausedTime).toBe(0);
    });
  });

  describe('getSessionData', () => {
    it('should return session data for existing session', async () => {
      const deckId = 1;
      const sessionId = await sessionManager.createSession(deckId);
      const sessionData = await sessionManager.getSessionData(sessionId);
      
      expect(sessionData).toBeDefined();
      expect(sessionData.id).toBe(sessionId);
      expect(sessionData.deckId).toBe(deckId);
    });

    it('should throw error for non-existent session', async () => {
      const nonExistentId = 'non-existent-session';
      
      await expect(sessionManager.getSessionData(nonExistentId))
        .rejects
        .toThrow();
    });
  });

  describe('updateSession', () => {
    it('should update session data successfully', async () => {
      const deckId = 1;
      const sessionId = await sessionManager.createSession(deckId);
      
      const updates: Partial<StudySessionData> = {
        completedCards: 5,
        correctAnswers: 4,
        totalResponseTime: 30000
      };
      
      await sessionManager.updateSession(sessionId, updates);
      const updatedData = await sessionManager.getSessionData(sessionId);
      
      expect(updatedData.completedCards).toBe(5);
      expect(updatedData.correctAnswers).toBe(4);
      expect(updatedData.totalResponseTime).toBe(30000);
    });

    it('should throw error when updating non-existent session', async () => {
      const nonExistentId = 'non-existent-session';
      const updates = { completedCards: 1 };
      
      await expect(sessionManager.updateSession(nonExistentId, updates))
        .rejects
        .toThrow();
    });
  });

  describe('deleteSession', () => {
    it('should delete session successfully', async () => {
      const deckId = 1;
      const sessionId = await sessionManager.createSession(deckId);
      
      await sessionManager.deleteSession(sessionId);
      
      await expect(sessionManager.getSessionData(sessionId))
        .rejects
        .toThrow();
    });

    it('should throw error when deleting non-existent session', async () => {
      const nonExistentId = 'non-existent-session';
      
      await expect(sessionManager.deleteSession(nonExistentId))
        .rejects
        .toThrow();
    });
  });

  describe('pauseSession', () => {
    it('should pause active session', async () => {
      const deckId = 1;
      const sessionId = await sessionManager.createSession(deckId);
      
      await sessionManager.pauseSession(sessionId);
      const sessionData = await sessionManager.getSessionData(sessionId);
      
      expect(sessionData.status).toBe('paused');
    });

    it('should throw error when pausing non-existent session', async () => {
      const nonExistentId = 'non-existent-session';
      
      await expect(sessionManager.pauseSession(nonExistentId))
        .rejects
        .toThrow();
    });

    it('should throw error when pausing already paused session', async () => {
      const deckId = 1;
      const sessionId = await sessionManager.createSession(deckId);
      
      await sessionManager.pauseSession(sessionId);
      
      await expect(sessionManager.pauseSession(sessionId))
        .rejects
        .toThrow();
    });
  });

  describe('resumeSession', () => {
    it('should resume paused session', async () => {
      const deckId = 1;
      const sessionId = await sessionManager.createSession(deckId);
      
      await sessionManager.pauseSession(sessionId);
      await sessionManager.resumeSession(sessionId);
      
      const sessionData = await sessionManager.getSessionData(sessionId);
      expect(sessionData.status).toBe('active');
    });

    it('should throw error when resuming non-existent session', async () => {
      const nonExistentId = 'non-existent-session';
      
      await expect(sessionManager.resumeSession(nonExistentId))
        .rejects
        .toThrow();
    });

    it('should throw error when resuming already active session', async () => {
      const deckId = 1;
      const sessionId = await sessionManager.createSession(deckId);
      
      await expect(sessionManager.resumeSession(sessionId))
        .rejects
        .toThrow();
    });
  });

  describe('isSessionActive', () => {
    it('should return true for active session', async () => {
      const deckId = 1;
      const sessionId = await sessionManager.createSession(deckId);
      
      const isActive = await sessionManager.isSessionActive(sessionId);
      expect(isActive).toBe(true);
    });

    it('should return false for paused session', async () => {
      const deckId = 1;
      const sessionId = await sessionManager.createSession(deckId);
      
      await sessionManager.pauseSession(sessionId);
      const isActive = await sessionManager.isSessionActive(sessionId);
      expect(isActive).toBe(false);
    });

    it('should throw error for non-existent session', async () => {
      const nonExistentId = 'non-existent-session';
      
      await expect(sessionManager.isSessionActive(nonExistentId))
        .rejects
        .toThrow();
    });
  });

  describe('getSessionProgress', () => {
    it('should calculate session progress correctly', async () => {
      const deckId = 1;
      const sessionId = await sessionManager.createSession(deckId);
      
      await sessionManager.updateSession(sessionId, {
        totalCards: 10,
        completedCards: 3
      });
      
      const progress = await sessionManager.getSessionProgress(sessionId);
      
      expect(progress.totalCards).toBe(10);
      expect(progress.completedCards).toBe(3);
      expect(progress.percentage).toBe(30);
      expect(progress.remainingCards).toBe(7);
    });

    it('should handle zero total cards', async () => {
      const deckId = 1;
      const sessionId = await sessionManager.createSession(deckId);
      
      const progress = await sessionManager.getSessionProgress(sessionId);
      
      expect(progress.totalCards).toBe(0);
      expect(progress.completedCards).toBe(0);
      expect(progress.percentage).toBe(0);
      expect(progress.remainingCards).toBe(0);
    });
  });

  describe('getEstimatedTimeRemaining', () => {
    it('should calculate estimated time remaining', async () => {
      const deckId = 1;
      const sessionId = await sessionManager.createSession(deckId);
      
      const startTime = new Date();
      await sessionManager.updateSession(sessionId, {
        startTime,
        totalCards: 10,
        completedCards: 2,
        totalResponseTime: 20000 // 20초
      });
      
      const estimatedTime = await sessionManager.getEstimatedTimeRemaining(sessionId);
      
      expect(estimatedTime).toBeGreaterThan(0);
      expect(estimatedTime).toBe(80000); // 8 remaining cards * 10 seconds average
    });

    it('should return 0 when no cards completed', async () => {
      const deckId = 1;
      const sessionId = await sessionManager.createSession(deckId);
      
      await sessionManager.updateSession(sessionId, {
        totalCards: 10,
        completedCards: 0
      });
      
      const estimatedTime = await sessionManager.getEstimatedTimeRemaining(sessionId);
      expect(estimatedTime).toBe(0);
    });

    it('should return 0 when all cards completed', async () => {
      const deckId = 1;
      const sessionId = await sessionManager.createSession(deckId);
      
      await sessionManager.updateSession(sessionId, {
        totalCards: 5,
        completedCards: 5
      });
      
      const estimatedTime = await sessionManager.getEstimatedTimeRemaining(sessionId);
      expect(estimatedTime).toBe(0);
    });
  });

  describe('getSessionSummary', () => {
    it('should generate session summary', async () => {
      const deckId = 1;
      const sessionId = await sessionManager.createSession(deckId);
      
      const startTime = new Date();
      const endTime = new Date(startTime.getTime() + 300000); // 5 minutes later
      
      await sessionManager.updateSession(sessionId, {
        startTime,
        endTime,
        totalCards: 10,
        completedCards: 10,
        correctAnswers: 8,
        totalResponseTime: 180000, // 3 minutes
        qualityScores: [3, 4, 2, 4, 3, 3, 4, 2, 3, 4]
      });
      
      const summary = await sessionManager.getSessionSummary(sessionId);
      
      expect(summary.cardsStudied).toBe(10);
      expect(summary.totalTime).toBe(300000);
      expect(summary.averageQuality).toBe(3.2);
      expect(summary.correctAnswers).toBe(8);
      expect(summary.sessionDate).toEqual(startTime);
    });
  });
});
