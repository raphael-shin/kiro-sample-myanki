import { useStudySessionStore } from '../StudySessionStore';

describe('StudySessionStore - Basic State', () => {
  beforeEach(() => {
    useStudySessionStore.getState().reset?.();
  });

  it('should have initial state with null currentCard', () => {
    const state = useStudySessionStore.getState();
    
    expect(state.currentCard).toBeNull();
    expect(state.isActive).toBe(false);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should have session statistics', () => {
    const state = useStudySessionStore.getState();
    
    expect(state.sessionStats).toEqual({
      cardsStudied: 0,
      correctAnswers: 0,
      totalTime: 0
    });
  });

  it('should have study queue', () => {
    const state = useStudySessionStore.getState();
    
    expect(Array.isArray(state.studyQueue)).toBe(true);
    expect(state.studyQueue).toEqual([]);
  });
});
