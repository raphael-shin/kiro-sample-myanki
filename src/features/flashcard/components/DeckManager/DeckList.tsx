import { Deck } from '../../../../types/flashcard';
import { DeckCard } from './DeckCard';

interface DeckListProps {
  decks: Deck[];
  loading?: boolean;
  onDeckSelect?: (deckId: number) => void;
  onDeckDelete?: (deckId: number) => void;
  cardCounts?: Record<number, number>;
}

export const DeckList = ({ decks, loading, onDeckSelect, onDeckDelete, cardCounts }: DeckListProps) => {
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
          <DeckCard 
            deck={deck} 
            cardCount={deck.id ? cardCounts?.[deck.id] : 0}
            onSelect={onDeckSelect ? (selectedDeck) => onDeckSelect(selectedDeck.id!) : undefined}
            onDelete={onDeckDelete ? (selectedDeck) => onDeckDelete(selectedDeck.id!) : undefined}
          />
        </li>
      ))}
    </ul>
  );
};
