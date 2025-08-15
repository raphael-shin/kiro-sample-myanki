import { render, screen } from '@testing-library/react';
import { DeckStats } from '@/features/flashcard/components/Statistics/DeckStats';

describe('DeckStats', () => {
  const mockStats = {
    totalCards: 20,
    studiedCards: 12,
    averageQuality: 3.2,
    lastStudiedAt: new Date('2024-01-15T10:30:00Z')
  };

  it('should display total cards and studied cards count', () => {
    render(<DeckStats stats={mockStats} />);
    
    expect(screen.getByText('총 카드 수:')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
    expect(screen.getByText('학습된 카드 수:')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
  });

  it('should display card category breakdown', () => {
    render(<DeckStats stats={mockStats} />);
    
    expect(screen.getByText('신규 카드:')).toBeInTheDocument();
    expect(screen.getByText('학습중 카드:')).toBeInTheDocument();
    expect(screen.getByText('완료 카드:')).toBeInTheDocument();
  });
});
