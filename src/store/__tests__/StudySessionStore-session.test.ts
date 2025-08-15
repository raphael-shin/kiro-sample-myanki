import { useStudySessionStore } from '../StudySessionStore';

describe('StudySessionStore - Session Management', () => {
  beforeEach(() => {
    useStudySessionStore.getState().reset?.();
  });

  it('should have startSession action', () => {
    const state = useStudySessionStore.getState();
    
    expect(typeof state.startSession).toBe('function');
  });

  it('should set isActive to true when startSession is called', async () => {
    const { startSession } = useStudySessionStore.getState();
    
    await startSession(123);
    
    expect(useStudySessionStore.getState().isActive).toBe(true);
  });

  it('should have endSession action', () => {
    const state = useStudySessionStore.getState();
    
    expect(typeof state.endSession).toBe('function');
  });

  it('should set isActive to false when endSession is called', () => {
    const { startSession, endSession } = useStudySessionStore.getState();
    
    // First start a session
    startSession(123);
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
