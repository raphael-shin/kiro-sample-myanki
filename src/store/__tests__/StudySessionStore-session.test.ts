import { useStudySessionStore, setSpacedRepetitionService } from '../StudySessionStore';
import { SpacedRepetitionService } from '../../services/SpacedRepetitionService';

describe('StudySessionStore - Session Management', () => {
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
    setSpacedRepetitionService(null as any);
  });

  it('should have startSession action', () => {
    const state = useStudySessionStore.getState();
    
    expect(typeof state.startSession).toBe('function');
  });

  it('should set isActive to true when startSession is called', async () => {
    const { startSession } = useStudySessionStore.getState();
    
    mockSpacedRepetitionService.getCardsForReview.mockResolvedValue([1, 2, 3]);
    
    await startSession(123);
    
    expect(useStudySessionStore.getState().isActive).toBe(true);
  });

  it('should have endSession action', () => {
    const state = useStudySessionStore.getState();
    
    expect(typeof state.endSession).toBe('function');
  });

  it('should set isActive to false when endSession is called', async () => {
    const { startSession, endSession } = useStudySessionStore.getState();
    
    mockSpacedRepetitionService.getCardsForReview.mockResolvedValue([1, 2, 3]);
    
    // First start a session
    await startSession(123);
    expect(useStudySessionStore.getState().isActive).toBe(true);
    
    // Then end it
    endSession();
    expect(useStudySessionStore.getState().isActive).toBe(false);
  });

  it('should reset session stats when endSession is called', () => {
    const { endSession } = useStudySessionStore.getState();
    
    // Manually set some stats
    useStudySessionStore.setState({
      sessionStats: { cardsStudied: 5, correctAnswers: 3, totalTime: 120 }
    });
    
    endSession();
    
    const stats = useStudySessionStore.getState().sessionStats;
    expect(stats.cardsStudied).toBe(0);
    expect(stats.correctAnswers).toBe(0);
    expect(stats.totalTime).toBe(0);
  });
});
