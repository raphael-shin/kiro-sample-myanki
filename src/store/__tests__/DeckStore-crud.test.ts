import { useDeckStore, setDeckService } from '../DeckStore';
import { DeckService } from '../../services/DeckService';
import { Deck } from '../../types/flashcard';

/**
 * In-memory DeckService stand-in. The store delegates persistence to
 * DeckService, so these tests check the store's state transitions against a
 * service that really stores and returns decks.
 */
const createInMemoryDeckService = (): DeckService => {
  const decks = new Map<number, Deck>();
  let nextId = 1;
  return {
    create: jest.fn(async (input: Omit<Deck, 'id' | 'createdAt' | 'updatedAt'>) => {
      const id = nextId++;
      const now = new Date();
      decks.set(id, { ...input, id, createdAt: now, updatedAt: now });
      return id;
    }),
    getById: jest.fn(async (id: number) => decks.get(id)),
    update: jest.fn(async (id: number, updates: Partial<Deck>) => {
      const existing = decks.get(id);
      if (existing) decks.set(id, { ...existing, ...updates, updatedAt: new Date() });
    }),
    delete: jest.fn(async (id: number) => {
      decks.delete(id);
    })
  } as unknown as DeckService;
};

describe('DeckStore - CRUD Actions', () => {
  beforeEach(() => {
    useDeckStore.getState().reset?.();
    setDeckService(createInMemoryDeckService());
  });

  afterEach(() => {
    setDeckService(null as unknown as DeckService);
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
