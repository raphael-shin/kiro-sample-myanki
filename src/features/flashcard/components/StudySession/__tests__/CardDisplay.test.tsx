import { render, screen, fireEvent } from '@testing-library/react';
import { CardDisplay } from '../CardDisplay';
import { Card } from '../../../../types/flashcard';

describe('CardDisplay Component', () => {
  const mockCard: Card = {
    id: 1,
    deckId: 1,
    front: 'Test front content',
    back: 'Test back content',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const mockOnShowAnswer = jest.fn();
  const defaultProps = {
    card: mockCard,
    showAnswer: false,
    onShowAnswer: mockOnShowAnswer,
    cardNumber: 1,
    totalCards: 10
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should display front content only initially', () => {
    render(<CardDisplay {...defaultProps} />);
    
    expect(screen.getByText('Test front content')).toBeInTheDocument();
    expect(screen.queryByText('Test back content')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /show answer/i })).toBeInTheDocument();
  });

  it('should display both front and back when showAnswer is true', () => {
    render(<CardDisplay {...defaultProps} showAnswer={true} />);
    
    expect(screen.getByText('Test front content')).toBeInTheDocument();
    expect(screen.getByText('Test back content')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /show answer/i })).not.toBeInTheDocument();
  });

  it('should call onShowAnswer when show answer button clicked', () => {
    render(<CardDisplay {...defaultProps} />);
    
    const showAnswerButton = screen.getByRole('button', { name: /show answer/i });
    fireEvent.click(showAnswerButton);
    
    expect(mockOnShowAnswer).toHaveBeenCalledTimes(1);
  });

  it('should have proper card styling', () => {
    render(<CardDisplay {...defaultProps} />);
    
    const cardElement = screen.getByTestId('card-display');
    expect(cardElement).toHaveClass('bg-white', 'rounded-lg', 'shadow-lg');
  });

  it('should handle long content properly', () => {
    const longCard: Card = {
      ...mockCard,
      front: 'a'.repeat(500),
      back: 'b'.repeat(500)
    };
    
    render(<CardDisplay {...defaultProps} card={longCard} showAnswer={true} />);
    
    expect(screen.getByText(/aaa/)).toBeInTheDocument();
    expect(screen.getByText(/bbb/)).toBeInTheDocument();
  });

  it('should have accessible labels', () => {
    render(<CardDisplay {...defaultProps} showAnswer={true} />);
    
    expect(screen.getByText('Question')).toBeInTheDocument();
    expect(screen.getByText('Answer')).toBeInTheDocument();
  });

  it('should display card progress information', () => {
    render(<CardDisplay {...defaultProps} cardNumber={3} totalCards={10} />);
    
    expect(screen.getByText('Card 3 of 10')).toBeInTheDocument();
    expect(screen.getByText('30% Complete')).toBeInTheDocument();
  });
});
