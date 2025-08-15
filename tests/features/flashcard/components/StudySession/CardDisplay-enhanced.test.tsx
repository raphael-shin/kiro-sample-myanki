import { render, screen, fireEvent } from '@testing-library/react';
import { CardDisplay } from '@/features/flashcard/components/StudySession/CardDisplay';
import { Card } from '@/types/flashcard';

describe('CardDisplay Enhanced Features', () => {
  const mockCard: Card = {
    id: 1,
    deckId: 1,
    front: 'What is the capital of France?',
    back: 'Paris',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const mockOnShowAnswer = jest.fn();
  const defaultProps = {
    card: mockCard,
    showAnswer: false,
    onShowAnswer: mockOnShowAnswer,
    cardNumber: 5,
    totalCards: 20
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Enhanced Card Display', () => {
    it('should display improved card layout with progress header', () => {
      render(<CardDisplay {...defaultProps} />);
      
      expect(screen.getByText('Card 5 of 20')).toBeInTheDocument();
      expect(screen.getByText('25% Complete')).toBeInTheDocument();
      expect(screen.getByText('Question')).toBeInTheDocument();
      expect(screen.getByText('What is the capital of France?')).toBeInTheDocument();
    });

    it('should show both question and answer when showAnswer is true', () => {
      render(<CardDisplay {...defaultProps} showAnswer={true} />);
      
      expect(screen.getByText('Question')).toBeInTheDocument();
      expect(screen.getByText('What is the capital of France?')).toBeInTheDocument();
      expect(screen.getByText('Answer')).toBeInTheDocument();
      expect(screen.getByText('Paris')).toBeInTheDocument();
    });

    it('should have improved content styling with better readability', () => {
      render(<CardDisplay {...defaultProps} showAnswer={true} />);
      
      const questionContent = screen.getByText('What is the capital of France?');
      const answerContent = screen.getByText('Paris');
      
      expect(questionContent).toHaveClass('text-lg', 'leading-relaxed');
      expect(answerContent).toHaveClass('text-lg', 'leading-relaxed');
    });

    it('should show enhanced show answer button with transition', () => {
      render(<CardDisplay {...defaultProps} />);
      
      const showAnswerButton = screen.getByRole('button', { name: /show answer/i });
      expect(showAnswerButton).toHaveClass('transition-colors');
      expect(showAnswerButton).toHaveClass('px-6', 'py-3', 'bg-blue-600', 'text-white', 'rounded-lg');
    });

    it('should handle edge cases for progress calculation', () => {
      render(<CardDisplay {...defaultProps} cardNumber={1} totalCards={1} />);
      
      expect(screen.getByText('Card 1 of 1')).toBeInTheDocument();
      expect(screen.getByText('100% Complete')).toBeInTheDocument();
    });

    it('should handle zero progress correctly', () => {
      render(<CardDisplay {...defaultProps} cardNumber={0} totalCards={10} />);
      
      expect(screen.getByText('Card 0 of 10')).toBeInTheDocument();
      expect(screen.getByText('0% Complete')).toBeInTheDocument();
    });
  });

  describe('Content Formatting', () => {
    it('should handle multiline content properly', () => {
      const multilineCard: Card = {
        ...mockCard,
        front: 'Line 1\nLine 2\nLine 3',
        back: 'Answer Line 1\nAnswer Line 2'
      };
      
      render(<CardDisplay {...defaultProps} card={multilineCard} showAnswer={true} />);
      
      // Check that the card display renders with multiline content
      const cardDisplay = screen.getByTestId('card-display');
      expect(cardDisplay).toBeInTheDocument();
      
      // Check that Question and Answer sections are present
      expect(screen.getByText('Question')).toBeInTheDocument();
      expect(screen.getByText('Answer')).toBeInTheDocument();
      
      // Check that content containers have proper styling
      const contentDivs = cardDisplay.querySelectorAll('.text-lg.leading-relaxed');
      expect(contentDivs).toHaveLength(2); // One for question, one for answer
    });

    it('should handle empty content gracefully', () => {
      const emptyCard: Card = {
        ...mockCard,
        front: '',
        back: ''
      };
      
      render(<CardDisplay {...defaultProps} card={emptyCard} showAnswer={true} />);
      
      expect(screen.getByText('Question')).toBeInTheDocument();
      expect(screen.getByText('Answer')).toBeInTheDocument();
    });

    it('should handle special characters and HTML entities', () => {
      const specialCard: Card = {
        ...mockCard,
        front: 'What is 2 + 2 = ?',
        back: '4 & that\'s correct!'
      };
      
      render(<CardDisplay {...defaultProps} card={specialCard} showAnswer={true} />);
      
      expect(screen.getByText('What is 2 + 2 = ?')).toBeInTheDocument();
      expect(screen.getByText('4 & that\'s correct!')).toBeInTheDocument();
    });
  });

  describe('User Interaction', () => {
    it('should call onShowAnswer when button is clicked', () => {
      render(<CardDisplay {...defaultProps} />);
      
      const showAnswerButton = screen.getByRole('button', { name: /show answer/i });
      fireEvent.click(showAnswerButton);
      
      expect(mockOnShowAnswer).toHaveBeenCalledTimes(1);
    });

    it('should not show button when answer is already visible', () => {
      render(<CardDisplay {...defaultProps} showAnswer={true} />);
      
      expect(screen.queryByRole('button', { name: /show answer/i })).not.toBeInTheDocument();
    });

    it('should maintain focus accessibility', () => {
      render(<CardDisplay {...defaultProps} />);
      
      const showAnswerButton = screen.getByRole('button', { name: /show answer/i });
      showAnswerButton.focus();
      
      expect(document.activeElement).toBe(showAnswerButton);
    });
  });

  describe('Progress Display Features', () => {
    it('should display accurate progress information', () => {
      render(<CardDisplay {...defaultProps} cardNumber={7} totalCards={15} />);
      
      expect(screen.getByText('Card 7 of 15')).toBeInTheDocument();
      expect(screen.getByText('47% Complete')).toBeInTheDocument();
    });

    it('should handle first card correctly', () => {
      render(<CardDisplay {...defaultProps} cardNumber={1} totalCards={10} />);
      
      expect(screen.getByText('Card 1 of 10')).toBeInTheDocument();
      expect(screen.getByText('10% Complete')).toBeInTheDocument();
    });

    it('should handle last card correctly', () => {
      render(<CardDisplay {...defaultProps} cardNumber={10} totalCards={10} />);
      
      expect(screen.getByText('Card 10 of 10')).toBeInTheDocument();
      expect(screen.getByText('100% Complete')).toBeInTheDocument();
    });

    it('should round progress percentage correctly', () => {
      render(<CardDisplay {...defaultProps} cardNumber={1} totalCards={3} />);
      
      // 1/3 = 0.333... should round to 33%
      expect(screen.getByText('33% Complete')).toBeInTheDocument();
    });

    it('should handle large numbers correctly', () => {
      render(<CardDisplay {...defaultProps} cardNumber={999} totalCards={1000} />);
      
      expect(screen.getByText('Card 999 of 1000')).toBeInTheDocument();
      expect(screen.getByText('100% Complete')).toBeInTheDocument(); // 999/1000 = 99.9% rounds to 100%
    });

    it('should have proper styling for progress header', () => {
      render(<CardDisplay {...defaultProps} />);
      
      const progressHeader = screen.getByText('Card 5 of 20').parentElement;
      expect(progressHeader).toHaveClass('flex', 'justify-between', 'items-center', 'mb-6');
      
      const cardInfo = screen.getByText('Card 5 of 20');
      const progressInfo = screen.getByText('25% Complete');
      
      expect(cardInfo).toHaveClass('text-sm', 'text-gray-500');
      expect(progressInfo).toHaveClass('text-sm', 'text-gray-500');
    });
  });
});
