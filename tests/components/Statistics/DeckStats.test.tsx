import { render, screen, waitFor } from '@testing-library/react';
import { DeckStats } from '@/features/flashcard/components/Statistics/DeckStats';
import { useStatisticsStore, setStatisticsService } from '@/store/StatisticsStore';
import { IStatisticsService } from '@/services/StatisticsService';
import { DeckStatistics } from '@/types/flashcard';

// Mock the store
jest.mock('@/store/StatisticsStore');

describe('DeckStats', () => {
  let mockStatisticsService: jest.Mocked<IStatisticsService>;
  let mockStoreActions: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock StatisticsService
    mockStatisticsService = {
      getDeckStatistics: jest.fn().mockResolvedValue({
        deckId: 1,
        totalCards: 20,
        newCards: 8,
        learningCards: 5,
        reviewCards: 4,
        completedCards: 3,
        totalSessions: 12,
        totalStudyTime: 3600000, // 1 hour
        averageSessionTime: 300000, // 5 minutes
        averageQuality: 3.2,
        retentionRate: 0.85,
        difficultyRating: 2.5,
        masteryLevel: 0.7,
        createdAt: new Date(),
        lastStudiedAt: new Date()
      } as DeckStatistics),
      getDeckTrend: jest.fn(),
      getCardStatistics: jest.fn(),
      getCardLearningCurve: jest.fn(),
      getGlobalStatistics: jest.fn(),
      getDailyProgress: jest.fn(),
      getWeeklyTrend: jest.fn(),
      getMonthlyReport: jest.fn(),
      setDailyGoal: jest.fn(),
      getDailyGoal: jest.fn(),
      checkGoalAchievement: jest.fn()
    } as any;
    
    setStatisticsService(mockStatisticsService);

    mockStoreActions = {
      loadDeckStats: jest.fn()
    };

    // Mock useStatisticsStore
    (useStatisticsStore as jest.Mock).mockReturnValue({
      deckStats: new Map([[1, {
        deckId: 1,
        totalCards: 20,
        newCards: 8,
        learningCards: 5,
        reviewCards: 4,
        completedCards: 3,
        totalSessions: 12,
        totalStudyTime: 3600000,
        averageSessionTime: 300000,
        averageQuality: 3.2,
        retentionRate: 0.85,
        difficultyRating: 2.5,
        masteryLevel: 0.7,
        createdAt: new Date(),
        lastStudiedAt: new Date()
      }]]),
      loading: false,
      error: null,
      ...mockStoreActions
    });
  });

  afterEach(() => {
    setStatisticsService(null as any);
  });

  it('should display basic deck statistics', async () => {
    render(<DeckStats deckId={1} />);
    
    await waitFor(() => {
      expect(screen.getByText('Deck Statistics')).toBeInTheDocument();
      expect(screen.getByText('20')).toBeInTheDocument(); // Total cards
      expect(screen.getByText('12')).toBeInTheDocument(); // Total sessions
    });
  });

  it('should display card status breakdown', async () => {
    render(<DeckStats deckId={1} />);
    
    await waitFor(() => {
      expect(screen.getByText('New Cards')).toBeInTheDocument();
      expect(screen.getByText('Learning Cards')).toBeInTheDocument();
      expect(screen.getByText('Review Cards')).toBeInTheDocument();
      expect(screen.getByText('Completed Cards')).toBeInTheDocument();
      
      expect(screen.getByText('8')).toBeInTheDocument(); // New cards
      expect(screen.getByText('5')).toBeInTheDocument(); // Learning cards
      expect(screen.getByText('4')).toBeInTheDocument(); // Review cards
      expect(screen.getByText('3')).toBeInTheDocument(); // Completed cards
    });
  });

  it('should load deck statistics on mount', () => {
    render(<DeckStats deckId={1} />);
    
    expect(mockStoreActions.loadDeckStats).toHaveBeenCalledWith(1);
  });

  it('should display loading state', () => {
    (useStatisticsStore as jest.Mock).mockReturnValue({
      deckStats: new Map(),
      loading: true,
      error: null,
      ...mockStoreActions
    });

    render(<DeckStats deckId={1} />);
    
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('should display error state', () => {
    (useStatisticsStore as jest.Mock).mockReturnValue({
      deckStats: new Map(),
      loading: false,
      error: 'Failed to load statistics',
      ...mockStoreActions
    });

    render(<DeckStats deckId={1} />);
    
    expect(screen.getByText('Error loading deck statistics')).toBeInTheDocument();
    expect(screen.getByText('Failed to load statistics')).toBeInTheDocument();
  });
});
