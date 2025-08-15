import { render, screen } from '@testing-library/react';
import { ProgressTracker } from '@/features/flashcard/components/Statistics/ProgressTracker';

describe('ProgressTracker', () => {
  const mockCardProgress = {
    cardId: 1,
    repetitions: 3,
    easeFactor: 2.6,
    nextReviewDate: new Date('2024-01-20T10:00:00Z'),
    interval: 7
  };

  it('should display repetition count, ease factor, and next review date', () => {
    render(<ProgressTracker cardProgress={mockCardProgress} />);
    
    expect(screen.getByText('반복 횟수:')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('용이도 인수:')).toBeInTheDocument();
    expect(screen.getByText('2.6')).toBeInTheDocument();
    expect(screen.getByText('다음 복습 날짜:')).toBeInTheDocument();
  });

  it('should display learning progress percentage', () => {
    render(<ProgressTracker cardProgress={mockCardProgress} />);
    
    expect(screen.getByText('학습 진행률:')).toBeInTheDocument();
    expect(screen.getByText('30%')).toBeInTheDocument(); // 3/10 * 100 = 30%
  });
});
