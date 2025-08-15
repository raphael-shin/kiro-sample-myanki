import { useStudySessionStore } from '../StudySessionStore';
import { StudyQuality } from '../../types/flashcard';

describe('StudySessionStore - Answer Processing', () => {
  beforeEach(() => {
    useStudySessionStore.getState().reset?.();
  });

  it('should have submitAnswer action', () => {
    const state = useStudySessionStore.getState();
    
    expect(typeof state.submitAnswer).toBe('function');
  });

  it('should update session stats when submitAnswer is called', async () => {
    const { submitAnswer } = useStudySessionStore.getState();
    
    await submitAnswer(StudyQuality.GOOD, 5000);
    
    const stats = useStudySessionStore.getState().sessionStats;
    expect(stats.cardsStudied).toBe(1);
    expect(stats.totalTime).toBe(5000);
  });

  it('should increment correctAnswers for GOOD and EASY quality', async () => {
    const { submitAnswer } = useStudySessionStore.getState();
    
    await submitAnswer(StudyQuality.GOOD, 3000);
    expect(useStudySessionStore.getState().sessionStats.correctAnswers).toBe(1);
    
    await submitAnswer(StudyQuality.EASY, 2000);
    expect(useStudySessionStore.getState().sessionStats.correctAnswers).toBe(2);
  });

  it('should not increment correctAnswers for AGAIN and HARD quality', async () => {
    const { submitAnswer } = useStudySessionStore.getState();
    
    await submitAnswer(StudyQuality.AGAIN, 8000);
    expect(useStudySessionStore.getState().sessionStats.correctAnswers).toBe(0);
    
    await submitAnswer(StudyQuality.HARD, 6000);
    expect(useStudySessionStore.getState().sessionStats.correctAnswers).toBe(0);
  });

  it('should have nextCard action', () => {
    const state = useStudySessionStore.getState();
    
    expect(typeof state.nextCard).toBe('function');
  });

  it('should move to next card when nextCard is called', () => {
    const { nextCard } = useStudySessionStore.getState();
    
    // Set up a mock study queue
    useStudySessionStore.setState({
      studyQueue: [
        { id: 1, front: 'Card 1', back: 'Answer 1' } as any,
        { id: 2, front: 'Card 2', back: 'Answer 2' } as any
      ]
    });
    
    nextCard();
    
    expect(useStudySessionStore.getState().currentCard?.id).toBe(1);
    expect(useStudySessionStore.getState().studyQueue.length).toBe(1);
  });
});
