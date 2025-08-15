import { useState } from 'react';
import { Card } from '../../../../types/flashcard';

interface StudyInterfaceProps {
  cards: Card[];
  onComplete: () => void;
  onExit: () => void;
}

export const StudyInterface = ({ cards, onComplete, onExit }: StudyInterfaceProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const currentCard = cards[currentIndex];

  const handleShowAnswer = () => {
    setShowAnswer(true);
  };

  const handleAnswer = () => {
    if (currentIndex + 1 >= cards.length) {
      onComplete();
    } else {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
    }
  };

  if (!currentCard) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="text-sm text-gray-600">
          {currentIndex + 1} / {cards.length}
        </div>
        <button
          onClick={onExit}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
        >
          Exit
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
        <div className="text-center">
          <div className="mb-6">
            <h2 className="text-xl font-medium text-gray-900 mb-4">Question</h2>
            <p className="text-lg">{currentCard.front}</p>
          </div>

          {showAnswer && (
            <div className="border-t pt-6">
              <h2 className="text-xl font-medium text-gray-900 mb-4">Answer</h2>
              <p className="text-lg">{currentCard.back}</p>
            </div>
          )}
        </div>
      </div>

      {!showAnswer ? (
        <div className="text-center">
          <button
            onClick={handleShowAnswer}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Show Answer
          </button>
        </div>
      ) : (
        <div className="flex justify-center gap-3">
          <button
            onClick={handleAnswer}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Again
          </button>
          <button
            onClick={handleAnswer}
            className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
          >
            Hard
          </button>
          <button
            onClick={handleAnswer}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Good
          </button>
          <button
            onClick={handleAnswer}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Easy
          </button>
        </div>
      )}
    </div>
  );
};
