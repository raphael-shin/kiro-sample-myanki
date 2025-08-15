import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AnswerButtons } from '@/features/flashcard/components/StudySession/AnswerButtons';
import { StudyQuality } from '@/types/flashcard';

describe('AnswerButtons', () => {
  const mockOnAnswer = jest.fn();

  beforeEach(() => {
    mockOnAnswer.mockClear();
  });

  it('should render 4 evaluation buttons (Again, Hard, Good, Easy)', () => {
    render(<AnswerButtons onAnswer={mockOnAnswer} />);
    
    expect(screen.getByText('Again')).toBeInTheDocument();
    expect(screen.getByText('Hard')).toBeInTheDocument();
    expect(screen.getByText('Good')).toBeInTheDocument();
    expect(screen.getByText('Easy')).toBeInTheDocument();
  });

  it('should call onAnswer with correct StudyQuality when buttons are clicked', async () => {
    const user = userEvent.setup();
    render(<AnswerButtons onAnswer={mockOnAnswer} />);
    
    await user.click(screen.getByText('Again'));
    expect(mockOnAnswer).toHaveBeenCalledWith(StudyQuality.AGAIN, expect.any(Number));
    
    await user.click(screen.getByText('Hard'));
    expect(mockOnAnswer).toHaveBeenCalledWith(StudyQuality.HARD, expect.any(Number));
    
    await user.click(screen.getByText('Good'));
    expect(mockOnAnswer).toHaveBeenCalledWith(StudyQuality.GOOD, expect.any(Number));
    
    await user.click(screen.getByText('Easy'));
    expect(mockOnAnswer).toHaveBeenCalledWith(StudyQuality.EASY, expect.any(Number));
    
    expect(mockOnAnswer).toHaveBeenCalledTimes(4);
  });
});
