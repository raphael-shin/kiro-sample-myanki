import { useEffect } from 'react';
import { useStatisticsStore } from '@/store/StatisticsStore';

export function GoalTracker() {
  const { dailyGoals, loading, loadGlobalStats } = useStatisticsStore();
  
  useEffect(() => {
    if (loadGlobalStats) {
      loadGlobalStats();
    }
  }, [loadGlobalStats]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
        <div className="text-center text-gray-600 dark:text-gray-300">
          Loading goals...
        </div>
      </div>
    );
  }

  if (!dailyGoals) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
        <div className="text-center text-gray-600 dark:text-gray-300">
          No goals set
        </div>
      </div>
    );
  }

  const cardsProgress = Math.round((dailyGoals.cardsCompleted / dailyGoals.cardsGoal) * 100);
  const timeProgress = Math.round((dailyGoals.timeCompleted / dailyGoals.timeGoal) * 100);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
        Daily Goals
      </h3>
      
      {/* Cards Goal */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-900 dark:text-white">Cards Goal</span>
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {dailyGoals.cardsCompleted} / {dailyGoals.cardsGoal}
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full" 
            style={{ width: `${Math.min(cardsProgress, 100)}%` }}
          />
        </div>
        <div className="text-right text-xs text-gray-600 dark:text-gray-300 mt-1">
          {cardsProgress}%
        </div>
      </div>

      {/* Time Goal */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-900 dark:text-white">Time Goal</span>
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {dailyGoals.timeCompleted} / {dailyGoals.timeGoal} min
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-green-600 dark:bg-green-400 h-2 rounded-full" 
            style={{ width: `${Math.min(timeProgress, 100)}%` }}
          />
        </div>
        <div className="text-right text-xs text-gray-600 dark:text-gray-300 mt-1">
          {timeProgress}%
        </div>
      </div>

      {/* Current Streak */}
      <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="text-center">
          <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
            Current Streak
          </div>
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {dailyGoals.currentStreak} days
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-300">
            Goal: {dailyGoals.streakGoal} days
          </div>
        </div>
      </div>
    </div>
  );
}
