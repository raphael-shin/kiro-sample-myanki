import { Card } from '../../../../types/flashcard';

interface CardDisplayProps {
  card: Card;
  showAnswer: boolean;
  onShowAnswer: () => void;
  cardNumber: number;
  totalCards: number;
}

export const CardDisplay = ({ 
  card, 
  showAnswer, 
  onShowAnswer, 
  cardNumber, 
  totalCards 
}: CardDisplayProps) => {
  return (
    <div data-testid="card-display" className="bg-white rounded-lg shadow-lg p-8">
      {/* Card Progress Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="text-sm text-gray-500">
          Card {cardNumber} of {totalCards}
        </div>
        <div className="text-sm text-gray-500">
          {Math.round((cardNumber / totalCards) * 100)}% Complete
        </div>
      </div>

      <div className="text-center">
        <div className="mb-6">
          <h2 className="text-xl font-medium text-gray-900 mb-4">Question</h2>
          <div className="text-lg leading-relaxed">
            {card.front}
          </div>
        </div>

        {showAnswer && (
          <div className="border-t pt-6">
            <h2 className="text-xl font-medium text-gray-900 mb-4">Answer</h2>
            <div className="text-lg leading-relaxed">
              {card.back}
            </div>
          </div>
        )}

        {!showAnswer && (
          <button
            onClick={onShowAnswer}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Show Answer
          </button>
        )}
      </div>
    </div>
  );
};
