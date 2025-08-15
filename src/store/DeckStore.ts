import { create } from 'zustand';
import { Deck } from '../types/flashcard';
import { DeckService } from '../services/DeckService';
import { db } from '../db/MyAnkiDB';

/**
 * 덱 관리를 위한 Zustand 스토어
 * 
 * 덱 목록, 선택된 덱, 로딩 상태, 에러 상태를 관리합니다.
 * 간격 반복 학습 시스템의 덱 상태 관리를 담당합니다.
 */
interface DeckState {
  // State
  decks: Deck[];
  loading: boolean;
  error: string | null;
  selectedDeckId: number | null;
  
  // Actions
  loadDecks: () => Promise<void>;
  createDeck: (deckData: Omit<Deck, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateDeck: (id: number, updates: Partial<Deck>) => Promise<void>;
  deleteDeck: (id: number) => Promise<void>;
  selectDeck: (deckId: number | null) => void;
  clearSelection: () => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  reset?: () => void;
}

// Allow dependency injection for testing
let deckServiceInstance: DeckService | null = null;

export const setDeckService = (service: DeckService) => {
  deckServiceInstance = service;
};

export const useDeckStore = create<DeckState>((set, get) => {
  // Get or create DeckService instance
  const getDeckService = () => {
    if (deckServiceInstance) {
      return deckServiceInstance;
    }
    return new DeckService(db);
  };
  
  // Helper function for async operations with loading and error handling
  const withAsyncOperation = async (
    operation: () => Promise<void>,
    errorMessage: string
  ) => {
    set({ loading: true, error: null });
    
    try {
      await operation();
      set({ loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : errorMessage,
        loading: false 
      });
    }
  };

  return {
    // Initial state
    decks: [],
    loading: false,
    error: null,
    selectedDeckId: null,
    
    // Deck operations
    loadDecks: async () => {
      await withAsyncOperation(async () => {
        const deckService = getDeckService();
        const decks = await deckService.getAll();
        set({ decks });
      }, 'Failed to load decks');
    },
    
    createDeck: async (deckData) => {
      await withAsyncOperation(async () => {
        const deckService = getDeckService();
        const deckId = await deckService.create(deckData);
        const newDeck = await deckService.getById(deckId);
        
        if (newDeck) {
          const { decks } = get();
          set({ decks: [...decks, newDeck] });
        }
      }, 'Failed to create deck');
    },
    
    updateDeck: async (id, updates) => {
      await withAsyncOperation(async () => {
        const deckService = getDeckService();
        await deckService.update(id, updates);
        const updatedDeck = await deckService.getById(id);
        
        if (updatedDeck) {
          const { decks } = get();
          const updatedDecks = decks.map(deck => 
            deck.id === id ? updatedDeck : deck
          );
          set({ decks: updatedDecks });
        }
      }, 'Failed to update deck');
    },
    
    deleteDeck: async (id) => {
      await withAsyncOperation(async () => {
        const deckService = getDeckService();
        await deckService.delete(id);
        
        const { decks, selectedDeckId } = get();
        const filteredDecks = decks.filter(deck => deck.id !== id);
        
        set({ 
          decks: filteredDecks,
          selectedDeckId: selectedDeckId === id ? null : selectedDeckId
        });
      }, 'Failed to delete deck');
    },
    
    // Deck selection
    selectDeck: (deckId: number | null) => {
      set({ selectedDeckId: deckId });
    },
    
    clearSelection: () => {
      set({ selectedDeckId: null });
    },
    
    // Error handling
    setError: (error: string | null) => {
      set({ error });
    },
    
    clearError: () => {
      set({ error: null });
    },
    
    // Reset for testing
    reset: () => set({
      decks: [],
      loading: false,
      error: null,
      selectedDeckId: null
    })
  };
});
