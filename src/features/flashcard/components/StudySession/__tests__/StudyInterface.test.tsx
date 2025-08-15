import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { StudyInterface } from '../StudyInterface';
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
    } as any;

    // Mock SpacedRepetitionService
    mockSpacedRepetitionService = {
      processStudyResult: jest.fn(),
      getCardsForReview: jest.fn(),
      getByCardId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    } as any;

    setSessionManager(mockSessionManager);
    setSpacedRepetitionService(mockSpacedRepetitionService);

    // Mock useStudySessionStore
    (useStudySessionStore as jest.Mock).mockReturnValue({
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
    setSessionManager(null as any);
    setSpacedRepetitionService(null as any);
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
    (useStudySessionStore as jest.Mock).mockReturnValue({
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
    
    expect(screen.getByText('Loading study session...')).toBeInTheDocument();
  });

  it('should show error state when error occurs', () => {
    (useStudySessionStore as jest.Mock).mockReturnValue({
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
    
    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Failed to load session')).toBeInTheDocument();
  });

  it('should show session complete when no current card', () => {
    (useStudySessionStore as jest.Mock).mockReturnValue({
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
    
    expect(screen.getByText('Session Complete!')).toBeInTheDocument();
    expect(screen.getByText('Return to Deck')).toBeInTheDocument();
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
      expect(screen.getByText('Pause')).toBeInTheDocument();
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
      expect(screen.getByText(/Shortcuts: Space/)).toBeInTheDocument();
    });
  });
});
