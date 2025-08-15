import { useState, useEffect } from 'react';
import { DeckList } from './DeckList';
import { CreateDeckModal } from '../CreateDeckModal/CreateDeckModal';
import { useDeckStore } from '@/store/DeckStore';
import { CardService } from '@/services/CardService';
import { db } from '@/db/MyAnkiDB';

interface DeckManagerPageProps {
  onDeckSelect?: (deckId: number) => void;
}

export const DeckManagerPage: React.FC<DeckManagerPageProps> = ({ onDeckSelect }) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [cardCounts, setCardCounts] = useState<Record<number, number>>({});
  const { decks, loading, error, createDeck, loadDecks } = useDeckStore();
  const cardService = new CardService(db);

  useEffect(() => {
    loadDecks();
  }, [loadDecks]);

  useEffect(() => {
    const loadCardCounts = async () => {
      const counts: Record<number, number> = {};
      for (const deck of decks) {
        if (deck.id) {
          try {
            const count = await cardService.getCardCount(deck.id);
            counts[deck.id] = count;
          } catch (error) {
            console.error(`Failed to load card count for deck ${deck.id}:`, error);
            counts[deck.id] = 0;
          }
        }
      }
      setCardCounts(counts);
    };

    if (decks.length > 0) {
      loadCardCounts();
    }
  }, [decks]);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">덱 관리</h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
        >
          새 덱 만들기
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <DeckList 
        decks={decks}
        loading={loading}
        onDeckSelect={onDeckSelect}
        cardCounts={cardCounts}
      />

      <CreateDeckModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={async (name, description) => {
          try {
            await createDeck({ name, description });
            setIsCreateModalOpen(false);
          } catch (error) {
            console.error('Failed to create deck:', error);
          }
        }}
      />
    </div>
  );
};
