import { useDeckStore } from '../DeckStore';

describe('DeckStore - Basic State', () => {
  beforeEach(() => {
    // Reset store state before each test
    useDeckStore.getState().reset?.();
  });

  it('should have initial state with empty decks array', () => {
    const state = useDeckStore.getState();
    
    expect(state.decks).toEqual([]);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should have loading state', () => {
    const state = useDeckStore.getState();
    
    expect(typeof state.loading).toBe('boolean');
  });

  it('should have error state', () => {
    const state = useDeckStore.getState();
    
    expect(state.error).toBeNull();
  });

  it('should have selectedDeckId state', () => {
    const state = useDeckStore.getState();
    
    expect(state.selectedDeckId).toBeNull();
  });
});
