import { useEffect } from 'react';
import { useStatisticsStore } from '../../../../store/StatisticsStore';
import { DeckStatistics } from '../../../../types/flashcard';

interface DeckStatsProps {
  deckId: number;
  showDetailedBreakdown?: boolean;
  showTrendChart?: boolean;
}

const formatTime = (milliseconds: number): string => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

export const DeckStats: React.FC<DeckStatsProps> = ({ 
  deckId, 
  showDetailedBreakdown = false,
  showTrendChart = false 
}) => {
  const {
    deckStats,
    loading,
    error,
    loadDeckStats
  } = useStatisticsStore();

  const currentDeckStats = deckStats.get(deckId);

  useEffect(() => {
    loadDeckStats(deckId);
  }, [deckId, loadDeckStats]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            <div className="h-3 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
        <div className="text-red-600 dark:text-red-400">
          <h3 className="font-medium">Error loading deck statistics</h3>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (!currentDeckStats) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
        <div className="text-gray-500 dark:text-gray-400">
          <p>No statistics available for this deck</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
        Deck Statistics
      </h3>
      
      {/* Basic Statistics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {currentDeckStats.totalCards}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300">Total Cards</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {currentDeckStats.totalSessions}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300">Sessions</div>
        </div>
      </div>

      {/* Card Status Breakdown */}
      <div className="space-y-3 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-blue-600 dark:text-blue-400">New Cards</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {currentDeckStats.newCards}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-orange-600 dark:text-orange-400">Learning Cards</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {currentDeckStats.learningCards}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-yellow-600 dark:text-yellow-400">Review Cards</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {currentDeckStats.reviewCards}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-green-600 dark:text-green-400">Completed Cards</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {currentDeckStats.completedCards}
          </span>
        </div>
      </div>

      {/* Detailed Breakdown */}
      {showDetailedBreakdown && (
        <div className="border-t pt-4 space-y-3">
          <h4 className="font-medium text-gray-900 dark:text-white">Performance Metrics</h4>
          
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-300">Total Study Time:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {formatTime(currentDeckStats.totalStudyTime)}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-300">Average Session:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {formatTime(currentDeckStats.averageSessionTime)}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-300">Average Quality:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {currentDeckStats.averageQuality.toFixed(1)}/4.0
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-300">Retention Rate:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {Math.round(currentDeckStats.retentionRate * 100)}%
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-300">Mastery Level:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {Math.round(currentDeckStats.masteryLevel * 100)}%
            </span>
          </div>
        </div>
      )}

      {/* Trend Chart Placeholder */}
      {showTrendChart && (
        <div className="border-t pt-4 mt-4">
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">Learning Trend</h4>
          <div className="h-32 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
            <span className="text-gray-500 dark:text-gray-400 text-sm">
              Trend chart visualization
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
