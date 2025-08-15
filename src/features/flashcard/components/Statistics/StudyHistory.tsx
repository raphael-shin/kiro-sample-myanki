import { useEffect } from 'react';
import { useStatisticsStore } from '@/store/StatisticsStore';
import { CardStatistics } from '@/types/flashcard';

interface StudyHistoryProps {
  cardId: number;
  limit?: number;
  showChart?: boolean;
}

const qualityLabels = {
  1: 'Again',
  2: 'Hard', 
  3: 'Good',
  4: 'Easy'
} as const;

const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
};

const calculateAccuracy = (stats: CardStatistics): number => {
  return stats.totalReviews > 0 
    ? Math.round((stats.correctAnswers / stats.totalReviews) * 100)
    : 0;
};

const formatResponseTime = (timeMs: number): string => {
  return `${(timeMs / 1000).toFixed(1)}s`;
};

const formatInterval = (days: number): string => {
  return days === 1 ? '1 day' : `${days} days`;
};

const formatNextReviewDate = (date: Date): string => {
  const now = new Date();
  const diffTime = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays > 0) return `In ${diffDays} days`;
  return 'Overdue';
};

const getQualityColor = (quality: number): string => {
  switch (quality) {
    case 1: return 'text-red-600 dark:text-red-400';
    case 2: return 'text-orange-600 dark:text-orange-400';
    case 3: return 'text-blue-600 dark:text-blue-400';
    case 4: return 'text-green-600 dark:text-green-400';
    default: return 'text-gray-600 dark:text-gray-400';
  }
};

const getStatusColor = (nextReviewDate?: Date): string => {
  if (!nextReviewDate) return 'text-gray-600 dark:text-gray-400';
  
  const now = new Date();
  const diffTime = nextReviewDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return 'text-red-600 dark:text-red-400'; // Overdue
  if (diffDays === 0) return 'text-orange-600 dark:text-orange-400'; // Today
  return 'text-green-600 dark:text-green-400'; // Future
};

const calculateImprovementTrend = (history: Array<{quality: number, responseTime: number}>): 'improving' | 'stable' | 'declining' => {
  if (history.length < 2) return 'stable';
  
  const recent = history.slice(-3); // Last 3 sessions
  const early = history.slice(0, 3); // First 3 sessions
  
  const recentAvgQuality = recent.reduce((sum, r) => sum + r.quality, 0) / recent.length;
  const earlyAvgQuality = early.reduce((sum, r) => sum + r.quality, 0) / early.length;
  
  if (recentAvgQuality > earlyAvgQuality + 0.3) return 'improving';
  if (recentAvgQuality < earlyAvgQuality - 0.3) return 'declining';
  return 'stable';
};

const calculateMasteryScore = (stats: CardStatistics): number => {
  const accuracyScore = calculateAccuracy(stats);
  const easeFactorScore = Math.min((stats.easeFactor - 1.3) / (2.5 - 1.3) * 100, 100);
  const intervalScore = Math.min(stats.currentInterval / 30 * 100, 100);
  
  return Math.round((accuracyScore + easeFactorScore + intervalScore) / 3);
};

const getTrendColor = (trend: string): string => {
  switch (trend) {
    case 'improving': return 'text-green-600 dark:text-green-400';
    case 'declining': return 'text-red-600 dark:text-red-400';
    default: return 'text-yellow-600 dark:text-yellow-400';
  }
};

const getTrendIcon = (trend: string): string => {
  switch (trend) {
    case 'improving': return '↗️';
    case 'declining': return '↘️';
    default: return '→';
  }
};

const LearningCurveChart = ({ history, trend, masteryScore }: {
  history: Array<{reviewedAt: Date, quality: number, responseTime: number}>,
  trend: string,
  masteryScore: number
}) => {
  if (history.length === 0) {
    return (
      <div className="text-center text-gray-600 dark:text-gray-300 py-4">
        No data available for chart
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Trend Summary */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="text-center">
          <div className={`font-semibold ${getTrendColor(trend)}`}>
            {getTrendIcon(trend)} Trend: {trend.charAt(0).toUpperCase() + trend.slice(1)}
          </div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-gray-900 dark:text-white">
            🎯 Mastery Score: {masteryScore}%
          </div>
        </div>
      </div>

      {/* Quality Trend */}
      <div>
        <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
          📈 Quality Trend
        </h5>
        <div className="flex flex-wrap gap-2" role="list" aria-label="Quality progression over time">
          {history.map((record, index) => (
            <div 
              key={index} 
              className="text-xs bg-white dark:bg-gray-600 px-2 py-1 rounded shadow-sm"
              role="listitem"
              aria-label={`${formatDate(record.reviewedAt)} quality rating ${record.quality}`}
            >
              {formatDate(record.reviewedAt).replace(', 2024', '')}: Quality {record.quality}
            </div>
          ))}
        </div>
      </div>

      {/* Response Time Trend */}
      <div>
        <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
          ⏱️ Response Time Trend
        </h5>
        <div className="flex flex-wrap gap-2" role="list" aria-label="Response time progression over time">
          {history.map((record, index) => (
            <div 
              key={index} 
              className="text-xs bg-white dark:bg-gray-600 px-2 py-1 rounded shadow-sm"
              role="listitem"
              aria-label={`${formatDate(record.reviewedAt)} response time ${formatResponseTime(record.responseTime)}`}
            >
              {formatDate(record.reviewedAt).replace(', 2024', '')}: {formatResponseTime(record.responseTime)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export function StudyHistory({ cardId, limit, showChart }: StudyHistoryProps) {
  const { cardStats, loading, loadCardStats } = useStatisticsStore();
  
  useEffect(() => {
    if (loadCardStats) {
      loadCardStats(cardId);
    }
  }, [cardId, loadCardStats]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
        <div className="text-center text-gray-600 dark:text-gray-300">
          Loading study history...
        </div>
      </div>
    );
  }

  const cardStatistics = cardStats?.get(cardId);
  
  if (!cardStatistics) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
        <div className="text-center text-gray-600 dark:text-gray-300">
          No study history available
        </div>
      </div>
    );
  }

  const accuracy = calculateAccuracy(cardStatistics);
  const displayHistory = limit 
    ? cardStatistics.learningHistory.slice(0, limit)
    : cardStatistics.learningHistory;

  const improvementTrend = calculateImprovementTrend(cardStatistics.learningHistory);
  const masteryScore = calculateMasteryScore(cardStatistics);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
        Study History
      </h3>
      
      {/* Summary Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4">
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {cardStatistics.totalReviews}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-300">Total Reviews</div>
        </div>
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {accuracy}%
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-300">Accuracy</div>
        </div>
      </div>

      {/* Current Status */}
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h4 className="font-medium text-gray-900 dark:text-white mb-3">Current Status</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <div className="text-center">
            <div className="font-semibold text-gray-900 dark:text-white">
              {cardStatistics.easeFactor}
            </div>
            <div className="text-gray-600 dark:text-gray-300">Ease Factor</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-gray-900 dark:text-white">
              {formatInterval(cardStatistics.currentInterval)}
            </div>
            <div className="text-gray-600 dark:text-gray-300">Current Interval</div>
          </div>
          {cardStatistics.nextReviewDate && (
            <div className="text-center">
              <div className={`font-semibold ${getStatusColor(cardStatistics.nextReviewDate)}`}>
                {formatNextReviewDate(cardStatistics.nextReviewDate)}
              </div>
              <div className="text-gray-600 dark:text-gray-300">Next Review</div>
            </div>
          )}
        </div>
      </div>

      {/* Learning Curve Chart */}
      {showChart && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h4 className="font-medium text-gray-900 dark:text-white mb-4">
            📊 Learning Progress
          </h4>
          <LearningCurveChart 
            history={displayHistory}
            trend={improvementTrend}
            masteryScore={masteryScore}
          />
        </div>
      )}

      {/* Learning History */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900 dark:text-white">
          Recent Sessions {limit && `(${Math.min(limit, displayHistory.length)})`}
        </h4>
        {displayHistory.length === 0 ? (
          <div className="text-center text-gray-600 dark:text-gray-300 py-8">
            No learning sessions recorded yet
          </div>
        ) : (
          displayHistory.map((record, index) => (
            <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border-l-4 border-gray-300 dark:border-gray-600">
              <div className="flex justify-between items-start mb-3">
                <div className="text-sm text-gray-900 dark:text-white font-medium">
                  {formatDate(record.reviewedAt)}
                </div>
                <div className={`text-sm font-semibold px-2 py-1 rounded ${getQualityColor(record.quality)}`}>
                  {qualityLabels[record.quality as keyof typeof qualityLabels]}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-xs text-gray-600 dark:text-gray-300">
                <div className="text-center">
                  <div className="font-medium">{formatResponseTime(record.responseTime)}</div>
                  <div>Response Time</div>
                </div>
                <div className="text-center">
                  <div className="font-medium">{record.easeFactor}</div>
                  <div>Ease Factor</div>
                </div>
                <div className="text-center">
                  <div className="font-medium">{formatInterval(record.interval)}</div>
                  <div>Interval</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
