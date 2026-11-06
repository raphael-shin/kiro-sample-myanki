import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { StudyInterface } from '../StudyInterface';
import { StudyQuality } from '@/types/flashcard';
import { useStudySessionStore, setSessionManager, setSpacedRepetitionService } from '../../../../../store/StudySessionStore';
import { ISessionManager } from '../../../../../services/SessionManager';
import { SpacedRepetitionService } from '../../../../../services/SpacedRepetitionService';

// Mock the store
jest.mock('../../../../../store/StudySessionStore');

describe('StudyInterface Component', () => {
  const mockOnComplete = jest.fn();
  const mockOnExit = jest.fn();
  let mockSessionManager: jest.Mocked<ISessionManager>;
  let mockSpacedRepetitionService: jest.Mocked<SpacedRepetitionService>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock SessionManager
    mockSessionManager = {
      createSession: jest.fn().mockResolvedValue({
        id: 'test-session-1',
        deckId: 1,
        startTime: new Date(),
        status: 'active',
        totalCards: 2,
        completedCards: 0,
        currentCardIndex: 0,
        correctAnswers: 0,
        totalResponseTime: 0,
        qualityScores: [],
        keyboardShortcuts: true,
        autoAdvance: false,
        pausedTime: 0
      }),
      getSessionData: jest.fn(),
      updateSession: jest.fn(),
      deleteSession: jest.fn(),
      pauseSession: jest.fn(),
      resumeSession: jest.fn(),
      isSessionActive: jest.fn(),
      getSessionProgress: jest.fn(),
      getEstimatedTimeRemaining: jest.fn(),
      getSessionSummary: jest.fn()
    } as unknown as jest.Mocked<ISessionManager>;

    // Mock SpacedRepetitionService
    mockSpacedRepetitionService = {
      processStudyResult: jest.fn(),
      getCardsForReview: jest.fn(),
      getByCardId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    } as unknown as jest.Mocked<SpacedRepetitionService>;

    setSessionManager(mockSessionManager);
    setSpacedRepetitionService(mockSpacedRepetitionService);

    // Mock useStudySessionStore
    (useStudySessionStore as unknown as jest.Mock).mockReturnValue({
      currentCard: { id: 1, deckId: 1, front: 'Front 1', back: 'Back 1' },
      isActive: true,
      loading: false,
      error: null,
      sessionStats: { cardsStudied: 0, correctAnswers: 0, totalTime: 0 },
      showAnswer: false,
      isPaused: false,
      keyboardShortcutsEnabled: true,
      startSession: jest.fn(),
      endSession: jest.fn(),
      pauseSession: jest.fn(),
      resumeSession: jest.fn(),
      showCardAnswer: jest.fn(),
      processAnswer: jest.fn(),
      nextCard: jest.fn(),
      getProgress: jest.fn().mockReturnValue({
        percentage: 50,
        cardsRemaining: 1,
        totalCards: 2
      }),
      enableKeyboardShortcuts: jest.fn()
    });
  });

  afterEach(() => {
    setSessionManager(null as unknown as ISessionManager);
    setSpacedRepetitionService(null as unknown as SpacedRepetitionService);
  });

  it('should render study interface with current card', async () => {
    render(
      <StudyInterface 
        deckId={1}
        onComplete={mockOnComplete}
        onExit={mockOnExit}
      />
    );
    
    await waitFor(() => {
      expect(screen.getByText('Front 1')).toBeInTheDocument();
    });
  });

  it('should show loading state initially', () => {
    (useStudySessionStore as unknown as jest.Mock).mockReturnValue({
      currentCard: null,
      isActive: false,
      loading: true,
      error: null,
      sessionStats: { cardsStudied: 0, correctAnswers: 0, totalTime: 0 },
      showAnswer: false,
      isPaused: false,
      keyboardShortcutsEnabled: true,
      startSession: jest.fn(),
      endSession: jest.fn(),
      pauseSession: jest.fn(),
      resumeSession: jest.fn(),
      showCardAnswer: jest.fn(),
      processAnswer: jest.fn(),
      nextCard: jest.fn(),
      getProgress: jest.fn().mockReturnValue({
        percentage: 0,
        cardsRemaining: 0,
        totalCards: 0
      }),
      enableKeyboardShortcuts: jest.fn()
    });

    render(
      <StudyInterface 
        deckId={1}
        onComplete={mockOnComplete}
        onExit={mockOnExit}
      />
    );
    
    expect(screen.getByText('학습 세션을 준비하고 있습니다...')).toBeInTheDocument();
  });

  it('should show error state when error occurs', () => {
    (useStudySessionStore as unknown as jest.Mock).mockReturnValue({
      currentCard: null,
      isActive: false,
      loading: false,
      error: 'Failed to load session',
      sessionStats: { cardsStudied: 0, correctAnswers: 0, totalTime: 0 },
      showAnswer: false,
      isPaused: false,
      keyboardShortcutsEnabled: true,
      startSession: jest.fn(),
      endSession: jest.fn(),
      pauseSession: jest.fn(),
      resumeSession: jest.fn(),
      showCardAnswer: jest.fn(),
      processAnswer: jest.fn(),
      nextCard: jest.fn(),
      getProgress: jest.fn().mockReturnValue({
        percentage: 0,
        cardsRemaining: 0,
        totalCards: 0
      }),
      enableKeyboardShortcuts: jest.fn()
    });

    render(
      <StudyInterface 
        deckId={1}
        onComplete={mockOnComplete}
        onExit={mockOnExit}
      />
    );
    
    expect(screen.getByText('Failed to load session')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '돌아가기' }));
    expect(mockOnExit).toHaveBeenCalled();
  });

  it('should show session complete when no current card', () => {
    (useStudySessionStore as unknown as jest.Mock).mockReturnValue({
      currentCard: null,
      isActive: true,
      loading: false,
      error: null,
      sessionStats: { cardsStudied: 2, correctAnswers: 2, totalTime: 10000 },
      showAnswer: false,
      isPaused: false,
      keyboardShortcutsEnabled: true,
      startSession: jest.fn(),
      endSession: jest.fn(),
      pauseSession: jest.fn(),
      resumeSession: jest.fn(),
      showCardAnswer: jest.fn(),
      processAnswer: jest.fn(),
      nextCard: jest.fn(),
      getProgress: jest.fn().mockReturnValue({
        percentage: 100,
        cardsRemaining: 0,
        totalCards: 2
      }),
      enableKeyboardShortcuts: jest.fn()
    });

    render(
      <StudyInterface 
        deckId={1}
        onComplete={mockOnComplete}
        onExit={mockOnExit}
      />
    );
    
    expect(screen.getByText('학습 완료!')).toBeInTheDocument();
    expect(screen.getByText('총 2장의 카드를 학습했습니다.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '완료' })).toBeInTheDocument();
  });

  it('should show pause/resume button', async () => {
    render(
      <StudyInterface 
        deckId={1}
        onComplete={mockOnComplete}
        onExit={mockOnExit}
      />
    );
    
    await waitFor(() => {
      expect(screen.getByTitle('일시정지')).toBeInTheDocument();
    });
  });

  it('should show keyboard shortcuts help when enabled', async () => {
    render(
      <StudyInterface 
        deckId={1}
        onComplete={mockOnComplete}
        onExit={mockOnExit}
      />
    );
    
    await waitFor(() => {
      expect(screen.getByText('Space: 답 보기, 1-4: 난이도')).toBeInTheDocument();
    });
  });

  describe('answer while feedback is shown', () => {
    let processAnswer: jest.Mock;
    let nextCard: jest.Mock;

    beforeEach(() => {
      jest.useFakeTimers();
      processAnswer = jest.fn().mockResolvedValue(undefined);
      nextCard = jest.fn();
      const state = (useStudySessionStore as unknown as jest.Mock)();
      (useStudySessionStore as unknown as jest.Mock).mockReturnValue({
        ...state,
        showAnswer: true,
        processAnswer,
        nextCard
      });
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('processes only the first answer when a number key is pressed twice within 1 second', async () => {
      render(<StudyInterface deckId={1} />);

      act(() => {
        fireEvent.keyDown(window, { key: '3' });
      });
      act(() => {
        jest.advanceTimersByTime(500);
      });
      act(() => {
        fireEvent.keyDown(window, { key: '1' });
      });

      await act(async () => {
        jest.advanceTimersByTime(2000);
      });

      expect(processAnswer).toHaveBeenCalledTimes(1);
      expect(processAnswer).toHaveBeenCalledWith(StudyQuality.GOOD, expect.any(Number));
      expect(nextCard).toHaveBeenCalledTimes(1);
    });

    it('cancels the pending answer when the component unmounts', async () => {
      const { unmount } = render(<StudyInterface deckId={1} />);

      act(() => {
        fireEvent.keyDown(window, { key: '3' });
      });
      unmount();

      await act(async () => {
        jest.advanceTimersByTime(2000);
      });

      expect(processAnswer).not.toHaveBeenCalled();
      expect(nextCard).not.toHaveBeenCalled();
    });
  });

  // 이슈 #16: 카드 표시 시각(answerStartTime)부터 답까지의 실제 경과 시간을 responseTime으로 넘긴다
  describe('response time measurement (issue #16)', () => {
    let processAnswer: jest.Mock;
    let nextCard: jest.Mock;

    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-01-01T00:00:03.000Z'));
      processAnswer = jest.fn().mockResolvedValue(undefined);
      nextCard = jest.fn();
      const state = (useStudySessionStore as unknown as jest.Mock)();
      (useStudySessionStore as unknown as jest.Mock).mockReturnValue({
        ...state,
        showAnswer: true,
        // 카드는 3초 전에 표시되었다
        answerStartTime: new Date('2024-01-01T00:00:00.000Z'),
        processAnswer,
        nextCard
      });
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('passes the elapsed time since the card was shown as responseTime', async () => {
      render(<StudyInterface deckId={1} />);

      act(() => {
        fireEvent.keyDown(window, { key: '3' });
      });

      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      expect(processAnswer).toHaveBeenCalledTimes(1);
      expect(processAnswer).toHaveBeenCalledWith(StudyQuality.GOOD, 3000);
    });
  });
});
