import { render, screen } from '@testing-library/react';
import { DeckCard } from '../DeckCard';
import { Deck } from '../../../../../types/flashcard';
import { CardStats } from '../../../../../utils/cardStats';

describe('DeckCard Component - Detailed Statistics', () => {
  const mockDeck: Deck = {
    id: 1,
    name: 'Test Deck',
    description: 'Test Description',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  };

  it('should display detailed card statistics when cardStats is provided', () => {
    const mockCardStats: CardStats = {
      total: 25,
      new: 10,
      learning: 8,
      mastered: 7,
      dueToday: 5
    };

    render(<DeckCard deck={mockDeck} cardStats={mockCardStats} />);
    
    expect(screen.getByText('총 25장')).toBeInTheDocument();
    expect(screen.getByText('오늘 복습 5장')).toBeInTheDocument();
    expect(screen.getByText('신규 10 • 학습중 8 • 완료 7')).toBeInTheDocument();
  });

  it('should display only total when no cards due today', () => {
    const mockCardStats: CardStats = {
      total: 15,
      new: 5,
      learning: 6,
      mastered: 4,
      dueToday: 0
    };

    render(<DeckCard deck={mockDeck} cardStats={mockCardStats} />);
    
    expect(screen.getByText('총 15장')).toBeInTheDocument();
    expect(screen.queryByText(/오늘 복습/)).not.toBeInTheDocument();
    expect(screen.getByText('신규 5 • 학습중 6 • 완료 4')).toBeInTheDocument();
  });

  it('should fall back to cardCount when cardStats is not provided', () => {
    render(<DeckCard deck={mockDeck} cardCount={20} />);
    
    expect(screen.getByText('20 cards')).toBeInTheDocument();
    expect(screen.queryByText(/신규/)).not.toBeInTheDocument();
  });

  it('should handle empty deck with cardStats', () => {
    const mockCardStats: CardStats = {
      total: 0,
      new: 0,
      learning: 0,
      mastered: 0,
      dueToday: 0
    };

    render(<DeckCard deck={mockDeck} cardStats={mockCardStats} />);
    
    expect(screen.getByText('총 0장')).toBeInTheDocument();
    expect(screen.queryByText(/신규/)).not.toBeInTheDocument();
    expect(screen.queryByText(/오늘 복습/)).not.toBeInTheDocument();
  });

  it('should display partial statistics when some categories are zero', () => {
    const mockCardStats: CardStats = {
      total: 10,
      new: 0,
      learning: 5,
      mastered: 5,
      dueToday: 2
    };

    render(<DeckCard deck={mockDeck} cardStats={mockCardStats} />);
    
    expect(screen.getByText('총 10장')).toBeInTheDocument();
    expect(screen.getByText('오늘 복습 2장')).toBeInTheDocument();
    expect(screen.getByText('학습중 5 • 완료 5')).toBeInTheDocument();
    expect(screen.queryByText(/신규/)).not.toBeInTheDocument();
  });
});
