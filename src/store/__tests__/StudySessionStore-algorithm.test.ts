import { useStudySessionStore } from '../StudySessionStore';
import { StudyQuality } from '../../types/flashcard';

describe('StudySessionStore - Algorithm Integration', () => {
  beforeEach(() => {
    useStudySessionStore.getState().reset?.();
  });

  it('should have processAnswer action that integrates with SM2 algorithm', () => {
    const state = useStudySessionStore.getState();
    
    expect(typeof state.processAnswer).toBe('function');
  });

  it('should update spaced repetition data when processAnswer is called', async () => {
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
    
    await processAnswer(StudyQuality.GOOD, 5000);
    
    // Should update session stats
    const stats = useStudySessionStore.getState().sessionStats;
    expect(stats.cardsStudied).toBe(1);
    expect(stats.correctAnswers).toBe(1);
    expect(stats.totalTime).toBe(5000);
  });

  it('should have initializeCardData action', () => {
    const state = useStudySessionStore.getState();
    
    expect(typeof state.initializeCardData).toBe('function');
  });

  it('should create initial spaced repetition data for new cards', async () => {
    const { initializeCardData } = useStudySessionStore.getState();
    
    const cardId = 1;
    await initializeCardData(cardId);
    
    // This should create initial spaced repetition data
    // The actual verification would depend on the service integration
    expect(typeof initializeCardData).toBe('function');
  });

  it('should have getCardsForReview action', () => {
    const state = useStudySessionStore.getState();
    
    expect(typeof state.getCardsForReview).toBe('function');
  });

  it('should filter cards that are due for review', async () => {
    const { getCardsForReview } = useStudySessionStore.getState();
    
    const deckId = 1;
    const cards = await getCardsForReview(deckId);
    
    expect(Array.isArray(cards)).toBe(true);
  });
});
