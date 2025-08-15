import { render, screen } from '@testing-library/react';
import { StudyProgress } from '@/features/flashcard/components/StudySession/StudyProgress';

describe('StudyProgress', () => {
  it('should display current and total card count', () => {
    render(<StudyProgress current={3} total={10} />);
    
    expect(screen.getByText('3 / 10')).toBeInTheDocument();
  });

  it('should display progress percentage', () => {
    render(<StudyProgress current={3} total={10} />);
    
    expect(screen.getByText('30%')).toBeInTheDocument();
  });

  it('should handle edge cases correctly', () => {
    render(<StudyProgress current={0} total={0} />);
    
    expect(screen.getByText('0 / 0')).toBeInTheDocument();
    expect(screen.getByText('0%')).toBeInTheDocument();
  });
});
