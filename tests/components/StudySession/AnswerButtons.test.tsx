import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AnswerButtons } from '@/features/flashcard/components/StudySession/AnswerButtons';
import { StudyQuality } from '@/types/flashcard';

describe('AnswerButtons', () => {
  const mockOnAnswer = jest.fn();

  beforeEach(() => {
    mockOnAnswer.mockClear();
  });

  it('should render 4 evaluation buttons (다시, 어려움, 보통, 쉬움)', () => {
    render(<AnswerButtons onAnswer={mockOnAnswer} />);
    
    expect(screen.getByText('다시')).toBeInTheDocument();
    expect(screen.getByText('어려움')).toBeInTheDocument();
    expect(screen.getByText('보통')).toBeInTheDocument();
    expect(screen.getByText('쉬움')).toBeInTheDocument();
  });

  it('should call onAnswer with correct StudyQuality when buttons are clicked', async () => {
    const user = userEvent.setup();
    render(<AnswerButtons onAnswer={mockOnAnswer} />);
    
    await user.click(screen.getByText('다시'));
    expect(mockOnAnswer).toHaveBeenCalledWith(StudyQuality.AGAIN, expect.any(Number));
    
    await user.click(screen.getByText('어려움'));
    expect(mockOnAnswer).toHaveBeenCalledWith(StudyQuality.HARD, expect.any(Number));
    
    await user.click(screen.getByText('보통'));
    expect(mockOnAnswer).toHaveBeenCalledWith(StudyQuality.GOOD, expect.any(Number));
    
    await user.click(screen.getByText('쉬움'));
    expect(mockOnAnswer).toHaveBeenCalledWith(StudyQuality.EASY, expect.any(Number));
    
    expect(mockOnAnswer).toHaveBeenCalledTimes(4);
  });
});
