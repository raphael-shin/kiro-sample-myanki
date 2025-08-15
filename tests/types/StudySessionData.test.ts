import { StudySessionData } from '@/types/flashcard';

describe('StudySessionData Interface', () => {
  it('should validate StudySessionData structure', () => {
    const sessionData: StudySessionData = {
      id: 'test-session-1',
      deckId: 1,
      startTime: new Date(),
      status: 'active',
      totalCards: 10,
      completedCards: 0,
      currentCardIndex: 0,
      correctAnswers: 0,
      totalResponseTime: 0,
      qualityScores: [],
      keyboardShortcuts: true,
      autoAdvance: false,
      pausedTime: 0
    };

    expect(sessionData.id).toBe('test-session-1');
    expect(sessionData.deckId).toBe(1);
    expect(sessionData.status).toBe('active');
    expect(sessionData.totalCards).toBe(10);
    expect(sessionData.completedCards).toBe(0);
    expect(sessionData.keyboardShortcuts).toBe(true);
    expect(sessionData.pausedTime).toBe(0);
  });

  it('should support all session status types', () => {
    const statuses: Array<StudySessionData['status']> = [
      'active', 'paused', 'completed', 'abandoned'
    ];

    statuses.forEach(status => {
      const sessionData: StudySessionData = {
        id: 'test',
        deckId: 1,
        startTime: new Date(),
        status,
        totalCards: 5,
        completedCards: 0,
        currentCardIndex: 0,
        correctAnswers: 0,
        totalResponseTime: 0,
        qualityScores: [],
        keyboardShortcuts: true,
        autoAdvance: false,
        pausedTime: 0
      };

      expect(sessionData.status).toBe(status);
    });
  });

  it('should support optional fields', () => {
    const sessionData: StudySessionData = {
      id: 'test-session-2',
      deckId: 2,
      userId: 'user-123',
      startTime: new Date(),
      endTime: new Date(),
      status: 'completed',
      totalCards: 20,
      completedCards: 20,
      currentCardIndex: 19,
      correctAnswers: 18,
      totalResponseTime: 3600,
      qualityScores: [3, 4, 2, 4],
      keyboardShortcuts: false,
      autoAdvance: true,
      pausedTime: 120
    };

    expect(sessionData.userId).toBe('user-123');
    expect(sessionData.endTime).toBeInstanceOf(Date);
    expect(sessionData.autoAdvance).toBe(true);
  });
});
