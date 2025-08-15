import { render, screen } from '@testing-library/react';
import { DeckList } from '../DeckList';
import { Deck } from '../../../../../types/flashcard';

describe('DeckList Component', () => {
  const mockDecks: Deck[] = [
    {
      id: 1,
      name: 'Deck 1',
      description: 'Description 1',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      id: 2,
      name: 'Deck 2',
      description: 'Description 2',
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02')
    }
  ];

  it('should render list of deck cards', () => {
    render(<DeckList decks={mockDecks} />);
    
    expect(screen.getByText('Deck 1')).toBeInTheDocument();
    expect(screen.getByText('Deck 2')).toBeInTheDocument();
  });

  it('should render empty state when no decks provided', () => {
    render(<DeckList decks={[]} />);
    
    expect(screen.getByText(/No decks found/)).toBeInTheDocument();
  });

  it('should display loading state', () => {
    render(<DeckList decks={[]} loading={true} />);
    
    expect(screen.getByText(/Loading/)).toBeInTheDocument();
  });

  it('should render correct number of deck cards', () => {
    render(<DeckList decks={mockDecks} />);
    
    const deckCards = screen.getAllByRole('article');
    expect(deckCards).toHaveLength(2);
  });

  it('should handle single deck', () => {
    const singleDeck = [mockDecks[0]];
    
    render(<DeckList decks={singleDeck} />);
    
    expect(screen.getByText('Deck 1')).toBeInTheDocument();
    expect(screen.queryByText('Deck 2')).not.toBeInTheDocument();
  });

  it('should render as a list element', () => {
    render(<DeckList decks={mockDecks} />);
    
    const list = screen.getByRole('list');
    expect(list).toBeInTheDocument();
  });
});
