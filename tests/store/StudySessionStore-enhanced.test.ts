import { useStudySessionStore, setSessionManager } from '@/store/StudySessionStore';
import { ISessionManager } from '@/services/SessionManager';

describe('StudySessionStore - Enhanced Features', () => {
  let mockSessionManager: jest.Mocked<ISessionManager>;

  beforeEach(() => {
    useStudySessionStore.getState().reset?.();
    
    // Create mock SessionManager
    mockSessionManager = {
      createSession: jest.fn().mockResolvedValue({
        id: 'test-session-1',
        deckId: 1,
        startTime: new Date(),
        status: 'active',
        totalCards: 0,
        completedCards: 0,
        currentCardIndex: 0,
        correctAnswers: 0,
        totalResponseTime: 0,
        qualityScores: [],
        keyboardShortcuts: true,
        autoAdvance: false,
        pausedTime: 0
      }),
      getSessionData: jest.fn(),
      updateSession: jest.fn(),
      deleteSession: jest.fn(),
      pauseSession: jest.fn(),
      resumeSession: jest.fn(),
      isSessionActive: jest.fn(),
      getSessionProgress: jest.fn(),
      getEstimatedTimeRemaining: jest.fn().mockResolvedValue(300000),
      getSessionSummary: jest.fn()
    } as any;
    
    setSessionManager(mockSessionManager);
  });

  afterEach(() => {
    jest.clearAllMocks();
    setSessionManager(null as any);
  });

  describe('Enhanced State Management', () => {
    it('should initialize with enhanced state properties', () => {
      const state = useStudySessionStore.getState();
      
      expect(state.sessionId).toBeNull();
      expect(state.sessionStartTime).toBeNull();
      expect(state.isPaused).toBe(false);
      expect(state.showAnswer).toBe(false);
      expect(state.answerStartTime).toBeNull();
      expect(state.keyboardShortcutsEnabled).toBe(true);
    });

    it('should update session state when starting session', async () => {
      const { startSession } = useStudySessionStore.getState();
      
      await startSession(1);
      
      const state = useStudySessionStore.getState();
      expect(state.sessionId).toBe('test-session-1');
      expect(state.sessionStartTime).toBeInstanceOf(Date);
      expect(state.isActive).toBe(true);
      expect(state.isPaused).toBe(false);
    });

    it('should clear enhanced state when ending session', () => {
      const { startSession, endSession } = useStudySessionStore.getState();
      
      // First start a session
      startSession(1);
      
      // Then end it
      endSession();
      
      const state = useStudySessionStore.getState();
      expect(state.sessionId).toBeNull();
      expect(state.sessionStartTime).toBeNull();
      expect(state.isActive).toBe(false);
      expect(state.isPaused).toBe(false);
      expect(state.showAnswer).toBe(false);
      expect(state.answerStartTime).toBeNull();
    });
  });

  describe('Session Control Actions', () => {
    it('should pause active session', async () => {
      const { startSession, pauseSession } = useStudySessionStore.getState();
      
      await startSession(1);
      await pauseSession();
      
      const state = useStudySessionStore.getState();
      expect(state.isPaused).toBe(true);
      expect(mockSessionManager.pauseSession).toHaveBeenCalledWith('test-session-1');
    });

    it('should resume paused session', async () => {
      const { startSession, pauseSession, resumeSession } = useStudySessionStore.getState();
      
      await startSession(1);
      await pauseSession();
      await resumeSession();
      
      const state = useStudySessionStore.getState();
      expect(state.isPaused).toBe(false);
      expect(mockSessionManager.resumeSession).toHaveBeenCalledWith('test-session-1');
    });

    it('should show card answer', () => {
      const { showCardAnswer } = useStudySessionStore.getState();
      
      showCardAnswer();
      
      const state = useStudySessionStore.getState();
      expect(state.showAnswer).toBe(true);
    });

    it('should handle pause session error', async () => {
      const { startSession, pauseSession } = useStudySessionStore.getState();
      
      mockSessionManager.pauseSession.mockRejectedValue(new Error('Pause failed'));
      
      await startSession(1);
      await pauseSession();
      
      const state = useStudySessionStore.getState();
      expect(state.error).toBe('Pause failed');
    });

    it('should handle resume session error', async () => {
      const { startSession, pauseSession, resumeSession } = useStudySessionStore.getState();
      
      mockSessionManager.resumeSession.mockRejectedValue(new Error('Resume failed'));
      
      await startSession(1);
      await pauseSession();
      await resumeSession();
      
      const state = useStudySessionStore.getState();
      expect(state.error).toBe('Resume failed');
    });

    it('should not pause when no active session', async () => {
      const { pauseSession } = useStudySessionStore.getState();
      
      await pauseSession();
      
      expect(mockSessionManager.pauseSession).not.toHaveBeenCalled();
    });

    it('should not resume when no active session', async () => {
      const { resumeSession } = useStudySessionStore.getState();
      
      await resumeSession();
      
      expect(mockSessionManager.resumeSession).not.toHaveBeenCalled();
    });
  });

  describe('Progress Tracking', () => {
    it('should calculate estimated time remaining', () => {
      const { getEstimatedTimeRemaining } = useStudySessionStore.getState();
      
      // Set up some session stats
      useStudySessionStore.setState({
        sessionStats: {
          cardsStudied: 5,
          correctAnswers: 4,
          totalTime: 50000 // 50 seconds
        },
        studyQueue: [
          { id: 1, deckId: 1, front: 'Card 1', back: 'Back 1' },
          { id: 2, deckId: 1, front: 'Card 2', back: 'Back 2' }
        ]
      });
      
      const estimatedTime = getEstimatedTimeRemaining();
      
      // Average time per card: 50000ms / 5 cards = 10000ms per card
      // Remaining cards: 2
      // Expected: 10000ms * 2 = 20000ms
      expect(estimatedTime).toBe(20000);
    });

    it('should return 0 when no cards studied', () => {
      const { getEstimatedTimeRemaining } = useStudySessionStore.getState();
      
      const estimatedTime = getEstimatedTimeRemaining();
      expect(estimatedTime).toBe(0);
    });

    it('should return 0 when no remaining cards', () => {
      const { getEstimatedTimeRemaining } = useStudySessionStore.getState();
      
      // Set up session stats with no remaining cards
      useStudySessionStore.setState({
        sessionStats: {
          cardsStudied: 5,
          correctAnswers: 4,
          totalTime: 50000
        },
        studyQueue: [] // No remaining cards
      });
      
      const estimatedTime = getEstimatedTimeRemaining();
      expect(estimatedTime).toBe(0);
    });

    it('should calculate progress correctly', () => {
      const { getProgress } = useStudySessionStore.getState();
      
      useStudySessionStore.setState({
        sessionStats: {
          cardsStudied: 3,
          correctAnswers: 2,
          totalTime: 30000
        },
        studyQueue: [
          { id: 4, deckId: 1, front: 'Card 4', back: 'Back 4' },
          { id: 5, deckId: 1, front: 'Card 5', back: 'Back 5' }
        ]
      });
      
      const progress = getProgress();
      
      expect(progress.totalCards).toBe(5); // 3 studied + 2 remaining
      expect(progress.cardsRemaining).toBe(2);
      expect(progress.percentage).toBe(60); // 3/5 * 100 = 60%
    });
  });

  describe('Keyboard Shortcuts', () => {
    it('should enable keyboard shortcuts', () => {
      const { enableKeyboardShortcuts } = useStudySessionStore.getState();
      
      enableKeyboardShortcuts(true);
      
      const state = useStudySessionStore.getState();
      expect(state.keyboardShortcutsEnabled).toBe(true);
    });

    it('should disable keyboard shortcuts', () => {
      const { enableKeyboardShortcuts } = useStudySessionStore.getState();
      
      enableKeyboardShortcuts(false);
      
      const state = useStudySessionStore.getState();
      expect(state.keyboardShortcutsEnabled).toBe(false);
    });

    it('should toggle keyboard shortcuts', () => {
      const { enableKeyboardShortcuts } = useStudySessionStore.getState();
      
      // Initially enabled
      expect(useStudySessionStore.getState().keyboardShortcutsEnabled).toBe(true);
      
      // Disable
      enableKeyboardShortcuts(false);
      expect(useStudySessionStore.getState().keyboardShortcutsEnabled).toBe(false);
      
      // Enable again
      enableKeyboardShortcuts(true);
      expect(useStudySessionStore.getState().keyboardShortcutsEnabled).toBe(true);
    });
  });

  describe('Next Card Behavior', () => {
    it('should set answer start time when moving to next card', () => {
      const { nextCard } = useStudySessionStore.getState();
      
      // Set up study queue
      useStudySessionStore.setState({
        studyQueue: [
          { id: 1, deckId: 1, front: 'Card 1', back: 'Back 1' },
          { id: 2, deckId: 1, front: 'Card 2', back: 'Back 2' }
        ]
      });
      
      nextCard();
      
      const state = useStudySessionStore.getState();
      expect(state.currentCard?.id).toBe(1);
      expect(state.showAnswer).toBe(false);
      expect(state.answerStartTime).toBeInstanceOf(Date);
    });

    it('should clear current card when no more cards in queue', () => {
      const { nextCard } = useStudySessionStore.getState();
      
      // Set up empty study queue
      useStudySessionStore.setState({
        studyQueue: [],
        currentCard: { id: 1, deckId: 1, front: 'Card 1', back: 'Back 1' }
      });
      
      nextCard();
      
      const state = useStudySessionStore.getState();
      expect(state.currentCard).toBeNull();
      expect(state.showAnswer).toBe(false);
      expect(state.answerStartTime).toBeNull();
    });

    it('should reset answer state when moving to next card', () => {
      const { nextCard } = useStudySessionStore.getState();
      
      // Set up initial state with answer shown
      useStudySessionStore.setState({
        studyQueue: [
          { id: 1, deckId: 1, front: 'Card 1', back: 'Back 1' }
        ],
        showAnswer: true
      });
      
      nextCard();
      
      const state = useStudySessionStore.getState();
      expect(state.showAnswer).toBe(false);
    });
  });
});
