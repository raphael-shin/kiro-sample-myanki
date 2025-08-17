import { render, screen } from '@testing-library/react';
import { DeckCard } from '../DeckCard';
import { Deck } from '../../../../../types/flashcard';

describe('DeckCard Component - Statistics', () => {
  const mockDeck: Deck = {
    id: 1,
    name: 'Test Deck',
    description: 'Test Description',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  };

  it('should display card count when provided', () => {
    render(<DeckCard deck={mockDeck} cardCount={25} />);
    
    expect(screen.getByText('25 cards')).toBeInTheDocument();
  });

  it('should display last studied date when provided', () => {
    const lastStudiedDate = new Date('2024-01-15');
    
    render(<DeckCard deck={mockDeck} lastStudiedAt={lastStudiedDate} />);
    
    expect(screen.getByText(/Last:/)).toBeInTheDocument();
  });

  it('should display both card count and last studied date', () => {
    const lastStudiedDate = new Date('2024-01-15');
    
    render(
      <DeckCard 
        deck={mockDeck} 
        cardCount={10} 
        lastStudiedAt={lastStudiedDate} 
      />
    );
    
    expect(screen.getByText('10 cards')).toBeInTheDocument();
    expect(screen.getByText(/Last:/)).toBeInTheDocument();
  });

  it('should handle zero card count', () => {
    render(<DeckCard deck={mockDeck} cardCount={0} />);
    
    expect(screen.getByText('0 cards')).toBeInTheDocument();
  });

  it('should handle singular card count', () => {
    render(<DeckCard deck={mockDeck} cardCount={1} />);
    
    expect(screen.getByText('1 card')).toBeInTheDocument();
  });

  it('should display default card count when not provided', () => {
    render(<DeckCard deck={mockDeck} />);
    
    expect(screen.getByText('0 cards')).toBeInTheDocument();
    expect(screen.queryByText(/Last:/)).not.toBeInTheDocument();
  });
});
