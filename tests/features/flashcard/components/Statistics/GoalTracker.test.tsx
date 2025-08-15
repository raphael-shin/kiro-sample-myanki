import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { GoalTracker } from '@/features/flashcard/components/Statistics/GoalTracker';
import { useStatisticsStore } from '@/store/StatisticsStore';

// Mock StatisticsStore
jest.mock('@/store/StatisticsStore');
const mockUseStatisticsStore = useStatisticsStore as jest.MockedFunction<typeof useStatisticsStore>;

const mockStoreActions = {
  loadDeckStats: jest.fn(),
  loadCardStats: jest.fn(),
  loadGlobalStats: jest.fn(),
  updateDailyGoal: jest.fn(),
  getDailyProgress: jest.fn(),
  getWeeklyTrend: jest.fn()
};

const mockDailyGoals = {
  cardsGoal: 20,
  timeGoal: 30, // 30 minutes
  streakGoal: 7,
  cardsCompleted: 12,
  timeCompleted: 18, // 18 minutes
  currentStreak: 3,
  lastAchievedDate: new Date('2024-01-01'),
  totalAchievements: 5
};

describe('GoalTracker Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseStatisticsStore.mockReturnValue({
      dailyGoals: mockDailyGoals,
      loading: false,
      error: null,
      ...mockStoreActions
    });
  });

  describe('Basic Functionality', () => {
    it('should render daily goal progress', async () => {
      render(<GoalTracker />);
      
      await waitFor(() => {
        expect(screen.getByText('Daily Goals')).toBeInTheDocument();
        expect(screen.getByText('Cards Goal')).toBeInTheDocument();
        expect(screen.getByText('Time Goal')).toBeInTheDocument();
        expect(screen.getByText('12 / 20')).toBeInTheDocument(); // Cards progress
        expect(screen.getByText('18 / 30 min')).toBeInTheDocument(); // Time progress
      });
    });

    it('should display progress bars with correct percentages', async () => {
      render(<GoalTracker />);
      
      await waitFor(() => {
        const percentageElements = screen.getAllByText('60%');
        expect(percentageElements).toHaveLength(2); // Cards: 12/20 = 60%, Time: 18/30 = 60%
      });
    });

    it('should show current streak information', async () => {
      render(<GoalTracker />);
      
      await waitFor(() => {
        expect(screen.getByText('Current Streak')).toBeInTheDocument();
        expect(screen.getByText('3 days')).toBeInTheDocument();
        expect(screen.getByText('Goal: 7 days')).toBeInTheDocument();
      });
    });

    it('should show loading state', () => {
      mockUseStatisticsStore.mockReturnValue({
        dailyGoals: null,
        loading: true,
        error: null,
        ...mockStoreActions
      });

      render(<GoalTracker />);
      
      expect(screen.getByText('Loading goals...')).toBeInTheDocument();
    });

    it('should handle missing goals data', async () => {
      mockUseStatisticsStore.mockReturnValue({
        dailyGoals: null,
        loading: false,
        error: null,
        ...mockStoreActions
      });

      render(<GoalTracker />);
      
      await waitFor(() => {
        expect(screen.getByText('No goals set')).toBeInTheDocument();
      });
    });
  });
});
