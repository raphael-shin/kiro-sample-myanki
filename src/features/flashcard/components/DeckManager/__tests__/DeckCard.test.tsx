import { render, screen } from '@testing-library/react';
import { DeckCard } from '../DeckCard';
import { Deck } from '../../../../../types/flashcard';

describe('DeckCard Component', () => {
  const mockDeck: Deck = {
    id: 1,
    name: 'Test Deck',
    description: 'Test Description',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  };

  it('should display deck name', () => {
    render(<DeckCard deck={mockDeck} />);
    
    expect(screen.getByText('Test Deck')).toBeInTheDocument();
  });

  it('should display deck description', () => {
    render(<DeckCard deck={mockDeck} />);
    
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('should handle deck without description', () => {
    const deckWithoutDescription = { ...mockDeck, description: undefined };
    
    render(<DeckCard deck={deckWithoutDescription} />);
    
    expect(screen.getByText('Test Deck')).toBeInTheDocument();
    expect(screen.queryByText('Test Description')).not.toBeInTheDocument();
  });

  it('should render as a card element', () => {
    render(<DeckCard deck={mockDeck} />);
    
    const card = screen.getByRole('article');
    expect(card).toBeInTheDocument();
  });
});
