import { useDeckStore } from '../DeckStore';

describe('DeckStore - Selection', () => {
  beforeEach(() => {
    useDeckStore.getState().reset?.();
  });

  it('should have selectDeck action', () => {
    const state = useDeckStore.getState();
    
    expect(typeof state.selectDeck).toBe('function');
  });

  it('should set selectedDeckId when selectDeck is called', () => {
    const { selectDeck } = useDeckStore.getState();
    
    selectDeck(123);
    
    expect(useDeckStore.getState().selectedDeckId).toBe(123);
  });

  it('should clear selectedDeckId when selectDeck is called with null', () => {
    const { selectDeck } = useDeckStore.getState();
    
    // First select a deck
    selectDeck(123);
    expect(useDeckStore.getState().selectedDeckId).toBe(123);
    
    // Then clear selection
    selectDeck(null);
    expect(useDeckStore.getState().selectedDeckId).toBeNull();
  });

  it('should have clearSelection action', () => {
    const state = useDeckStore.getState();
    
    expect(typeof state.clearSelection).toBe('function');
  });

  it('should clear selectedDeckId when clearSelection is called', () => {
    const { selectDeck, clearSelection } = useDeckStore.getState();
    
    // First select a deck
    selectDeck(123);
    expect(useDeckStore.getState().selectedDeckId).toBe(123);
    
    // Then clear selection
    clearSelection();
    expect(useDeckStore.getState().selectedDeckId).toBeNull();
  });
});
