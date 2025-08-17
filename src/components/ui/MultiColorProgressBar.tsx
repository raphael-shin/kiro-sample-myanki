interface ProgressSegment {
  value: number;
  color: string;
  label: string;
}

interface MultiColorProgressBarProps {
  segments: ProgressSegment[];
  total: number;
  height?: string;
  className?: string;
}

export const MultiColorProgressBar = ({ 
  segments, 
  total, 
  height = "h-2", 
  className = "" 
}: MultiColorProgressBarProps) => {
  if (total === 0) {
    return (
      <div className={`w-full ${height} bg-gray-200 dark:bg-gray-700 rounded-full ${className}`} />
    );
  }

  return (
    <div className={`w-full ${height} bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden ${className}`}>
      <div className="flex h-full">
        {segments.map((segment, index) => {
          const percentage = (segment.value / total) * 100;
          if (percentage === 0) return null;
          
          return (
            <div
              key={index}
              className={`${segment.color} transition-all duration-300`}
              style={{ width: `${percentage}%` }}
              title={`${segment.label}: ${segment.value}장 (${percentage.toFixed(1)}%)`}
            />
          );
        })}
      </div>
    </div>
  );
};
