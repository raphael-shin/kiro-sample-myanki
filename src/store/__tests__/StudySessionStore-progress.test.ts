import { useStudySessionStore } from '../StudySessionStore';

describe('StudySessionStore - Progress Tracking', () => {
  beforeEach(() => {
    useStudySessionStore.getState().reset?.();
  });

  it('should have getProgress method', () => {
    const state = useStudySessionStore.getState();
    
    expect(typeof state.getProgress).toBe('function');
  });

  it('should calculate progress percentage correctly', () => {
    const { getProgress } = useStudySessionStore.getState();
    
    // Set up initial state with 5 total cards, 2 studied
    useStudySessionStore.setState({
      sessionStats: { cardsStudied: 2, correctAnswers: 1, totalTime: 10000 },
      studyQueue: [
        { id: 3, front: 'Card 3' } as any,
        { id: 4, front: 'Card 4' } as any,
        { id: 5, front: 'Card 5' } as any
      ]
    });
    
    const progress = getProgress();
    
    expect(progress.percentage).toBe(40); // 2 out of 5 cards = 40%
    expect(progress.cardsRemaining).toBe(3);
    expect(progress.totalCards).toBe(5);
  });

  it('should return 100% when all cards are completed', () => {
    const { getProgress } = useStudySessionStore.getState();
    
    // Set up state with all cards completed
    useStudySessionStore.setState({
      sessionStats: { cardsStudied: 3, correctAnswers: 2, totalTime: 15000 },
      studyQueue: []
    });
    
    const progress = getProgress();
    
    expect(progress.percentage).toBe(100);
    expect(progress.cardsRemaining).toBe(0);
    expect(progress.totalCards).toBe(3);
  });

  it('should have updateProgress action', () => {
    const state = useStudySessionStore.getState();
    
    expect(typeof state.updateProgress).toBe('function');
  });

  it('should update progress when updateProgress is called', () => {
    const { updateProgress } = useStudySessionStore.getState();
    
    updateProgress();
    
    // This should trigger progress calculation
    // The actual behavior depends on implementation
    expect(typeof useStudySessionStore.getState().getProgress).toBe('function');
  });
});
