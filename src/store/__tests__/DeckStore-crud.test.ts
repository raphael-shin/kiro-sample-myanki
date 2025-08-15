import { useDeckStore } from '../DeckStore';
import { Deck } from '../../types/flashcard';

describe('DeckStore - CRUD Actions', () => {
  beforeEach(() => {
    useDeckStore.getState().reset?.();
  });

  it('should have createDeck action', () => {
    const state = useDeckStore.getState();
    
    expect(typeof state.createDeck).toBe('function');
  });

  it('should add new deck to state when createDeck is called', async () => {
    const { createDeck } = useDeckStore.getState();
    
    const newDeck = {
      name: 'Test Deck',
      description: 'Test Description'
    };
    
    await createDeck(newDeck);
    
    const decks = useDeckStore.getState().decks;
    expect(decks).toHaveLength(1);
    expect(decks[0].name).toBe('Test Deck');
    expect(decks[0].description).toBe('Test Description');
  });

  it('should have updateDeck action', () => {
    const state = useDeckStore.getState();
    
    expect(typeof state.updateDeck).toBe('function');
  });

  it('should update existing deck in state when updateDeck is called', async () => {
    const { createDeck, updateDeck } = useDeckStore.getState();
    
    // First create a deck
    await createDeck({ name: 'Original Name', description: 'Original Description' });
    const deckId = useDeckStore.getState().decks[0].id!;
    
    // Then update it
    await updateDeck(deckId, { name: 'Updated Name' });
    
    const decks = useDeckStore.getState().decks;
    expect(decks[0].name).toBe('Updated Name');
    expect(decks[0].description).toBe('Original Description'); // Should remain unchanged
  });

  it('should have deleteDeck action', () => {
    const state = useDeckStore.getState();
    
    expect(typeof state.deleteDeck).toBe('function');
  });

  it('should remove deck from state when deleteDeck is called', async () => {
    const { createDeck, deleteDeck } = useDeckStore.getState();
    
    // First create a deck
    await createDeck({ name: 'Test Deck', description: 'Test Description' });
    const deckId = useDeckStore.getState().decks[0].id!;
    
    // Then delete it
    await deleteDeck(deckId);
    
    const decks = useDeckStore.getState().decks;
    expect(decks).toHaveLength(0);
  });
});
