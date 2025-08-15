import { render, screen, fireEvent } from '@testing-library/react';
import { AnswerButtons } from '@/features/flashcard/components/StudySession/AnswerButtons';
import { StudyQuality } from '@/types/flashcard';

describe('AnswerButtons Enhanced Features', () => {
  const mockOnAnswer = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Structure', () => {
    it('should render 4 evaluation buttons with correct labels', () => {
      render(<AnswerButtons onAnswer={mockOnAnswer} />);
      
      expect(screen.getByRole('button', { name: /again/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /hard/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /good/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /easy/i })).toBeInTheDocument();
    });

    it('should have correct color styling for each button', () => {
      render(<AnswerButtons onAnswer={mockOnAnswer} />);
      
      const againButton = screen.getByRole('button', { name: /again/i });
      const hardButton = screen.getByRole('button', { name: /hard/i });
      const goodButton = screen.getByRole('button', { name: /good/i });
      const easyButton = screen.getByRole('button', { name: /easy/i });
      
      expect(againButton).toHaveClass('bg-red-500');
      expect(hardButton).toHaveClass('bg-orange-500');
      expect(goodButton).toHaveClass('bg-green-500');
      expect(easyButton).toHaveClass('bg-blue-500');
    });

    it('should call onAnswer with correct StudyQuality when buttons clicked', () => {
      render(<AnswerButtons onAnswer={mockOnAnswer} />);
      
      fireEvent.click(screen.getByRole('button', { name: /again/i }));
      expect(mockOnAnswer).toHaveBeenCalledWith(StudyQuality.AGAIN, expect.any(Number));
      
      fireEvent.click(screen.getByRole('button', { name: /hard/i }));
      expect(mockOnAnswer).toHaveBeenCalledWith(StudyQuality.HARD, expect.any(Number));
      
      fireEvent.click(screen.getByRole('button', { name: /good/i }));
      expect(mockOnAnswer).toHaveBeenCalledWith(StudyQuality.GOOD, expect.any(Number));
      
      fireEvent.click(screen.getByRole('button', { name: /easy/i }));
      expect(mockOnAnswer).toHaveBeenCalledWith(StudyQuality.EASY, expect.any(Number));
    });

    it('should have proper button layout and spacing', () => {
      render(<AnswerButtons onAnswer={mockOnAnswer} />);
      
      const container = screen.getByRole('button', { name: /again/i }).parentElement;
      expect(container).toHaveClass('flex', 'gap-2', 'justify-center');
    });
  });

  describe('Button States', () => {
    it('should disable all buttons when disabled prop is true', () => {
      render(<AnswerButtons onAnswer={mockOnAnswer} disabled={true} />);
      
      expect(screen.getByRole('button', { name: /again/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /hard/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /good/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /easy/i })).toBeDisabled();
    });

    it('should apply disabled styling when disabled', () => {
      render(<AnswerButtons onAnswer={mockOnAnswer} disabled={true} />);
      
      const againButton = screen.getByRole('button', { name: /again/i });
      expect(againButton).toHaveClass('bg-gray-400', 'cursor-not-allowed');
    });

    it('should not call onAnswer when disabled buttons are clicked', () => {
      render(<AnswerButtons onAnswer={mockOnAnswer} disabled={true} />);
      
      fireEvent.click(screen.getByRole('button', { name: /good/i }));
      expect(mockOnAnswer).not.toHaveBeenCalled();
    });

    it('should enable all buttons when disabled prop is false', () => {
      render(<AnswerButtons onAnswer={mockOnAnswer} disabled={false} />);
      
      expect(screen.getByRole('button', { name: /again/i })).not.toBeDisabled();
      expect(screen.getByRole('button', { name: /hard/i })).not.toBeDisabled();
      expect(screen.getByRole('button', { name: /good/i })).not.toBeDisabled();
      expect(screen.getByRole('button', { name: /easy/i })).not.toBeDisabled();
    });
  });

  describe('Response Time Measurement', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should measure response time when button is clicked', () => {
      const mockOnAnswerWithTime = jest.fn();
      render(<AnswerButtons onAnswer={mockOnAnswerWithTime} />);
      
      // Advance time by 3 seconds
      jest.advanceTimersByTime(3000);
      
      fireEvent.click(screen.getByRole('button', { name: /good/i }));
      
      expect(mockOnAnswerWithTime).toHaveBeenCalledWith(StudyQuality.GOOD, expect.any(Number));
      
      // Check that response time is approximately 3000ms
      const [, responseTime] = mockOnAnswerWithTime.mock.calls[0];
      expect(responseTime).toBeGreaterThan(2900);
      expect(responseTime).toBeLessThan(3100);
    });

    it('should reset response time measurement for each new answer', () => {
      const mockOnAnswerWithTime = jest.fn();
      render(<AnswerButtons onAnswer={mockOnAnswerWithTime} />);
      
      // First answer after 2 seconds
      jest.advanceTimersByTime(2000);
      fireEvent.click(screen.getByRole('button', { name: /hard/i }));
      
      // Second answer after additional 1 second (total 3 seconds from start)
      jest.advanceTimersByTime(1000);
      fireEvent.click(screen.getByRole('button', { name: /easy/i }));
      
      expect(mockOnAnswerWithTime).toHaveBeenCalledTimes(2);
      
      // Check first call response time (should be around 2000ms)
      const [, firstResponseTime] = mockOnAnswerWithTime.mock.calls[0];
      expect(firstResponseTime).toBeGreaterThan(1900);
      expect(firstResponseTime).toBeLessThan(2100);
      
      // Check second call response time (should be around 1000ms from first click)
      const [, secondResponseTime] = mockOnAnswerWithTime.mock.calls[1];
      expect(secondResponseTime).toBeGreaterThan(900);
      expect(secondResponseTime).toBeLessThan(1100);
    });

    it('should handle rapid successive clicks correctly', () => {
      const mockOnAnswerWithTime = jest.fn();
      render(<AnswerButtons onAnswer={mockOnAnswerWithTime} />);
      
      // Click multiple buttons rapidly
      fireEvent.click(screen.getByRole('button', { name: /again/i }));
      fireEvent.click(screen.getByRole('button', { name: /good/i }));
      
      expect(mockOnAnswerWithTime).toHaveBeenCalledTimes(2);
      expect(mockOnAnswerWithTime).toHaveBeenNthCalledWith(1, StudyQuality.AGAIN, expect.any(Number));
      expect(mockOnAnswerWithTime).toHaveBeenNthCalledWith(2, StudyQuality.GOOD, expect.any(Number));
    });
  });

  describe('Button State Management', () => {
    it('should maintain button state during interactions', () => {
      render(<AnswerButtons onAnswer={mockOnAnswer} />);
      
      const buttons = [
        screen.getByRole('button', { name: /again/i }),
        screen.getByRole('button', { name: /hard/i }),
        screen.getByRole('button', { name: /good/i }),
        screen.getByRole('button', { name: /easy/i })
      ];
      
      // All buttons should be enabled initially
      buttons.forEach(button => {
        expect(button).not.toBeDisabled();
        expect(button).not.toHaveClass('bg-gray-400');
      });
    });

    it('should handle hover states correctly', () => {
      render(<AnswerButtons onAnswer={mockOnAnswer} />);
      
      const againButton = screen.getByRole('button', { name: /again/i });
      const hardButton = screen.getByRole('button', { name: /hard/i });
      const goodButton = screen.getByRole('button', { name: /good/i });
      const easyButton = screen.getByRole('button', { name: /easy/i });
      
      expect(againButton).toHaveClass('hover:bg-red-600');
      expect(hardButton).toHaveClass('hover:bg-orange-600');
      expect(goodButton).toHaveClass('hover:bg-green-600');
      expect(easyButton).toHaveClass('hover:bg-blue-600');
    });

    it('should not have hover states when disabled', () => {
      render(<AnswerButtons onAnswer={mockOnAnswer} disabled={true} />);
      
      const buttons = [
        screen.getByRole('button', { name: /again/i }),
        screen.getByRole('button', { name: /hard/i }),
        screen.getByRole('button', { name: /good/i }),
        screen.getByRole('button', { name: /easy/i })
      ];
      
      buttons.forEach(button => {
        expect(button).not.toHaveClass('hover:bg-red-600');
        expect(button).not.toHaveClass('hover:bg-orange-600');
        expect(button).not.toHaveClass('hover:bg-green-600');
        expect(button).not.toHaveClass('hover:bg-blue-600');
      });
    });

    it('should have consistent styling across all buttons', () => {
      render(<AnswerButtons onAnswer={mockOnAnswer} />);
      
      const buttons = [
        screen.getByRole('button', { name: /again/i }),
        screen.getByRole('button', { name: /hard/i }),
        screen.getByRole('button', { name: /good/i }),
        screen.getByRole('button', { name: /easy/i })
      ];
      
      buttons.forEach(button => {
        expect(button).toHaveClass('px-4', 'py-2', 'text-white', 'rounded-md', 'font-medium', 'transition-colors');
      });
    });
  });
});
