import { useEffect } from 'react';
import { useStatisticsStore } from '../../../../store/StatisticsStore';

interface StatsDashboardProps {
  timeRange: 'day' | 'week' | 'month' | 'year';
  onTimeRangeChange?: (timeRange: 'day' | 'week' | 'month' | 'year') => void;
}

const formatTime = (milliseconds: number): string => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
};

export const StatsDashboard: React.FC<StatsDashboardProps> = ({ 
  timeRange, 
  onTimeRangeChange 
}) => {
  const {
    globalStats,
    dailyGoals,
    loading,
    error,
    loadGlobalStats,
    refreshGlobalStats
  } = useStatisticsStore();

  useEffect(() => {
    loadGlobalStats();
  }, [loadGlobalStats]);

  useEffect(() => {
    refreshGlobalStats();
  }, [timeRange, refreshGlobalStats]);

  const handleTimeRangeChange = (newTimeRange: 'day' | 'week' | 'month' | 'year') => {
    onTimeRangeChange?.(newTimeRange);
  };

  const handleRefresh = () => {
    refreshGlobalStats();
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading statistics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Error loading statistics</h3>
          <p className="text-red-600 mt-1">{error}</p>
          <button
            onClick={handleRefresh}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!globalStats) {
    return (
      <div className="p-6">
        <p className="text-gray-600">No statistics available</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Statistics Dashboard</h1>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      {/* Time Range Selector */}
      <div className="mb-6">
        <div className="flex space-x-2">
          {(['day', 'week', 'month', 'year'] as const).map((range) => (
            <button
              key={range}
              onClick={() => handleTimeRangeChange(range)}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Total Decks */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Decks</h3>
          <p className="text-2xl font-bold text-gray-900">{globalStats.totalDecks}</p>
        </div>

        {/* Total Cards */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Cards</h3>
          <p className="text-2xl font-bold text-gray-900">{globalStats.totalCards}</p>
        </div>

        {/* Total Sessions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Sessions</h3>
          <p className="text-2xl font-bold text-gray-900">{globalStats.totalSessions}</p>
        </div>

        {/* Total Study Time */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Study Time</h3>
          <p className="text-2xl font-bold text-gray-900">{formatTime(globalStats.totalStudyTime)}</p>
        </div>

        {/* Overall Accuracy */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Overall Accuracy</h3>
          <p className="text-2xl font-bold text-gray-900">{Math.round(globalStats.overallAccuracy * 100)}%</p>
        </div>

        {/* Average Session Length */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Avg Session Length</h3>
          <p className="text-2xl font-bold text-gray-900">{formatTime(globalStats.averageSessionLength)}</p>
        </div>

        {/* Current Streak */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Current Streak</h3>
          <p className="text-2xl font-bold text-gray-900">{globalStats.studyStreak}</p>
        </div>

        {/* Longest Streak */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Longest Streak</h3>
          <p className="text-2xl font-bold text-gray-900">{globalStats.longestStreak}</p>
        </div>
      </div>

      {/* Daily Goals Section */}
      {dailyGoals && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Daily Goals</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Cards Goal */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Cards</span>
                <span className="text-sm text-gray-600">{dailyGoals.cardsCompleted} / {dailyGoals.cardsGoal}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((dailyGoals.cardsCompleted / dailyGoals.cardsGoal) * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* Time Goal */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Time (minutes)</span>
                <span className="text-sm text-gray-600">{dailyGoals.timeCompleted} / {dailyGoals.timeGoal}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((dailyGoals.timeCompleted / dailyGoals.timeGoal) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
