import { render, screen, fireEvent } from '@testing-library/react';
import { AnswerButtons } from '../AnswerButtons';
import { StudyQuality } from '@/types/flashcard';

describe('AnswerButtons Component', () => {
  const mockOnAnswer = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render all four answer buttons', () => {
    render(<AnswerButtons onAnswer={mockOnAnswer} />);
    
    expect(screen.getByRole('button', { name: /다시/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /어려움/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /보통/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /쉬움/ })).toBeInTheDocument();
  });

  it('should call onAnswer with AGAIN when again button clicked', () => {
    render(<AnswerButtons onAnswer={mockOnAnswer} />);
    
    const againButton = screen.getByRole('button', { name: /다시/ });
    fireEvent.click(againButton);
    
    expect(mockOnAnswer).toHaveBeenCalledWith(StudyQuality.AGAIN, expect.any(Number));
  });

  it('should call onAnswer with HARD when hard button clicked', () => {
    render(<AnswerButtons onAnswer={mockOnAnswer} />);
    
    const hardButton = screen.getByRole('button', { name: /어려움/ });
    fireEvent.click(hardButton);
    
    expect(mockOnAnswer).toHaveBeenCalledWith(StudyQuality.HARD, expect.any(Number));
  });

  it('should call onAnswer with GOOD when good button clicked', () => {
    render(<AnswerButtons onAnswer={mockOnAnswer} />);
    
    const goodButton = screen.getByRole('button', { name: /보통/ });
    fireEvent.click(goodButton);
    
    expect(mockOnAnswer).toHaveBeenCalledWith(StudyQuality.GOOD, expect.any(Number));
  });

  it('should call onAnswer with EASY when easy button clicked', () => {
    render(<AnswerButtons onAnswer={mockOnAnswer} />);
    
    const easyButton = screen.getByRole('button', { name: /쉬움/ });
    fireEvent.click(easyButton);
    
    expect(mockOnAnswer).toHaveBeenCalledWith(StudyQuality.EASY, expect.any(Number));
  });

  it('should disable buttons when disabled prop is true', () => {
    render(<AnswerButtons onAnswer={mockOnAnswer} disabled={true} />);
    
    const againButton = screen.getByRole('button', { name: /다시/ });
    const hardButton = screen.getByRole('button', { name: /어려움/ });
    const goodButton = screen.getByRole('button', { name: /보통/ });
    const easyButton = screen.getByRole('button', { name: /쉬움/ });
    
    expect(againButton).toBeDisabled();
    expect(hardButton).toBeDisabled();
    expect(goodButton).toBeDisabled();
    expect(easyButton).toBeDisabled();
  });

  it('should have disabled styling when disabled', () => {
    render(<AnswerButtons onAnswer={mockOnAnswer} disabled={true} />);
    
    const againButton = screen.getByRole('button', { name: /다시/ });
    expect(againButton).toHaveClass('bg-gray-400', 'disabled:cursor-not-allowed');
  });
});
