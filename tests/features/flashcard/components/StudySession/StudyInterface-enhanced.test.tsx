import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { StudyInterface } from '@/features/flashcard/components/StudySession/StudyInterface';
import { useStudySessionStore, setSessionManager, setSpacedRepetitionService } from '@/store/StudySessionStore';
import { StudyQuality } from '@/types/flashcard';

// Mock the store
jest.mock('@/store/StudySessionStore');

describe('StudyInterface Enhanced Features', () => {
  const mockOnComplete = jest.fn();
  const mockOnExit = jest.fn();
  let mockStoreActions: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockStoreActions = {
      startSession: jest.fn(),
      endSession: jest.fn(),
      pauseSession: jest.fn(),
      resumeSession: jest.fn(),
      showCardAnswer: jest.fn(),
      processAnswer: jest.fn(),
      nextCard: jest.fn(),
      enableKeyboardShortcuts: jest.fn()
    };

    // Mock useStudySessionStore with enhanced features
    (useStudySessionStore as jest.Mock).mockReturnValue({
      currentCard: { id: 1, deckId: 1, front: 'Test Question', back: 'Test Answer' },
      isActive: true,
      loading: false,
      error: null,
      sessionStats: { cardsStudied: 1, correctAnswers: 1, totalTime: 5000 },
      showAnswer: false,
      isPaused: false,
      keyboardShortcutsEnabled: true,
      getProgress: jest.fn().mockReturnValue({
        percentage: 25,
        cardsRemaining: 3,
        totalCards: 4
      }),
      ...mockStoreActions
    });
  });

  describe('StudySessionStore Integration', () => {
    it('should start session on mount', async () => {
      render(
        <StudyInterface 
          deckId={1}
          onComplete={mockOnComplete}
          onExit={mockOnExit}
        />
      );
      
      await waitFor(() => {
        expect(mockStoreActions.startSession).toHaveBeenCalledWith(1);
      });
    });

    it('should show card answer when show answer is clicked', async () => {
      render(
        <StudyInterface 
          deckId={1}
          onComplete={mockOnComplete}
          onExit={mockOnExit}
        />
      );
      
      const showAnswerButton = screen.getByText('Show Answer');
      fireEvent.click(showAnswerButton);
      
      expect(mockStoreActions.showCardAnswer).toHaveBeenCalled();
    });

    it('should process answer and move to next card', async () => {
      // Mock showAnswer as true to show answer buttons
      (useStudySessionStore as jest.Mock).mockReturnValue({
        currentCard: { id: 1, deckId: 1, front: 'Test Question', back: 'Test Answer' },
        isActive: true,
        loading: false,
        error: null,
        sessionStats: { cardsStudied: 1, correctAnswers: 1, totalTime: 5000 },
        showAnswer: true,
        isPaused: false,
        keyboardShortcutsEnabled: true,
        getProgress: jest.fn().mockReturnValue({
          percentage: 25,
          cardsRemaining: 3,
          totalCards: 4
        }),
        ...mockStoreActions
      });

      render(
        <StudyInterface 
          deckId={1}
          onComplete={mockOnComplete}
          onExit={mockOnExit}
        />
      );
      
      const goodButton = screen.getByText('Good');
      fireEvent.click(goodButton);
      
      expect(mockStoreActions.processAnswer).toHaveBeenCalledWith(StudyQuality.GOOD, expect.any(Number));
      expect(mockStoreActions.nextCard).toHaveBeenCalled();
    });
  });

  describe('Session Controls', () => {
    it('should pause session when pause button clicked', async () => {
      render(
        <StudyInterface 
          deckId={1}
          onComplete={mockOnComplete}
          onExit={mockOnExit}
        />
      );
      
      const pauseButton = screen.getByText('Pause');
      fireEvent.click(pauseButton);
      
      expect(mockStoreActions.pauseSession).toHaveBeenCalled();
    });

    it('should resume session when resume button clicked', async () => {
      // Mock paused state
      (useStudySessionStore as jest.Mock).mockReturnValue({
        currentCard: { id: 1, deckId: 1, front: 'Test Question', back: 'Test Answer' },
        isActive: true,
        loading: false,
        error: null,
        sessionStats: { cardsStudied: 1, correctAnswers: 1, totalTime: 5000 },
        showAnswer: false,
        isPaused: true,
        keyboardShortcutsEnabled: true,
        getProgress: jest.fn().mockReturnValue({
          percentage: 25,
          cardsRemaining: 3,
          totalCards: 4
        }),
        ...mockStoreActions
      });

      render(
        <StudyInterface 
          deckId={1}
          onComplete={mockOnComplete}
          onExit={mockOnExit}
        />
      );
      
      const resumeButton = screen.getByText('Resume');
      fireEvent.click(resumeButton);
      
      expect(mockStoreActions.resumeSession).toHaveBeenCalled();
    });

    it('should toggle keyboard shortcuts', async () => {
      render(
        <StudyInterface 
          deckId={1}
          onComplete={mockOnComplete}
          onExit={mockOnExit}
        />
      );
      
      const shortcutsButton = screen.getByText('Shortcuts');
      fireEvent.click(shortcutsButton);
      
      expect(mockStoreActions.enableKeyboardShortcuts).toHaveBeenCalledWith(false);
    });

    it('should show exit confirmation and end session', async () => {
      // Mock window.confirm
      const originalConfirm = window.confirm;
      window.confirm = jest.fn().mockReturnValue(true);

      render(
        <StudyInterface 
          deckId={1}
          onComplete={mockOnComplete}
          onExit={mockOnExit}
        />
      );
      
      const exitButton = screen.getByText('Exit');
      fireEvent.click(exitButton);
      
      expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to exit? Your progress will be saved.');
      expect(mockStoreActions.endSession).toHaveBeenCalled();
      expect(mockOnExit).toHaveBeenCalled();

      // Restore original confirm
      window.confirm = originalConfirm;
    });
  });

  describe('Session Completion', () => {
    it('should call onComplete with session summary when session ends', async () => {
      // Mock showAnswer as true and simulate session completion
      (useStudySessionStore as jest.Mock).mockReturnValue({
        currentCard: null, // No current card means session complete
        isActive: true,
        loading: false,
        error: null,
        sessionStats: { cardsStudied: 4, correctAnswers: 3, totalTime: 20000 },
        showAnswer: true,
        isPaused: false,
        keyboardShortcutsEnabled: true,
        getProgress: jest.fn().mockReturnValue({
          percentage: 100,
          cardsRemaining: 0,
          totalCards: 4
        }),
        ...mockStoreActions
      });

      // Mock processAnswer to simulate completion
      mockStoreActions.processAnswer.mockImplementation(() => {
        // Simulate session completion by setting currentCard to null
        (useStudySessionStore as jest.Mock).mockReturnValue({
          currentCard: null,
          isActive: true,
          loading: false,
          error: null,
          sessionStats: { cardsStudied: 4, correctAnswers: 3, totalTime: 20000 },
          showAnswer: true,
          isPaused: false,
          keyboardShortcutsEnabled: true,
          getProgress: jest.fn().mockReturnValue({
            percentage: 100,
            cardsRemaining: 0,
            totalCards: 4
          }),
          ...mockStoreActions
        });
      });

      render(
        <StudyInterface 
          deckId={1}
          onComplete={mockOnComplete}
          onExit={mockOnExit}
        />
      );
      
      // Should show session complete screen
      expect(screen.getByText('Session Complete!')).toBeInTheDocument();
    });
  });

  describe('Progress Display', () => {
    it('should display progress information', async () => {
      render(
        <StudyInterface 
          deckId={1}
          onComplete={mockOnComplete}
          onExit={mockOnExit}
        />
      );
      
      // Progress component should be rendered with correct props
      await waitFor(() => {
        // The StudyProgress component should receive the progress data
        expect(screen.getByText('25%')).toBeInTheDocument();
      });
    });
  });

  describe('Keyboard Shortcuts', () => {
    it('should show answer on spacebar press', async () => {
      render(
        <StudyInterface 
          deckId={1}
          onComplete={mockOnComplete}
          onExit={mockOnExit}
        />
      );
      
      fireEvent.keyDown(document, { key: ' ' });
      
      expect(mockStoreActions.showCardAnswer).toHaveBeenCalled();
    });

    it('should rate card with number keys when answer is shown', async () => {
      // Mock showAnswer as true
      (useStudySessionStore as jest.Mock).mockReturnValue({
        currentCard: { id: 1, deckId: 1, front: 'Test Question', back: 'Test Answer' },
        isActive: true,
        loading: false,
        error: null,
        sessionStats: { cardsStudied: 1, correctAnswers: 1, totalTime: 5000 },
        showAnswer: true,
        isPaused: false,
        keyboardShortcutsEnabled: true,
        getProgress: jest.fn().mockReturnValue({
          percentage: 25,
          cardsRemaining: 3,
          totalCards: 4
        }),
        ...mockStoreActions
      });

      render(
        <StudyInterface 
          deckId={1}
          onComplete={mockOnComplete}
          onExit={mockOnExit}
        />
      );
      
      // Test all rating keys
      fireEvent.keyDown(document, { key: '1' });
      expect(mockStoreActions.processAnswer).toHaveBeenCalledWith(StudyQuality.AGAIN, expect.any(Number));
      
      fireEvent.keyDown(document, { key: '2' });
      expect(mockStoreActions.processAnswer).toHaveBeenCalledWith(StudyQuality.HARD, expect.any(Number));
      
      fireEvent.keyDown(document, { key: '3' });
      expect(mockStoreActions.processAnswer).toHaveBeenCalledWith(StudyQuality.GOOD, expect.any(Number));
      
      fireEvent.keyDown(document, { key: '4' });
      expect(mockStoreActions.processAnswer).toHaveBeenCalledWith(StudyQuality.EASY, expect.any(Number));
    });

    it('should not trigger shortcuts when disabled', async () => {
      // Mock shortcuts disabled
      (useStudySessionStore as jest.Mock).mockReturnValue({
        currentCard: { id: 1, deckId: 1, front: 'Test Question', back: 'Test Answer' },
        isActive: true,
        loading: false,
        error: null,
        sessionStats: { cardsStudied: 1, correctAnswers: 1, totalTime: 5000 },
        showAnswer: false,
        isPaused: false,
        keyboardShortcutsEnabled: false,
        getProgress: jest.fn().mockReturnValue({
          percentage: 25,
          cardsRemaining: 3,
          totalCards: 4
        }),
        ...mockStoreActions
      });

      render(
        <StudyInterface 
          deckId={1}
          onComplete={mockOnComplete}
          onExit={mockOnExit}
        />
      );
      
      fireEvent.keyDown(document, { key: ' ' });
      
      expect(mockStoreActions.showCardAnswer).not.toHaveBeenCalled();
    });

    it('should not trigger shortcuts in input fields', async () => {
      render(
        <div>
          <input data-testid="test-input" />
          <StudyInterface 
            deckId={1}
            onComplete={mockOnComplete}
            onExit={mockOnExit}
          />
        </div>
      );
      
      const input = screen.getByTestId('test-input');
      input.focus();
      
      fireEvent.keyDown(input, { key: ' ' });
      
      expect(mockStoreActions.showCardAnswer).not.toHaveBeenCalled();
    });

    it('should show keyboard shortcuts help when enabled', async () => {
      render(
        <StudyInterface 
          deckId={1}
          onComplete={mockOnComplete}
          onExit={mockOnExit}
        />
      );
      
      expect(screen.getByText(/Shortcuts: Space/)).toBeInTheDocument();
    });

    it('should not show keyboard shortcuts help when disabled', async () => {
      // Mock shortcuts disabled
      (useStudySessionStore as jest.Mock).mockReturnValue({
        currentCard: { id: 1, deckId: 1, front: 'Test Question', back: 'Test Answer' },
        isActive: true,
        loading: false,
        error: null,
        sessionStats: { cardsStudied: 1, correctAnswers: 1, totalTime: 5000 },
        showAnswer: false,
        isPaused: false,
        keyboardShortcutsEnabled: false,
        getProgress: jest.fn().mockReturnValue({
          percentage: 25,
          cardsRemaining: 3,
          totalCards: 4
        }),
        ...mockStoreActions
      });

      render(
        <StudyInterface 
          deckId={1}
          onComplete={mockOnComplete}
          onExit={mockOnExit}
        />
      );
      
      expect(screen.queryByText(/Shortcuts: Space/)).not.toBeInTheDocument();
    });
  });

  describe('Session Control UI', () => {
    it('should disable answer buttons when paused', async () => {
      // Mock paused state with answer shown
      (useStudySessionStore as jest.Mock).mockReturnValue({
        currentCard: { id: 1, deckId: 1, front: 'Test Question', back: 'Test Answer' },
        isActive: true,
        loading: false,
        error: null,
        sessionStats: { cardsStudied: 1, correctAnswers: 1, totalTime: 5000 },
        showAnswer: true,
        isPaused: true,
        keyboardShortcutsEnabled: true,
        getProgress: jest.fn().mockReturnValue({
          percentage: 25,
          cardsRemaining: 3,
          totalCards: 4
        }),
        ...mockStoreActions
      });

      render(
        <StudyInterface 
          deckId={1}
          onComplete={mockOnComplete}
          onExit={mockOnExit}
        />
      );
      
      const goodButton = screen.getByText('Good');
      expect(goodButton).toBeDisabled();
    });

    it('should show confirmation dialog on exit', async () => {
      const originalConfirm = window.confirm;
      window.confirm = jest.fn().mockReturnValue(false); // User cancels

      render(
        <StudyInterface 
          deckId={1}
          onComplete={mockOnComplete}
          onExit={mockOnExit}
        />
      );
      
      const exitButton = screen.getByText('Exit');
      fireEvent.click(exitButton);
      
      expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to exit? Your progress will be saved.');
      expect(mockStoreActions.endSession).not.toHaveBeenCalled();
      expect(mockOnExit).not.toHaveBeenCalled();

      window.confirm = originalConfirm;
    });

    it('should show shortcuts button with correct state', async () => {
      render(
        <StudyInterface 
          deckId={1}
          onComplete={mockOnComplete}
          onExit={mockOnExit}
        />
      );
      
      const shortcutsButton = screen.getByText('Shortcuts');
      expect(shortcutsButton).toHaveClass('text-blue-600', 'border-blue-600');
    });

    it('should show shortcuts button as inactive when disabled', async () => {
      // Mock shortcuts disabled
      (useStudySessionStore as jest.Mock).mockReturnValue({
        currentCard: { id: 1, deckId: 1, front: 'Test Question', back: 'Test Answer' },
        isActive: true,
        loading: false,
        error: null,
        sessionStats: { cardsStudied: 1, correctAnswers: 1, totalTime: 5000 },
        showAnswer: false,
        isPaused: false,
        keyboardShortcutsEnabled: false,
        getProgress: jest.fn().mockReturnValue({
          percentage: 25,
          cardsRemaining: 3,
          totalCards: 4
        }),
        ...mockStoreActions
      });

      render(
        <StudyInterface 
          deckId={1}
          onComplete={mockOnComplete}
          onExit={mockOnExit}
        />
      );
      
      const shortcutsButton = screen.getByText('Shortcuts');
      expect(shortcutsButton).toHaveClass('text-gray-600', 'border-gray-300');
    });
  });

  describe('Session Completion Handling', () => {
    it('should handle session completion with proper summary', async () => {
      const mockProcessAnswer = jest.fn();
      const mockNextCard = jest.fn();

      // Initial state with current card
      (useStudySessionStore as jest.Mock).mockReturnValue({
        currentCard: { id: 1, deckId: 1, front: 'Last Question', back: 'Last Answer' },
        isActive: true,
        loading: false,
        error: null,
        sessionStats: { cardsStudied: 3, correctAnswers: 2, totalTime: 15000 },
        showAnswer: true,
        isPaused: false,
        keyboardShortcutsEnabled: true,
        getProgress: jest.fn().mockReturnValue({
          percentage: 75,
          cardsRemaining: 1,
          totalCards: 4
        }),
        startSession: mockStoreActions.startSession,
        endSession: mockStoreActions.endSession,
        pauseSession: mockStoreActions.pauseSession,
        resumeSession: mockStoreActions.resumeSession,
        showCardAnswer: mockStoreActions.showCardAnswer,
        processAnswer: mockProcessAnswer,
        nextCard: mockNextCard,
        enableKeyboardShortcuts: mockStoreActions.enableKeyboardShortcuts
      });

      // Mock processAnswer and nextCard to simulate completion
      mockProcessAnswer.mockImplementation(() => {
        // After processing, simulate no current card (session complete)
        (useStudySessionStore as jest.Mock).mockReturnValue({
          currentCard: null,
          isActive: true,
          loading: false,
          error: null,
          sessionStats: { cardsStudied: 4, correctAnswers: 3, totalTime: 20000 },
          showAnswer: false,
          isPaused: false,
          keyboardShortcutsEnabled: true,
          getProgress: jest.fn().mockReturnValue({
            percentage: 100,
            cardsRemaining: 0,
            totalCards: 4
          }),
          startSession: mockStoreActions.startSession,
          endSession: mockStoreActions.endSession,
          pauseSession: mockStoreActions.pauseSession,
          resumeSession: mockStoreActions.resumeSession,
          showCardAnswer: mockStoreActions.showCardAnswer,
          processAnswer: mockProcessAnswer,
          nextCard: mockNextCard,
          enableKeyboardShortcuts: mockStoreActions.enableKeyboardShortcuts
        });
      });

      mockNextCard.mockImplementation(() => {
        // Trigger re-render to show completion
      });

      const { rerender } = render(
        <StudyInterface 
          deckId={1}
          onComplete={mockOnComplete}
          onExit={mockOnExit}
        />
      );
      
      const goodButton = screen.getByText('Good');
      fireEvent.click(goodButton);
      
      // Re-render to simulate state change
      rerender(
        <StudyInterface 
          deckId={1}
          onComplete={mockOnComplete}
          onExit={mockOnExit}
        />
      );

      expect(mockProcessAnswer).toHaveBeenCalledWith(StudyQuality.GOOD, expect.any(Number));
      expect(mockNextCard).toHaveBeenCalled();
    });

    it('should show completion screen with return button', async () => {
      // Mock completed session state
      (useStudySessionStore as jest.Mock).mockReturnValue({
        currentCard: null,
        isActive: true,
        loading: false,
        error: null,
        sessionStats: { cardsStudied: 4, correctAnswers: 3, totalTime: 20000 },
        showAnswer: false,
        isPaused: false,
        keyboardShortcutsEnabled: true,
        getProgress: jest.fn().mockReturnValue({
          percentage: 100,
          cardsRemaining: 0,
          totalCards: 4
        }),
        ...mockStoreActions
      });

      render(
        <StudyInterface 
          deckId={1}
          onComplete={mockOnComplete}
          onExit={mockOnExit}
        />
      );
      
      expect(screen.getByText('Session Complete!')).toBeInTheDocument();
      expect(screen.getByText("You've finished studying all available cards.")).toBeInTheDocument();
      
      const returnButton = screen.getByText('Return to Deck');
      fireEvent.click(returnButton);
      
      expect(mockOnExit).toHaveBeenCalled();
    });

    it('should handle error state gracefully', async () => {
      // Mock error state
      (useStudySessionStore as jest.Mock).mockReturnValue({
        currentCard: null,
        isActive: false,
        loading: false,
        error: 'Failed to load study session',
        sessionStats: { cardsStudied: 0, correctAnswers: 0, totalTime: 0 },
        showAnswer: false,
        isPaused: false,
        keyboardShortcutsEnabled: true,
        getProgress: jest.fn().mockReturnValue({
          percentage: 0,
          cardsRemaining: 0,
          totalCards: 0
        }),
        ...mockStoreActions
      });

      render(
        <StudyInterface 
          deckId={1}
          onComplete={mockOnComplete}
          onExit={mockOnExit}
        />
      );
      
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText('Failed to load study session')).toBeInTheDocument();
      
      const goBackButton = screen.getByText('Go Back');
      fireEvent.click(goBackButton);
      
      expect(mockOnExit).toHaveBeenCalled();
    });
  });
});
