import { Deck } from '../../../../types/flashcard';
import { DeckCard } from './DeckCard';

interface DeckListProps {
  decks: Deck[];
  loading?: boolean;
}

export const DeckList = ({ decks, loading }: DeckListProps) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <span className="text-gray-500">Loading decks...</span>
      </div>
    );
  }

  if (decks.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No decks found. Create your first deck to get started!</p>
      </div>
    );
  }

  return (
    <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {decks.map((deck) => (
        <li key={deck.id}>
          <DeckCard deck={deck} />
        </li>
      ))}
    </ul>
  );
};
