import { Deck } from '../../../../types/flashcard';
import { DeckCard } from './DeckCard';
import { CardStats } from '../../../../utils/cardStats';

interface DeckListProps {
  decks: Deck[];
  loading?: boolean;
  onDeckSelect?: (deckId: number) => void;
  onDeckDelete?: (deckId: number) => void;
  cardCounts?: Record<number, number>;
  cardStats?: Record<number, CardStats>;
  selectedDeckId?: number | null;
  onDeckEdit?: (deck: { id: number; name: string }) => void;
  onDeckStudy?: (deckId: number) => void;
  onDeckStats?: (deck: { id: number; name: string }) => void;
}

export const DeckList = ({ decks, loading, onDeckSelect, onDeckDelete, cardCounts, cardStats, selectedDeckId, onDeckEdit, onDeckStudy, onDeckStats }: DeckListProps) => {
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
            cardStats={deck.id ? cardStats?.[deck.id] : undefined}
            onSelect={onDeckSelect ? (selectedDeck) => onDeckSelect(selectedDeck.id!) : undefined}
            onDelete={onDeckDelete ? (selectedDeck) => onDeckDelete(selectedDeck.id!) : undefined}
            onEdit={onDeckEdit ? (selectedDeck) => onDeckEdit({ id: selectedDeck.id!, name: selectedDeck.name }) : undefined}
            onStudy={onDeckStudy ? (selectedDeck) => onDeckStudy(selectedDeck.id!) : undefined}
            onStats={onDeckStats ? (selectedDeck) => onDeckStats({ id: selectedDeck.id!, name: selectedDeck.name }) : undefined}
            isSelected={deck.id === selectedDeckId}
          />
        </li>
      ))}
    </ul>
  );
};
