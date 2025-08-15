import { render, screen, waitFor } from '@testing-library/react';
import { StudyHistory } from '@/features/flashcard/components/Statistics/StudyHistory';
import { useStatisticsStore } from '@/store/StatisticsStore';

// Mock StatisticsStore
jest.mock('@/store/StatisticsStore');
const mockUseStatisticsStore = useStatisticsStore as jest.MockedFunction<typeof useStatisticsStore>;

const mockStoreActions = {
  loadDeckStats: jest.fn(),
  loadGlobalStats: jest.fn(),
  updateDailyGoal: jest.fn(),
  getDailyProgress: jest.fn(),
  getWeeklyTrend: jest.fn()
};

const mockCardStatistics = {
  cardId: 1,
  totalReviews: 5,
  correctAnswers: 3,
  averageQuality: 3.2,
  averageResponseTime: 2500,
  easeFactor: 2.5,
  currentInterval: 7,
  lastReviewDate: new Date('2024-01-02'),
  nextReviewDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  difficultyLevel: 'medium' as const,
  learningHistory: [
    {
      sessionId: 'session-1',
      reviewedAt: new Date('2024-01-01'),
      quality: 3,
      responseTime: 2000,
      easeFactor: 2.3,
      interval: 1
    },
    {
      sessionId: 'session-2', 
      reviewedAt: new Date('2024-01-02'),
      quality: 4,
      responseTime: 1500,
      easeFactor: 2.5,
      interval: 3
    }
  ]
};

describe('StudyHistory Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseStatisticsStore.mockReturnValue({
      cardStats: new Map([[1, mockCardStatistics]]),
      loading: false,
      error: null,
      ...mockStoreActions
    });
  });

  describe('Basic Functionality', () => {
    it('should render study history for a card', async () => {
      render(<StudyHistory cardId={1} />);
      
      await waitFor(() => {
        expect(screen.getByText('Study History')).toBeInTheDocument();
        expect(screen.getByText('5')).toBeInTheDocument(); // Total Reviews number
        expect(screen.getByText('Total Reviews')).toBeInTheDocument(); // Total Reviews label
        expect(screen.getByText('60%')).toBeInTheDocument(); // Accuracy percentage
        expect(screen.getByText('Accuracy')).toBeInTheDocument(); // Accuracy label
      });
    });

    it('should display learning history records', async () => {
      render(<StudyHistory cardId={1} />);
      
      await waitFor(() => {
        expect(screen.getByText('Jan 1, 2024')).toBeInTheDocument();
        expect(screen.getByText('Jan 2, 2024')).toBeInTheDocument();
        expect(screen.getByText('Good')).toBeInTheDocument();
        expect(screen.getByText('Easy')).toBeInTheDocument();
      });
    });

    it('should show loading state', () => {
      mockUseStatisticsStore.mockReturnValue({
        cardStats: new Map(),
        loading: true,
        error: null,
        ...mockStoreActions
      });

      render(<StudyHistory cardId={1} />);
      
      expect(screen.getByText('Loading study history...')).toBeInTheDocument();
    });

    it('should handle missing card statistics', async () => {
      mockUseStatisticsStore.mockReturnValue({
        cardStats: new Map(),
        loading: false,
        error: null,
        ...mockStoreActions
      });

      render(<StudyHistory cardId={999} />);
      
      await waitFor(() => {
        expect(screen.getByText('No study history available')).toBeInTheDocument();
      });
    });
  });

  describe('Detailed Information', () => {
    it('should display session details when available', async () => {
      render(<StudyHistory cardId={1} />);
      
      await waitFor(() => {
        expect(screen.getByText('2.0s')).toBeInTheDocument();
        expect(screen.getByText('1.5s')).toBeInTheDocument();
        expect(screen.getByText('2.3')).toBeInTheDocument();
        const easeFactor25Elements = screen.getAllByText('2.5');
        expect(easeFactor25Elements.length).toBeGreaterThan(0);
      });
    });

    it('should display interval information', async () => {
      render(<StudyHistory cardId={1} />);
      
      await waitFor(() => {
        expect(screen.getByText('1 day')).toBeInTheDocument();
        expect(screen.getByText('3 days')).toBeInTheDocument();
      });
    });

    it('should show current card status', async () => {
      render(<StudyHistory cardId={1} />);
      
      await waitFor(() => {
        const easeFactor25Elements = screen.getAllByText('2.5');
        expect(easeFactor25Elements.length).toBeGreaterThan(0); // Multiple 2.5 values exist
        const easeFactorLabels = screen.getAllByText('Ease Factor');
        expect(easeFactorLabels.length).toBeGreaterThan(0); // Multiple Ease Factor labels exist
        expect(screen.getByText('7 days')).toBeInTheDocument(); // Current Interval value
        expect(screen.getByText('Current Interval')).toBeInTheDocument(); // Current Interval label
        expect(screen.getByText(/In 7 days/)).toBeInTheDocument(); // Next Review
      });
    });

    it('should handle empty learning history', async () => {
      mockUseStatisticsStore.mockReturnValue({
        cardStats: new Map([[1, {
          ...mockCardStatistics,
          learningHistory: []
        }]]),
        loading: false,
        error: null,
        ...mockStoreActions
      });

      render(<StudyHistory cardId={1} />);
      
      await waitFor(() => {
        expect(screen.getByText('No learning sessions recorded yet')).toBeInTheDocument();
      });
    });
  });

  describe('Learning Curve Chart', () => {
    it('should display learning curve chart when showChart is true', async () => {
      render(<StudyHistory cardId={1} showChart={true} />);
      
      await waitFor(() => {
        expect(screen.getByText(/Learning Progress/)).toBeInTheDocument(); // Matches "📊 Learning Progress"
        expect(screen.getByText(/Quality Trend/)).toBeInTheDocument(); // Matches "📈 Quality Trend"
        expect(screen.getByText(/Response Time Trend/)).toBeInTheDocument(); // Matches "⏱️ Response Time Trend"
      });
    });

    it('should not display chart by default', async () => {
      render(<StudyHistory cardId={1} />);
      
      await waitFor(() => {
        expect(screen.queryByText(/Learning Progress/)).not.toBeInTheDocument();
        expect(screen.queryByText(/Quality Trend/)).not.toBeInTheDocument();
      });
    });

    it('should show chart data points', async () => {
      render(<StudyHistory cardId={1} showChart={true} />);
      
      await waitFor(() => {
        // Check for quality progression data points
        expect(screen.getByText('Jan 1: Quality 3')).toBeInTheDocument();
        expect(screen.getByText('Jan 2: Quality 4')).toBeInTheDocument();
        
        // Check for response time progression
        expect(screen.getByText('Jan 1: 2.0s')).toBeInTheDocument();
        expect(screen.getByText('Jan 2: 1.5s')).toBeInTheDocument();
      });
    });

    it('should display improvement trend indicator', async () => {
      render(<StudyHistory cardId={1} showChart={true} />);
      
      await waitFor(() => {
        expect(screen.getByText(/Trend: Stable/)).toBeInTheDocument(); // Matches "→ Trend: Stable"
        expect(screen.getByText(/Mastery Score: \d+%/)).toBeInTheDocument(); // Matches "🎯 Mastery Score: 61%"
      });
    });

    it('should handle empty chart data', async () => {
      mockUseStatisticsStore.mockReturnValue({
        cardStats: new Map([[1, {
          ...mockCardStatistics,
          learningHistory: []
        }]]),
        loading: false,
        error: null,
        ...mockStoreActions
      });

      render(<StudyHistory cardId={1} showChart={true} />);
      
      await waitFor(() => {
        expect(screen.getByText('No data available for chart')).toBeInTheDocument();
      });
    });
  });
});
