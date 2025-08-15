import { render, screen } from '@testing-library/react';
import { DeckManagerPage } from '@/features/flashcard/components/DeckManager/DeckManagerPage';

// Mock the store
jest.mock('@/store/DeckStore', () => ({
  useDeckStore: () => ({
    decks: [],
    loading: false,
    error: null,
    loadDecks: jest.fn(),
    createDeck: jest.fn(),
    deleteDeck: jest.fn()
  })
}));

describe('DeckManagerPage', () => {
  it('should render DeckManager page with DeckList and CreateDeckModal', () => {
    render(<DeckManagerPage />);
    
    expect(screen.getByText('덱 관리')).toBeInTheDocument();
  });
});
