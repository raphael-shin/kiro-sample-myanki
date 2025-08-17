import { useState } from 'react';
import { GeneratedCard } from '@/types/ai-generation';
import { Button } from '@/components/ui/Button';

interface CardPreviewGridProps {
  cards: GeneratedCard[];
  selectedCards: Set<string>;
  onSelectionChange: (cardId: string, selected: boolean) => void;
  onCardEdit: (cardId: string, updates: Partial<GeneratedCard>) => void;
}

interface EditingCard {
  id: string;
  front: string;
  back: string;
}

export function CardPreviewGrid({ 
  cards, 
  selectedCards, 
  onSelectionChange, 
  onCardEdit 
}: CardPreviewGridProps) {
  const [editingCard, setEditingCard] = useState<EditingCard | null>(null);

  const handleSelectAll = () => {
    const allSelected = cards.every(card => selectedCards.has(card.id));
    cards.forEach(card => {
      onSelectionChange(card.id, !allSelected);
    });
  };

  const handleEditStart = (card: GeneratedCard) => {
    setEditingCard({
      id: card.id,
      front: card.front,
      back: card.back
    });
  };

  const handleEditSave = () => {
    if (editingCard) {
      onCardEdit(editingCard.id, {
        front: editingCard.front,
        back: editingCard.back
      });
      setEditingCard(null);
    }
  };

  const handleEditCancel = () => {
    setEditingCard(null);
  };

  const selectedCount = selectedCards.size;
  const totalCount = cards.length;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">
          생성된 카드 ({selectedCount}/{totalCount}개 선택)
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSelectAll}
        >
          {selectedCount === totalCount ? '전체 해제' : '전체 선택'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
        {cards.map(card => {
          const isSelected = selectedCards.has(card.id);
          const isEditing = editingCard?.id === card.id;
          
          return (
            <div 
              key={card.id}
              className={`border rounded-lg p-4 transition-colors ${
                isSelected 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={(e) => onSelectionChange(card.id, e.target.checked)}
                  className="mt-1"
                />
                
                <div className="flex-1">
                  {isEditing ? (
                    <div className="space-y-2">
                      <textarea
                        value={editingCard.front}
                        onChange={(e) => setEditingCard(prev => prev ? { ...prev, front: e.target.value } : null)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded resize-none"
                        rows={2}
                        placeholder="앞면"
                      />
                      <textarea
                        value={editingCard.back}
                        onChange={(e) => setEditingCard(prev => prev ? { ...prev, back: e.target.value } : null)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded resize-none"
                        rows={3}
                        placeholder="뒷면"
                      />
                      <div className="flex gap-1">
                        <Button size="sm" onClick={handleEditSave}>저장</Button>
                        <Button size="sm" variant="outline" onClick={handleEditCancel}>취소</Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="font-medium mb-2">{card.front}</div>
                      <div className="text-sm text-gray-600 whitespace-pre-line mb-2">{card.back}</div>
                      <button
                        onClick={() => handleEditStart(card)}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        편집
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {cards.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          생성된 카드가 없습니다.
        </div>
      )}
    </div>
  );
}
