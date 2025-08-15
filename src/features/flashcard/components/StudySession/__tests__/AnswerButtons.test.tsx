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
    
    expect(screen.getByRole('button', { name: /again/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /hard/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /good/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /easy/i })).toBeInTheDocument();
  });

  it('should call onAnswer with AGAIN when again button clicked', () => {
    render(<AnswerButtons onAnswer={mockOnAnswer} />);
    
    const againButton = screen.getByRole('button', { name: /again/i });
    fireEvent.click(againButton);
    
    expect(mockOnAnswer).toHaveBeenCalledWith(StudyQuality.AGAIN, expect.any(Number));
  });

  it('should call onAnswer with HARD when hard button clicked', () => {
    render(<AnswerButtons onAnswer={mockOnAnswer} />);
    
    const hardButton = screen.getByRole('button', { name: /hard/i });
    fireEvent.click(hardButton);
    
    expect(mockOnAnswer).toHaveBeenCalledWith(StudyQuality.HARD, expect.any(Number));
  });

  it('should call onAnswer with GOOD when good button clicked', () => {
    render(<AnswerButtons onAnswer={mockOnAnswer} />);
    
    const goodButton = screen.getByRole('button', { name: /good/i });
    fireEvent.click(goodButton);
    
    expect(mockOnAnswer).toHaveBeenCalledWith(StudyQuality.GOOD, expect.any(Number));
  });

  it('should call onAnswer with EASY when easy button clicked', () => {
    render(<AnswerButtons onAnswer={mockOnAnswer} />);
    
    const easyButton = screen.getByRole('button', { name: /easy/i });
    fireEvent.click(easyButton);
    
    expect(mockOnAnswer).toHaveBeenCalledWith(StudyQuality.EASY, expect.any(Number));
  });

  it('should disable buttons when disabled prop is true', () => {
    render(<AnswerButtons onAnswer={mockOnAnswer} disabled={true} />);
    
    const againButton = screen.getByRole('button', { name: /again/i });
    const hardButton = screen.getByRole('button', { name: /hard/i });
    const goodButton = screen.getByRole('button', { name: /good/i });
    const easyButton = screen.getByRole('button', { name: /easy/i });
    
    expect(againButton).toBeDisabled();
    expect(hardButton).toBeDisabled();
    expect(goodButton).toBeDisabled();
    expect(easyButton).toBeDisabled();
  });

  it('should have disabled styling when disabled', () => {
    render(<AnswerButtons onAnswer={mockOnAnswer} disabled={true} />);
    
    const againButton = screen.getByRole('button', { name: /again/i });
    expect(againButton).toHaveClass('bg-gray-400', 'cursor-not-allowed');
  });
});
