interface StudyProgressProps {
  current: number;
  total: number;
}

export const StudyProgress: React.FC<StudyProgressProps> = ({ current, total }) => {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

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
    </div>
  );
};
