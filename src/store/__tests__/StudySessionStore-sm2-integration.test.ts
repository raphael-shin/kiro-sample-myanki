import { useStudySessionStore, setSpacedRepetitionService } from '../StudySessionStore';
import { StudyQuality } from '../../types/flashcard';
import { SpacedRepetitionService } from '../../services/SpacedRepetitionService';

describe('StudySessionStore - SM2 Algorithm Integration', () => {
  let mockSpacedRepetitionService: jest.Mocked<SpacedRepetitionService>;

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
    
    // Inject mock service
    setSpacedRepetitionService(mockSpacedRepetitionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    // Reset to null to use default service
    setSpacedRepetitionService(null as any);
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

  it('should load cards for review when starting session', async () => {
    const { startSession } = useStudySessionStore.getState();
    
    const mockCardIds = [1, 2, 3];
    mockSpacedRepetitionService.getCardsForReview.mockResolvedValue(mockCardIds);
    
    await startSession(1);
    
    expect(mockSpacedRepetitionService.getCardsForReview).toHaveBeenCalled();
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
