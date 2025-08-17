import { useState, useEffect } from 'react';
import { DeckList } from './DeckList';
import { CreateDeckModal } from '../CreateDeckModal/CreateDeckModal';
import { useDeckStore } from '@/store/DeckStore';
import { CardService } from '@/services/CardService';
import { db } from '@/db/MyAnkiDB';
import { calculateCardStats, CardStats } from '@/utils/cardStats';

interface DeckManagerPageProps {
  onDeckSelect?: (deckId: number) => void;
  selectedDeckId?: number | null;
  onDeckEdit?: (deckId: number) => void;
  onDeckStudy?: (deckId: number) => void;
}

export const DeckManagerPage: React.FC<DeckManagerPageProps> = ({ onDeckSelect, selectedDeckId, onDeckEdit, onDeckStudy }) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [cardCounts, setCardCounts] = useState<Record<number, number>>({});
  const [cardStats, setCardStats] = useState<Record<number, CardStats>>({});
  const { decks, loading, error, createDeck, loadDecks, deleteDeck } = useDeckStore();
  const cardService = new CardService(db);

  const handleDeckDelete = async (deckId: number) => {
    try {
      await deleteDeck(deckId);
      // 카드 개수 상태에서도 해당 덱 제거
      setCardCounts(prev => {
        const newCounts = { ...prev };
        delete newCounts[deckId];
        return newCounts;
      });
    } catch (error) {
      console.error('Failed to delete deck:', error);
    }
  };

  useEffect(() => {
    loadDecks();
  }, [loadDecks]);

  useEffect(() => {
    const loadCardData = async () => {
      const counts: Record<number, number> = {};
      const stats: Record<number, CardStats> = {};
      
      for (const deck of decks) {
        if (deck.id) {
          try {
            const cards = await cardService.getCardsByDeckId(deck.id);
            counts[deck.id] = cards.length;
            stats[deck.id] = calculateCardStats(cards);
          } catch (error) {
            console.error(`Failed to load card data for deck ${deck.id}:`, error);
            counts[deck.id] = 0;
            stats[deck.id] = { total: 0, new: 0, learning: 0, mastered: 0, dueToday: 0 };
          }
        }
      }
      setCardCounts(counts);
      setCardStats(stats);
    };

    if (decks.length > 0) {
      loadCardData();
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
        onDeckDelete={handleDeckDelete}
        cardCounts={cardCounts}
        cardStats={cardStats}
        selectedDeckId={selectedDeckId}
        onDeckEdit={onDeckEdit}
        onDeckStudy={onDeckStudy}
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
