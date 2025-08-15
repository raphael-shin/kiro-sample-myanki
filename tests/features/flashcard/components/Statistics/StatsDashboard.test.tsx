import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { StatsDashboard } from '@/features/flashcard/components/Statistics/StatsDashboard';
import { useStatisticsStore, setStatisticsService } from '@/store/StatisticsStore';
import { IStatisticsService } from '@/services/StatisticsService';
import { GlobalStatistics, DailyGoals } from '@/types/flashcard';

// Mock the store
jest.mock('@/store/StatisticsStore');

describe('StatsDashboard Component', () => {
  let mockStatisticsService: jest.Mocked<IStatisticsService>;
  let mockStoreActions: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock StatisticsService
    mockStatisticsService = {
      getGlobalStatistics: jest.fn().mockResolvedValue({
        totalDecks: 5,
        totalCards: 150,
        totalSessions: 25,
        totalStudyTime: 7200000, // 2 hours
        overallAccuracy: 0.85,
        averageSessionLength: 288000, // 4.8 minutes
        studyStreak: 7,
        longestStreak: 15,
        dailyAverage: 12,
        weeklyAverage: 84,
        monthlyAverage: 360,
        recentActivity: [
          { date: new Date(), cardsStudied: 10, timeSpent: 600000 },
          { date: new Date(), cardsStudied: 8, timeSpent: 480000 }
        ]
      } as GlobalStatistics),
      getDailyGoal: jest.fn().mockResolvedValue({
        cardsGoal: 20,
        timeGoal: 30,
        streakGoal: 7,
        cardsCompleted: 15,
        timeCompleted: 25,
        currentStreak: 7,
        totalAchievements: 12
      } as DailyGoals),
      getDeckStatistics: jest.fn(),
      getDeckTrend: jest.fn(),
      getCardStatistics: jest.fn(),
      getCardLearningCurve: jest.fn(),
      getDailyProgress: jest.fn(),
      getWeeklyTrend: jest.fn(),
      getMonthlyReport: jest.fn(),
      setDailyGoal: jest.fn(),
      checkGoalAchievement: jest.fn()
    } as any;
    
    setStatisticsService(mockStatisticsService);

    mockStoreActions = {
      loadGlobalStats: jest.fn(),
      refreshGlobalStats: jest.fn(),
      clearGlobalStats: jest.fn()
    };

    // Mock useStatisticsStore
    (useStatisticsStore as jest.Mock).mockReturnValue({
      globalStats: {
        totalDecks: 5,
        totalCards: 150,
        totalSessions: 25,
        totalStudyTime: 7200000,
        overallAccuracy: 0.85,
        averageSessionLength: 288000,
        studyStreak: 7,
        longestStreak: 15,
        dailyAverage: 12,
        weeklyAverage: 84,
        monthlyAverage: 360,
        recentActivity: []
      },
      dailyGoals: {
        cardsGoal: 20,
        timeGoal: 30,
        streakGoal: 7,
        cardsCompleted: 15,
        timeCompleted: 25,
        currentStreak: 7,
        totalAchievements: 12
      },
      loading: false,
      error: null,
      ...mockStoreActions
    });
  });

  afterEach(() => {
    setStatisticsService(null as any);
  });

  describe('Basic Structure', () => {
    it('should render dashboard with global statistics', async () => {
      render(<StatsDashboard timeRange="week" />);
      
      await waitFor(() => {
        expect(screen.getByText('Statistics Dashboard')).toBeInTheDocument();
        expect(screen.getByText('5')).toBeInTheDocument(); // Total decks
        expect(screen.getByText('150')).toBeInTheDocument(); // Total cards
        expect(screen.getByText('25')).toBeInTheDocument(); // Total sessions
      });
    });

    it('should load global statistics on mount', async () => {
      render(<StatsDashboard timeRange="day" />);
      
      await waitFor(() => {
        expect(mockStoreActions.loadGlobalStats).toHaveBeenCalled();
      });
    });

    it('should display loading state', () => {
      (useStatisticsStore as jest.Mock).mockReturnValue({
        globalStats: null,
        dailyGoals: null,
        loading: true,
        error: null,
        ...mockStoreActions
      });

      render(<StatsDashboard timeRange="week" />);
      
      expect(screen.getByText('Loading statistics...')).toBeInTheDocument();
    });

    it('should display error state', () => {
      (useStatisticsStore as jest.Mock).mockReturnValue({
        globalStats: null,
        dailyGoals: null,
        loading: false,
        error: 'Failed to load statistics',
        ...mockStoreActions
      });

      render(<StatsDashboard timeRange="week" />);
      
      expect(screen.getByText('Error loading statistics')).toBeInTheDocument();
      expect(screen.getByText('Failed to load statistics')).toBeInTheDocument();
    });
  });

  describe('Time Range Selection', () => {
    it('should display time range selector', () => {
      render(<StatsDashboard timeRange="week" />);
      
      expect(screen.getByText('Day')).toBeInTheDocument();
      expect(screen.getByText('Week')).toBeInTheDocument();
      expect(screen.getByText('Month')).toBeInTheDocument();
      expect(screen.getByText('Year')).toBeInTheDocument();
    });

    it('should highlight current time range', () => {
      render(<StatsDashboard timeRange="month" />);
      
      const monthButton = screen.getByText('Month');
      expect(monthButton).toHaveClass('bg-blue-600', 'text-white');
    });

    it('should call onTimeRangeChange when time range is selected', () => {
      const mockOnTimeRangeChange = jest.fn();
      render(<StatsDashboard timeRange="week" onTimeRangeChange={mockOnTimeRangeChange} />);
      
      const dayButton = screen.getByText('Day');
      fireEvent.click(dayButton);
      
      expect(mockOnTimeRangeChange).toHaveBeenCalledWith('day');
    });

    it('should refresh statistics when time range changes', async () => {
      const { rerender } = render(<StatsDashboard timeRange="week" />);
      
      rerender(<StatsDashboard timeRange="month" />);
      
      await waitFor(() => {
        expect(mockStoreActions.refreshGlobalStats).toHaveBeenCalled();
      });
    });
  });

  describe('Statistics Display', () => {
    it('should format time values correctly', () => {
      render(<StatsDashboard timeRange="week" />);
      
      expect(screen.getByText('2h 0m')).toBeInTheDocument(); // Total study time
      expect(screen.getByText('4m 48s')).toBeInTheDocument(); // Average session length
    });

    it('should display accuracy as percentage', () => {
      render(<StatsDashboard timeRange="week" />);
      
      expect(screen.getByText('85%')).toBeInTheDocument(); // Overall accuracy
    });

    it('should display streak information', () => {
      render(<StatsDashboard timeRange="week" />);
      
      expect(screen.getByText('7')).toBeInTheDocument(); // Current streak
      expect(screen.getByText('15')).toBeInTheDocument(); // Longest streak
    });

    it('should display daily goals progress', () => {
      render(<StatsDashboard timeRange="week" />);
      
      expect(screen.getByText('15 / 20')).toBeInTheDocument(); // Cards progress
      expect(screen.getByText('25 / 30')).toBeInTheDocument(); // Time progress
    });
  });

  describe('Refresh Functionality', () => {
    it('should have refresh button', () => {
      render(<StatsDashboard timeRange="week" />);
      
      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      expect(refreshButton).toBeInTheDocument();
    });

    it('should refresh statistics when refresh button is clicked', () => {
      render(<StatsDashboard timeRange="week" />);
      
      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      fireEvent.click(refreshButton);
      
      expect(mockStoreActions.refreshGlobalStats).toHaveBeenCalled();
    });
  });
});
