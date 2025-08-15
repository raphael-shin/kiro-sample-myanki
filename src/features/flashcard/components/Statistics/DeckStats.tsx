import { DeckStats as DeckStatsType } from '@/types/flashcard';

interface DeckStatsProps {
  stats: DeckStatsType;
}

export const DeckStats: React.FC<DeckStatsProps> = ({ stats }) => {
  const newCards = stats.totalCards - stats.studiedCards;
  const learningCards = Math.floor(stats.studiedCards * 0.7); // 임시 계산
  const completedCards = stats.studiedCards - learningCards;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
        덱 통계
      </h3>
      
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-300">총 카드 수:</span>
          <span className="font-medium text-gray-900 dark:text-white">{stats.totalCards}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-300">학습된 카드 수:</span>
          <span className="font-medium text-gray-900 dark:text-white">{stats.studiedCards}</span>
        </div>
        
        <div className="border-t pt-3 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-blue-600 dark:text-blue-400">신규 카드:</span>
            <span className="font-medium">{newCards}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-orange-600 dark:text-orange-400">학습중 카드:</span>
            <span className="font-medium">{learningCards}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-green-600 dark:text-green-400">완료 카드:</span>
            <span className="font-medium">{completedCards}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
