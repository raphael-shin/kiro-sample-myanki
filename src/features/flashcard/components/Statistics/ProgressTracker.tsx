interface CardProgress {
  cardId: number;
  repetitions: number;
  easeFactor: number;
  nextReviewDate: Date;
  interval: number;
}

interface ProgressTrackerProps {
  cardProgress: CardProgress;
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({ cardProgress }) => {
  // 간단한 진행률 계산 (반복 횟수 기반)
  const progressPercentage = Math.min(Math.round((cardProgress.repetitions / 10) * 100), 100);
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
      <h4 className="text-md font-semibold mb-3 text-gray-900 dark:text-white">
        카드 학습 진행률
      </h4>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-300">반복 횟수:</span>
          <span className="font-medium text-gray-900 dark:text-white">{cardProgress.repetitions}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-300">용이도 인수:</span>
          <span className="font-medium text-gray-900 dark:text-white">{cardProgress.easeFactor}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-300">다음 복습 날짜:</span>
          <span className="font-medium text-gray-900 dark:text-white">{formatDate(cardProgress.nextReviewDate)}</span>
        </div>
        
        <div className="border-t pt-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600 dark:text-gray-300">학습 진행률:</span>
            <span className="font-medium text-blue-600 dark:text-blue-400">{progressPercentage}%</span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
