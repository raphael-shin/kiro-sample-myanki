import { render, screen, waitFor } from '@testing-library/react';
import { DeckStats } from '@/features/flashcard/components/Statistics/DeckStats';
import { useStatisticsStore, setStatisticsService } from '@/store/StatisticsStore';
import { IStatisticsService } from '@/services/StatisticsService';
import { DeckStatistics } from '@/types/flashcard';

// Mock the store
jest.mock('@/store/StatisticsStore');

describe('DeckStats Enhanced Features', () => {
  let mockStatisticsService: jest.Mocked<IStatisticsService>;
  let mockStoreActions: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock StatisticsService
    mockStatisticsService = {
      getDeckStatistics: jest.fn().mockResolvedValue({
        deckId: 1,
        totalCards: 100,
        newCards: 25,
        learningCards: 30,
        reviewCards: 35,
        completedCards: 10,
        totalSessions: 45,
        totalStudyTime: 7200000, // 2 hours
        averageSessionTime: 480000, // 8 minutes
        averageQuality: 3.4,
        retentionRate: 0.88,
        difficultyRating: 2.3,
        masteryLevel: 0.75,
        createdAt: new Date('2024-01-01'),
        lastStudiedAt: new Date('2024-01-15')
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
        totalCards: 100,
        newCards: 25,
        learningCards: 30,
        reviewCards: 35,
        completedCards: 10,
        totalSessions: 45,
        totalStudyTime: 7200000,
        averageSessionTime: 480000,
        averageQuality: 3.4,
        retentionRate: 0.88,
        difficultyRating: 2.3,
        masteryLevel: 0.75,
        createdAt: new Date('2024-01-01'),
        lastStudiedAt: new Date('2024-01-15')
      }]]),
      loading: false,
      error: null,
      ...mockStoreActions
    });
  });

  afterEach(() => {
    setStatisticsService(null as any);
  });

  describe('Detailed Statistics', () => {
    it('should display detailed breakdown when showDetailedBreakdown is true', async () => {
      render(<DeckStats deckId={1} showDetailedBreakdown={true} />);
      
      await waitFor(() => {
        expect(screen.getByText('Performance Metrics')).toBeInTheDocument();
        expect(screen.getByText('Total Study Time:')).toBeInTheDocument();
        expect(screen.getByText('2h 0m')).toBeInTheDocument();
        expect(screen.getByText('Average Session:')).toBeInTheDocument();
        expect(screen.getByText('8m')).toBeInTheDocument();
      });
    });

    it('should display quality metrics in detailed view', async () => {
      render(<DeckStats deckId={1} showDetailedBreakdown={true} />);
      
      await waitFor(() => {
        expect(screen.getByText('Average Quality:')).toBeInTheDocument();
        expect(screen.getByText('3.4/4.0')).toBeInTheDocument();
        expect(screen.getByText('Retention Rate:')).toBeInTheDocument();
        expect(screen.getByText('88%')).toBeInTheDocument();
        expect(screen.getByText('Mastery Level:')).toBeInTheDocument();
        expect(screen.getByText('75%')).toBeInTheDocument();
      });
    });

    it('should not display detailed breakdown by default', async () => {
      render(<DeckStats deckId={1} />);
      
      await waitFor(() => {
        expect(screen.getByText('Deck Statistics')).toBeInTheDocument();
      });
      
      expect(screen.queryByText('Performance Metrics')).not.toBeInTheDocument();
      expect(screen.queryByText('Total Study Time:')).not.toBeInTheDocument();
    });

    it('should format time values correctly', async () => {
      render(<DeckStats deckId={1} showDetailedBreakdown={true} />);
      
      await waitFor(() => {
        expect(screen.getByText('2h 0m')).toBeInTheDocument(); // 2 hours
        expect(screen.getByText('8m')).toBeInTheDocument(); // 8 minutes
      });
    });

    it('should display percentage values correctly', async () => {
      render(<DeckStats deckId={1} showDetailedBreakdown={true} />);
      
      await waitFor(() => {
        expect(screen.getByText('88%')).toBeInTheDocument(); // Retention rate
        expect(screen.getByText('75%')).toBeInTheDocument(); // Mastery level
      });
    });
  });

  describe('Card Status Classification', () => {
    it('should display comprehensive card status breakdown', async () => {
      render(<DeckStats deckId={1} />);
      
      await waitFor(() => {
        // Check all card status categories
        expect(screen.getByText('New Cards')).toBeInTheDocument();
        expect(screen.getByText('Learning Cards')).toBeInTheDocument();
        expect(screen.getByText('Review Cards')).toBeInTheDocument();
        expect(screen.getByText('Completed Cards')).toBeInTheDocument();
        
        // Check corresponding values
        expect(screen.getByText('25')).toBeInTheDocument(); // New cards
        expect(screen.getByText('30')).toBeInTheDocument(); // Learning cards
        expect(screen.getByText('35')).toBeInTheDocument(); // Review cards
        expect(screen.getByText('10')).toBeInTheDocument(); // Completed cards
      });
    });

    it('should use appropriate colors for different card statuses', async () => {
      render(<DeckStats deckId={1} />);
      
      await waitFor(() => {
        const newCardsLabel = screen.getByText('New Cards');
        const learningCardsLabel = screen.getByText('Learning Cards');
        const reviewCardsLabel = screen.getByText('Review Cards');
        const completedCardsLabel = screen.getByText('Completed Cards');
        
        expect(newCardsLabel).toHaveClass('text-blue-600');
        expect(learningCardsLabel).toHaveClass('text-orange-600');
        expect(reviewCardsLabel).toHaveClass('text-yellow-600');
        expect(completedCardsLabel).toHaveClass('text-green-600');
      });
    });

    it('should display total cards and sessions prominently', async () => {
      render(<DeckStats deckId={1} />);
      
      await waitFor(() => {
        const totalCardsValue = screen.getByText('100');
        const totalSessionsValue = screen.getByText('45');
        
        expect(totalCardsValue).toHaveClass('text-2xl', 'font-bold');
        expect(totalSessionsValue).toHaveClass('text-2xl', 'font-bold');
      });
    });
  });

  describe('Trend Chart Display', () => {
    it('should display trend chart when showTrendChart is true', async () => {
      render(<DeckStats deckId={1} showTrendChart={true} />);
      
      await waitFor(() => {
        expect(screen.getByText('Learning Trend')).toBeInTheDocument();
        expect(screen.getByText('Trend chart visualization')).toBeInTheDocument();
      });
    });

    it('should not display trend chart by default', async () => {
      render(<DeckStats deckId={1} />);
      
      await waitFor(() => {
        expect(screen.getByText('Deck Statistics')).toBeInTheDocument();
      });
      
      expect(screen.queryByText('Learning Trend')).not.toBeInTheDocument();
    });

    it('should have proper chart container styling', async () => {
      render(<DeckStats deckId={1} showTrendChart={true} />);
      
      await waitFor(() => {
        const chartContainer = screen.getByText('Trend chart visualization').parentElement;
        expect(chartContainer).toHaveClass('h-32', 'bg-gray-100', 'rounded');
      });
    });
  });

  describe('Responsive Design', () => {
    it('should have responsive grid layout for basic stats', async () => {
      render(<DeckStats deckId={1} />);
      
      await waitFor(() => {
        const statsGrid = screen.getByText('100').closest('.grid');
        expect(statsGrid).toHaveClass('grid-cols-2', 'gap-4');
      });
    });

    it('should have proper spacing and padding', async () => {
      render(<DeckStats deckId={1} />);
      
      await waitFor(() => {
        const container = screen.getByText('Deck Statistics').closest('div');
        expect(container).toHaveClass('bg-white', 'rounded-lg', 'p-6', 'shadow-md');
      });
    });

    it('should support dark mode styling', async () => {
      render(<DeckStats deckId={1} />);
      
      await waitFor(() => {
        const container = screen.getByText('Deck Statistics').closest('div');
        expect(container).toHaveClass('dark:bg-gray-800');
        
        const title = screen.getByText('Deck Statistics');
        expect(title).toHaveClass('dark:text-white');
      });
    });
  });

  describe('Advanced Analytics', () => {
    it('should display both detailed breakdown and trend chart when both props are true', async () => {
      render(<DeckStats deckId={1} showDetailedBreakdown={true} showTrendChart={true} />);
      
      await waitFor(() => {
        expect(screen.getByText('Performance Metrics')).toBeInTheDocument();
        expect(screen.getByText('Learning Trend')).toBeInTheDocument();
        expect(screen.getByText('Total Study Time:')).toBeInTheDocument();
        expect(screen.getByText('Trend chart visualization')).toBeInTheDocument();
      });
    });

    it('should handle edge cases for time formatting', async () => {
      // Mock data with edge case times
      (useStatisticsStore as jest.Mock).mockReturnValue({
        deckStats: new Map([[1, {
          deckId: 1,
          totalCards: 10,
          newCards: 5,
          learningCards: 3,
          reviewCards: 2,
          completedCards: 0,
          totalSessions: 1,
          totalStudyTime: 30000, // 30 seconds
          averageSessionTime: 30000, // 30 seconds
          averageQuality: 2.0,
          retentionRate: 0.5,
          difficultyRating: 3.0,
          masteryLevel: 0.1,
          createdAt: new Date(),
          lastStudiedAt: new Date()
        }]]),
        loading: false,
        error: null,
        ...mockStoreActions
      });

      render(<DeckStats deckId={1} showDetailedBreakdown={true} />);
      
      await waitFor(() => {
        const timeElements = screen.getAllByText('0m');
        expect(timeElements.length).toBeGreaterThan(0); // Multiple 0m elements exist
      });
    });

    it('should handle zero values gracefully', async () => {
      // Mock data with zero values
      (useStatisticsStore as jest.Mock).mockReturnValue({
        deckStats: new Map([[1, {
          deckId: 1,
          totalCards: 0,
          newCards: 0,
          learningCards: 0,
          reviewCards: 0,
          completedCards: 0,
          totalSessions: 0,
          totalStudyTime: 0,
          averageSessionTime: 0,
          averageQuality: 0,
          retentionRate: 0,
          difficultyRating: 0,
          masteryLevel: 0,
          createdAt: new Date(),
          lastStudiedAt: null
        }]]),
        loading: false,
        error: null,
        ...mockStoreActions
      });

      render(<DeckStats deckId={1} showDetailedBreakdown={true} />);
      
      await waitFor(() => {
        expect(screen.getByText('0.0/4.0')).toBeInTheDocument(); // Average quality - unique text
        const percentageElements = screen.getAllByText(/0%/);
        expect(percentageElements.length).toBeGreaterThan(0); // Multiple 0% elements exist
      });
    });

    it('should maintain consistent styling across all sections', async () => {
      render(<DeckStats deckId={1} showDetailedBreakdown={true} showTrendChart={true} />);
      
      await waitFor(() => {
        const performanceSection = screen.getByText('Performance Metrics').parentElement;
        const trendSection = screen.getByText('Learning Trend').parentElement;
        
        expect(performanceSection).toHaveClass('border-t', 'pt-4');
        expect(trendSection).toHaveClass('border-t', 'pt-4', 'mt-4');
      });
    });

    it('should load deck statistics with correct deckId', () => {
      render(<DeckStats deckId={42} />);
      
      expect(mockStoreActions.loadDeckStats).toHaveBeenCalledWith(42);
    });

    it('should handle missing deck statistics gracefully', () => {
      (useStatisticsStore as jest.Mock).mockReturnValue({
        deckStats: new Map(), // Empty map - no stats for any deck
        loading: false,
        error: null,
        ...mockStoreActions
      });

      render(<DeckStats deckId={999} />);
      
      expect(screen.getByText('No statistics available for this deck')).toBeInTheDocument();
    });
  });
});
