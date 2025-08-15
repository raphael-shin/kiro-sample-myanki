import { CardForm } from './CardForm';
import { CardList } from './CardList';
import { useDeckStore } from '@/store/DeckStore';

interface CardEditorPageProps {
  deckId: number;
  onBack?: () => void;
}

export const CardEditorPage: React.FC<CardEditorPageProps> = ({ deckId, onBack }) => {
  const { currentDeck } = useDeckStore();

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">카드 편집</h1>
          {currentDeck && (
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              덱: {currentDeck.name}
            </p>
          )}
        </div>
        {onBack && (
          <button
            onClick={onBack}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md font-medium"
          >
            뒤로 가기
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            새 카드 추가
          </h2>
          <CardForm deckId={deckId} />
        </div>
        
        <div>
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            카드 목록
          </h2>
          <CardList deckId={deckId} />
        </div>
      </div>
    </div>
  );
};
