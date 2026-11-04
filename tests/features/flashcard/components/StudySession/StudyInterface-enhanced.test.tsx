import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { StudyInterface } from '@/features/flashcard/components/StudySession/StudyInterface';
import { useStudySessionStore } from '@/store/StudySessionStore';
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
    (useStudySessionStore as unknown as jest.Mock).mockReturnValue({
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
      // Mock initial inactive state
      (useStudySessionStore as unknown as jest.Mock).mockReturnValue({
        currentCard: null,
        isActive: false, // Initially inactive
        loading: false,
        error: null,
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
      
      expect(mockStoreActions.startSession).toHaveBeenCalledWith(1);
    });

    it('should show card answer when show answer is clicked', async () => {
      render(
        <StudyInterface 
          deckId={1}
          onComplete={mockOnComplete}
          onExit={mockOnExit}
        />
      );
      
      const showAnswerButton = screen.getByRole('button', { name: '답 보기' });
      fireEvent.click(showAnswerButton);
      
      expect(mockStoreActions.showCardAnswer).toHaveBeenCalled();
    });

    it('should process answer and move to next card', async () => {
      // Mock showAnswer as true to show answer buttons
      (useStudySessionStore as unknown as jest.Mock).mockReturnValue({
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

      jest.useFakeTimers();
      render(
        <StudyInterface 
          deckId={1}
          onComplete={mockOnComplete}
          onExit={mockOnExit}
        />
      );
      
      const goodButton = screen.getByRole('button', { name: /보통/ });
      fireEvent.click(goodButton);

      // 답변 후 피드백 메시지를 1초 보여준 뒤 다음 카드로 넘어간다
      expect(screen.getByText('다음 복습까지 1일 후')).toBeInTheDocument();
      expect(mockStoreActions.processAnswer).not.toHaveBeenCalled();
      await act(async () => {
        jest.advanceTimersByTime(1000);
      });
      jest.useRealTimers();
      
      // Wait for async operations
      await waitFor(() => {
        expect(mockStoreActions.processAnswer).toHaveBeenCalledWith(StudyQuality.GOOD, expect.any(Number));
      });
      
      await waitFor(() => {
        expect(mockStoreActions.nextCard).toHaveBeenCalled();
      });
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
      
      const pauseButton = screen.getByTitle('일시정지');
      fireEvent.click(pauseButton);
      
      expect(mockStoreActions.pauseSession).toHaveBeenCalled();
    });

    it('should resume session when resume button clicked', async () => {
      // Mock paused state
      (useStudySessionStore as unknown as jest.Mock).mockReturnValue({
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
      
      const resumeButton = screen.getByTitle('재개');
      fireEvent.click(resumeButton);
      
      expect(mockStoreActions.resumeSession).toHaveBeenCalled();
    });

    it('should stop handling shortcuts when keyboard shortcuts are turned off', async () => {
      // 단축키 토글 버튼은 제거되었고(기본 활성화), 스토어의 keyboardShortcutsEnabled가 동작을 결정한다
      const { rerender } = render(
        <StudyInterface 
          deckId={1}
          onComplete={mockOnComplete}
          onExit={mockOnExit}
        />
      );

      fireEvent.keyDown(document, { key: ' ' });
      expect(mockStoreActions.showCardAnswer).toHaveBeenCalledTimes(1);

      (useStudySessionStore as unknown as jest.Mock).mockReturnValue({
        ...(useStudySessionStore as unknown as jest.Mock)(),
        keyboardShortcutsEnabled: false
      });
      rerender(
        <StudyInterface 
          deckId={1}
          onComplete={mockOnComplete}
          onExit={mockOnExit}
        />
      );

      fireEvent.keyDown(document, { key: ' ' });
      expect(mockStoreActions.showCardAnswer).toHaveBeenCalledTimes(1);
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
      
      const exitButton = screen.getByTitle('종료');
      fireEvent.click(exitButton);
      
      expect(window.confirm).toHaveBeenCalledWith('학습을 종료하시겠습니까? 진행률은 저장됩니다.');
      expect(mockStoreActions.endSession).toHaveBeenCalled();
      expect(mockOnExit).toHaveBeenCalled();

      // Restore original confirm
      window.confirm = originalConfirm;
    });
  });

  describe('Session Completion', () => {
    it('should call onComplete when the session complete button is clicked', async () => {
      // Mock showAnswer as true and simulate session completion
      (useStudySessionStore as unknown as jest.Mock).mockReturnValue({
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
        (useStudySessionStore as unknown as jest.Mock).mockReturnValue({
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
      expect(screen.getByText('학습 완료!')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: '완료' }));
      expect(mockStoreActions.endSession).toHaveBeenCalled();
      expect(mockOnComplete).toHaveBeenCalled();
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
        expect(screen.getByText('1/4 (25%)')).toBeInTheDocument();
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
      (useStudySessionStore as unknown as jest.Mock).mockReturnValue({
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

      jest.useFakeTimers();
      render(
        <StudyInterface 
          deckId={1}
          onComplete={mockOnComplete}
          onExit={mockOnExit}
        />
      );
      
      // Test all rating keys (each answer is processed after the 1s feedback message)
      const keys: Array<[string, StudyQuality]> = [
        ['1', StudyQuality.AGAIN],
        ['2', StudyQuality.HARD],
        ['3', StudyQuality.GOOD],
        ['4', StudyQuality.EASY]
      ];
      for (const [key, quality] of keys) {
        fireEvent.keyDown(document, { key });
        await act(async () => {
          jest.advanceTimersByTime(1000);
        });
        expect(mockStoreActions.processAnswer).toHaveBeenLastCalledWith(quality, expect.any(Number));
      }
      expect(mockStoreActions.processAnswer).toHaveBeenCalledTimes(4);
      jest.useRealTimers();
    });

    it('should not trigger shortcuts when disabled', async () => {
      // Mock shortcuts disabled
      (useStudySessionStore as unknown as jest.Mock).mockReturnValue({
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

    it('should still handle shortcuts pressed outside input fields', async () => {
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

      fireEvent.keyDown(screen.getByTestId('test-input'), { key: ' ' });
      expect(mockStoreActions.showCardAnswer).not.toHaveBeenCalled();

      fireEvent.keyDown(document.body, { key: ' ' });
      expect(mockStoreActions.showCardAnswer).toHaveBeenCalledTimes(1);
    });

    it('should not rate the card with number keys typed in a textarea', async () => {
      (useStudySessionStore as unknown as jest.Mock).mockReturnValue({
        ...(useStudySessionStore as unknown as jest.Mock)(),
        showAnswer: true
      });

      jest.useFakeTimers();
      render(
        <div>
          <textarea data-testid="test-textarea" />
          <StudyInterface 
            deckId={1}
            onComplete={mockOnComplete}
            onExit={mockOnExit}
          />
        </div>
      );

      fireEvent.keyDown(screen.getByTestId('test-textarea'), { key: '3' });
      await act(async () => {
        jest.advanceTimersByTime(1000);
      });
      jest.useRealTimers();

      expect(mockStoreActions.processAnswer).not.toHaveBeenCalled();
      expect(screen.queryByText('다음 복습까지 1일 후')).not.toBeInTheDocument();
    });

    it('should hide every shortcut hint when shortcuts are disabled', async () => {
      const disabledState = {
        ...(useStudySessionStore as unknown as jest.Mock)(),
        keyboardShortcutsEnabled: false
      };

      // Question side: Space/Enter hint and button tooltip
      (useStudySessionStore as unknown as jest.Mock).mockReturnValue(disabledState);
      const { rerender } = render(
        <StudyInterface 
          deckId={1}
          onComplete={mockOnComplete}
          onExit={mockOnExit}
        />
      );
      expect(screen.queryByText('Space 또는 Enter')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: '답 보기' })).not.toHaveAttribute('title');

      // Answer side: number key hint
      (useStudySessionStore as unknown as jest.Mock).mockReturnValue({ ...disabledState, showAnswer: true });
      rerender(
        <StudyInterface 
          deckId={1}
          onComplete={mockOnComplete}
          onExit={mockOnExit}
        />
      );
      expect(screen.queryByText('1: 다시, 2: 어려움, 3: 보통, 4: 쉬움')).not.toBeInTheDocument();
    });

    it('should show every shortcut hint when shortcuts are enabled', async () => {
      const { rerender } = render(
        <StudyInterface 
          deckId={1}
          onComplete={mockOnComplete}
          onExit={mockOnExit}
        />
      );
      expect(screen.getByText('Space 또는 Enter')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '답 보기' })).toHaveAttribute('title', 'Space 또는 Enter로 답 보기');

      (useStudySessionStore as unknown as jest.Mock).mockReturnValue({
        ...(useStudySessionStore as unknown as jest.Mock)(),
        showAnswer: true
      });
      rerender(
        <StudyInterface 
          deckId={1}
          onComplete={mockOnComplete}
          onExit={mockOnExit}
        />
      );
      expect(screen.getByText('1: 다시, 2: 어려움, 3: 보통, 4: 쉬움')).toBeInTheDocument();
    });

    it('should show keyboard shortcuts help when enabled', async () => {
      render(
        <StudyInterface 
          deckId={1}
          onComplete={mockOnComplete}
          onExit={mockOnExit}
        />
      );
      
      expect(screen.getByText('Space: 답 보기, 1-4: 난이도')).toBeInTheDocument();
    });

    it('should not show keyboard shortcuts help when disabled', async () => {
      // Mock shortcuts disabled
      (useStudySessionStore as unknown as jest.Mock).mockReturnValue({
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
      
      expect(screen.queryByText('Space: 답 보기, 1-4: 난이도')).not.toBeInTheDocument();
    });
  });

  describe('Session Control UI', () => {
    it('should disable answer buttons when paused', async () => {
      // Mock paused state with answer shown
      (useStudySessionStore as unknown as jest.Mock).mockReturnValue({
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
      
      const goodButton = screen.getByRole('button', { name: /보통/ });
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
      
      const exitButton = screen.getByTitle('종료');
      fireEvent.click(exitButton);
      
      expect(window.confirm).toHaveBeenCalledWith('학습을 종료하시겠습니까? 진행률은 저장됩니다.');
      expect(mockStoreActions.endSession).not.toHaveBeenCalled();
      expect(mockOnExit).not.toHaveBeenCalled();

      window.confirm = originalConfirm;
    });

    it('should show the shortcut hint when shortcuts are enabled', async () => {
      render(
        <StudyInterface 
          deckId={1}
          onComplete={mockOnComplete}
          onExit={mockOnExit}
        />
      );
      
      expect(screen.getByTitle('키보드 단축키 사용 가능')).toHaveTextContent('Space: 답 보기, 1-4: 난이도');
    });

    it('should hide the shortcut hint when shortcuts are disabled', async () => {
      // Mock shortcuts disabled
      (useStudySessionStore as unknown as jest.Mock).mockReturnValue({
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
      
      expect(screen.queryByTitle('키보드 단축키 사용 가능')).not.toBeInTheDocument();
    });
  });

  describe('Session Completion Handling', () => {
    it('should handle session completion with proper summary', async () => {
      const mockProcessAnswer = jest.fn().mockResolvedValue(undefined);
      const mockNextCard = jest.fn();

      // Initial state with current card
      (useStudySessionStore as unknown as jest.Mock).mockReturnValue({
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

      jest.useFakeTimers();
      render(
        <StudyInterface 
          deckId={1}
          onComplete={mockOnComplete}
          onExit={mockOnExit}
        />
      );
      
      const goodButton = screen.getByRole('button', { name: /보통/ });
      fireEvent.click(goodButton);
      await act(async () => {
        jest.advanceTimersByTime(1000);
      });
      jest.useRealTimers();
      
      await waitFor(() => {
        expect(mockProcessAnswer).toHaveBeenCalledWith(StudyQuality.GOOD, expect.any(Number));
      });
      
      await waitFor(() => {
        expect(mockNextCard).toHaveBeenCalled();
      });
    });

    it('should show completion screen with return button', async () => {
      // Mock completed session state
      (useStudySessionStore as unknown as jest.Mock).mockReturnValue({
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
      
      expect(screen.getByText('학습 완료!')).toBeInTheDocument();
      expect(screen.getByText('총 4장의 카드를 학습했습니다.')).toBeInTheDocument();
      
      const returnButton = screen.getByRole('button', { name: '완료' });
      fireEvent.click(returnButton);
      
      // 완료 버튼은 세션을 끝내고 onComplete로 덱 화면에 돌아간다
      expect(mockStoreActions.endSession).toHaveBeenCalled();
      expect(mockOnComplete).toHaveBeenCalled();
    });

    it('should handle error state gracefully', async () => {
      // Mock error state
      (useStudySessionStore as unknown as jest.Mock).mockReturnValue({
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
      
      expect(screen.getByText('Failed to load study session')).toBeInTheDocument();
      
      const goBackButton = screen.getByRole('button', { name: '돌아가기' });
      fireEvent.click(goBackButton);
      
      expect(mockOnExit).toHaveBeenCalled();
    });
  });
});
