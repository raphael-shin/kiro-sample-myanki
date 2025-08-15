import { useDeckStore } from '../DeckStore';

describe('DeckStore - Error Handling', () => {
  beforeEach(() => {
    useDeckStore.getState().reset?.();
  });

  it('should have setError action', () => {
    const state = useDeckStore.getState();
    
    expect(typeof state.setError).toBe('function');
  });

  it('should set error message when setError is called', () => {
    const { setError } = useDeckStore.getState();
    
    setError('Test error message');
    
    expect(useDeckStore.getState().error).toBe('Test error message');
  });

  it('should have clearError action', () => {
    const state = useDeckStore.getState();
    
    expect(typeof state.clearError).toBe('function');
  });

  it('should clear error when clearError is called', () => {
    const { setError, clearError } = useDeckStore.getState();
    
    // First set an error
    setError('Test error');
    expect(useDeckStore.getState().error).toBe('Test error');
    
    // Then clear it
    clearError();
    expect(useDeckStore.getState().error).toBeNull();
  });

  it('should clear error when setError is called with null', () => {
    const { setError } = useDeckStore.getState();
    
    // First set an error
    setError('Test error');
    expect(useDeckStore.getState().error).toBe('Test error');
    
    // Then clear it with null
    setError(null);
    expect(useDeckStore.getState().error).toBeNull();
  });
});
