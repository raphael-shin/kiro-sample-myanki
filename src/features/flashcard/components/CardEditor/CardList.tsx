import { Card } from '../../../../types/flashcard';

interface CardListProps {
  cards: Card[];
  onEdit: (card: Card) => void;
  onDelete: (card: Card) => void;
  isLoading?: boolean;
}

export const CardList = ({ cards, onEdit, onDelete, isLoading }: CardListProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <p className="text-gray-500">Loading cards...</p>
      </div>
    );
  }

  if (!cards || cards.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No cards found</p>
      </div>
    );
  }

  return (
    <div data-testid="card-list" className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => (
        <div key={card.id} className="p-4 border rounded-lg bg-white shadow-sm">
          <div className="mb-3">
            <h3 className="text-sm font-medium text-gray-700 mb-1">Front</h3>
            <p className="text-gray-900">{card.front}</p>
          </div>
          
          <div className="mb-3">
            <h3 className="text-sm font-medium text-gray-700 mb-1">Back</h3>
            <p className="text-gray-900">{card.back}</p>
          </div>
          
          <div className="flex justify-end gap-2">
            <button
              onClick={() => onEdit(card)}
              className="px-3 py-1 text-xs text-blue-600 border border-blue-300 rounded hover:bg-blue-50"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(card)}
              className="px-3 py-1 text-xs text-red-600 border border-red-300 rounded hover:bg-red-50"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
