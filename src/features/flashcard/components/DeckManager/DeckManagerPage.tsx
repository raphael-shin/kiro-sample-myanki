import { useState } from 'react';
import { DeckList } from './DeckList';
import { CreateDeckModal } from '../CreateDeckModal/CreateDeckModal';
import { useDeckStore } from '@/store/DeckStore';

interface DeckManagerPageProps {
  onDeckSelect?: (deckId: number) => void;
}

export const DeckManagerPage: React.FC<DeckManagerPageProps> = ({ onDeckSelect }) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { decks, loading, error } = useDeckStore();

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
      />

      <CreateDeckModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
};
