interface StudyProgressProps {
  current: number;
  total: number;
  percentage: number;
  timeElapsed?: number;
  estimatedTimeRemaining?: number;
}

const formatTime = (milliseconds: number): string => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }
  return `${minutes}m ${seconds}s`;
};

export const StudyProgress: React.FC<StudyProgressProps> = ({ 
  current, 
  total, 
  percentage,
  timeElapsed,
  estimatedTimeRemaining
}) => {
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          진행률
        </span>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {current} / {total}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="text-center mt-2">
        <span className="text-lg font-semibold text-blue-600">
          {percentage}%
        </span>
      </div>
      
      {/* Time Information */}
      {(timeElapsed !== undefined || estimatedTimeRemaining !== undefined) && (
        <div className="flex justify-between items-center mt-3 text-xs text-gray-500">
          {timeElapsed !== undefined && (
            <span>Elapsed: {formatTime(timeElapsed)}</span>
          )}
          {estimatedTimeRemaining !== undefined && (
            <span>Remaining: ~{formatTime(estimatedTimeRemaining)}</span>
          )}
        </div>
      )}
    </div>
  );
};
