import { useStudySessionStore, setSpacedRepetitionService, setSessionManager } from '../StudySessionStore';
import { StudyQuality } from '../../types/flashcard';
import { SpacedRepetitionService } from '../../services/SpacedRepetitionService';
import { ISessionManager } from '../../services/SessionManager';

describe('StudySessionStore - SM2 Algorithm Integration', () => {
  let mockSpacedRepetitionService: jest.Mocked<SpacedRepetitionService>;
  let mockSessionManager: jest.Mocked<ISessionManager>;

  beforeEach(() => {
    useStudySessionStore.getState().reset?.();
    
    // Create mock SpacedRepetitionService
    mockSpacedRepetitionService = {
      processStudyResult: jest.fn(),
      getCardsForReview: jest.fn(),
      getByCardId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    } as any;
    
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
      getEstimatedTimeRemaining: jest.fn(),
      getSessionSummary: jest.fn()
    } as any;
    
    // Inject mock services
    setSpacedRepetitionService(mockSpacedRepetitionService);
    setSessionManager(mockSessionManager);
  });

  afterEach(() => {
    jest.clearAllMocks();
    // Reset to null to use default services
    setSpacedRepetitionService(null as any);
    setSessionManager(null as any);
  });

  it('should call SpacedRepetitionService.processStudyResult when processAnswer is called', async () => {
    const { processAnswer } = useStudySessionStore.getState();
    
    // Set up a current card
    useStudySessionStore.setState({
      currentCard: {
        id: 1,
        deckId: 1,
        front: 'Test Question',
        back: 'Test Answer'
      } as any
    });
    
    mockSpacedRepetitionService.processStudyResult.mockResolvedValue();
    
    await processAnswer(StudyQuality.GOOD, 5000);
    
    expect(mockSpacedRepetitionService.processStudyResult).toHaveBeenCalledWith(1, StudyQuality.GOOD);
  });

  it('should update session stats and apply SM2 algorithm', async () => {
    const { processAnswer } = useStudySessionStore.getState();
    
    useStudySessionStore.setState({
      currentCard: {
        id: 1,
        deckId: 1,
        front: 'Test Question',
        back: 'Test Answer'
      } as any
    });
    
    mockSpacedRepetitionService.processStudyResult.mockResolvedValue();
    
    await processAnswer(StudyQuality.GOOD, 3000);
    
    // Should update session stats
    const stats = useStudySessionStore.getState().sessionStats;
    expect(stats.cardsStudied).toBe(1);
    expect(stats.correctAnswers).toBe(1);
    expect(stats.totalTime).toBe(3000);
    
    // Should call SM2 algorithm
    expect(mockSpacedRepetitionService.processStudyResult).toHaveBeenCalledWith(1, StudyQuality.GOOD);
  });

  it('should start session using SessionManager', async () => {
    const { startSession } = useStudySessionStore.getState();
    
    await startSession(1);
    
    // SessionManager가 사용되었는지 확인
    const { sessionId, isActive } = useStudySessionStore.getState();
    expect(sessionId).toBeDefined();
    expect(isActive).toBe(true);
  });

  it('should initialize spaced repetition data for new cards', async () => {
    const { initializeCardData } = useStudySessionStore.getState();
    
    mockSpacedRepetitionService.getByCardId.mockResolvedValue(undefined); // No existing data
    
    await initializeCardData(1);
    
    expect(mockSpacedRepetitionService.getByCardId).toHaveBeenCalledWith(1);
  });

  it('should handle errors from SpacedRepetitionService gracefully', async () => {
    const { processAnswer } = useStudySessionStore.getState();
    
    useStudySessionStore.setState({
      currentCard: {
        id: 1,
        deckId: 1,
        front: 'Test Question',
        back: 'Test Answer'
      } as any
    });
    
    mockSpacedRepetitionService.processStudyResult.mockRejectedValue(new Error('Database error'));
    
    await processAnswer(StudyQuality.GOOD, 5000);
    
    // Should still update session stats even if SM2 processing fails
    const stats = useStudySessionStore.getState().sessionStats;
    expect(stats.cardsStudied).toBe(1);
    
    // Should have error state
    expect(useStudySessionStore.getState().error).toBeTruthy();
  });
});
