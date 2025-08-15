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
});
