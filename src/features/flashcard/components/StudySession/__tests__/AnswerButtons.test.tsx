import { render, screen, fireEvent } from '@testing-library/react';
import { AnswerButtons } from '../AnswerButtons';
import { StudyQuality } from '../../../../types/flashcard';

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
    
    expect(mockOnAnswer).toHaveBeenCalledWith(StudyQuality.AGAIN);
  });

  it('should call onAnswer with HARD when hard button clicked', () => {
    render(<AnswerButtons onAnswer={mockOnAnswer} />);
    
    const hardButton = screen.getByRole('button', { name: /hard/i });
    fireEvent.click(hardButton);
    
    expect(mockOnAnswer).toHaveBeenCalledWith(StudyQuality.HARD);
  });

  it('should call onAnswer with GOOD when good button clicked', () => {
    render(<AnswerButtons onAnswer={mockOnAnswer} />);
    
    const goodButton = screen.getByRole('button', { name: /good/i });
    fireEvent.click(goodButton);
    
    expect(mockOnAnswer).toHaveBeenCalledWith(StudyQuality.GOOD);
  });

  it('should call onAnswer with EASY when easy button clicked', () => {
    render(<AnswerButtons onAnswer={mockOnAnswer} />);
    
    const easyButton = screen.getByRole('button', { name: /easy/i });
    fireEvent.click(easyButton);
    
    expect(mockOnAnswer).toHaveBeenCalledWith(StudyQuality.EASY);
  });

  it('should have proper button styling', () => {
    render(<AnswerButtons onAnswer={mockOnAnswer} />);
    
    const againButton = screen.getByRole('button', { name: /again/i });
    const hardButton = screen.getByRole('button', { name: /hard/i });
    const goodButton = screen.getByRole('button', { name: /good/i });
    const easyButton = screen.getByRole('button', { name: /easy/i });
    
    expect(againButton).toHaveClass('bg-red-600');
    expect(hardButton).toHaveClass('bg-orange-600');
    expect(goodButton).toHaveClass('bg-green-600');
    expect(easyButton).toHaveClass('bg-blue-600');
  });

  it('should show keyboard shortcuts', () => {
    render(<AnswerButtons onAnswer={mockOnAnswer} />);
    
    expect(screen.getByText(/1/)).toBeInTheDocument(); // Again shortcut
    expect(screen.getByText(/2/)).toBeInTheDocument(); // Hard shortcut
    expect(screen.getByText(/3/)).toBeInTheDocument(); // Good shortcut
    expect(screen.getByText(/4/)).toBeInTheDocument(); // Easy shortcut
  });

  it('should handle keyboard events', () => {
    render(<AnswerButtons onAnswer={mockOnAnswer} />);
    
    fireEvent.keyDown(document, { key: '1' });
    expect(mockOnAnswer).toHaveBeenCalledWith(StudyQuality.AGAIN);
    
    fireEvent.keyDown(document, { key: '2' });
    expect(mockOnAnswer).toHaveBeenCalledWith(StudyQuality.HARD);
    
    fireEvent.keyDown(document, { key: '3' });
    expect(mockOnAnswer).toHaveBeenCalledWith(StudyQuality.GOOD);
    
    fireEvent.keyDown(document, { key: '4' });
    expect(mockOnAnswer).toHaveBeenCalledWith(StudyQuality.EASY);
  });
});
