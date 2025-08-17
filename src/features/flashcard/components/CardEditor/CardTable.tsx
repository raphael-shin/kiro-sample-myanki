import { useState } from 'react';
import { Card, UpdateCardInput } from '@/types/flashcard';

interface CardTableProps {
  cards: Card[];
  selectedCards: Set<number>;
  onSelectionChange: (selected: Set<number>) => void;
  onCardUpdate: (cardId: number, updates: UpdateCardInput) => Promise<{ success: boolean; error?: string }>;
  onCardDelete: (cardId: number) => void;
  getStatusText: (card: Card) => string;
  getStatusColor: (status: string) => string;
}

interface EditingCard {
  id: number;
  front: string;
  back: string;
  originalFront: string;
  originalBack: string;
}

export const CardTable = ({
  cards,
  selectedCards,
  onSelectionChange,
  onCardUpdate,
  onCardDelete,
  getStatusText,
  getStatusColor
}: CardTableProps) => {
  const [editingCard, setEditingCard] = useState<EditingCard | null>(null);
  const [savingCard, setSavingCard] = useState<number | null>(null);
  const [editError, setEditError] = useState<string>('');

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(new Set(cards.map(card => card.id!)));
    } else {
      onSelectionChange(new Set());
    }
  };

  const handleSelectCard = (cardId: number, checked: boolean) => {
    const newSelected = new Set(selectedCards);
    if (checked) {
      newSelected.add(cardId);
    } else {
      newSelected.delete(cardId);
    }
    onSelectionChange(newSelected);
  };

  const startEditing = (card: Card) => {
    setEditingCard({
      id: card.id!,
      front: card.front,
      back: card.back,
      originalFront: card.front,
      originalBack: card.back
    });
    setEditError('');
  };

  const cancelEditing = () => {
    setEditingCard(null);
    setEditError('');
  };

  const saveEditing = async () => {
    if (!editingCard) return;

    if (!editingCard.front.trim()) {
      setEditError('앞면을 입력하세요.');
      return;
    }
    if (!editingCard.back.trim()) {
      setEditError('뒷면을 입력하세요.');
      return;
    }

    setSavingCard(editingCard.id);
    setEditError('');

    const result = await onCardUpdate(editingCard.id, {
      front: editingCard.front.trim(),
      back: editingCard.back.trim()
    });

    setSavingCard(null);

    if (result.success) {
      setEditingCard(null);
    } else {
      setEditError(result.error || '저장에 실패했습니다.');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      cancelEditing();
    } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      saveEditing();
    }
  };

  const truncateText = (text: string, maxLength: number = 50) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date(date)).replace(/\. /g, '-').replace('.', '');
  };

  const allSelected = cards.length > 0 && cards.every(card => selectedCards.has(card.id!));
  const someSelected = cards.some(card => selectedCards.has(card.id!));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      {/* 테이블 헤더 */}
      <div className="bg-gray-50 dark:bg-gray-700 px-6 py-3 border-b border-gray-200 dark:border-gray-600">
        <div className="grid grid-cols-12 gap-4 items-center text-sm font-medium text-gray-700 dark:text-gray-300">
          <div className="col-span-1">
            <input
              type="checkbox"
              checked={allSelected}
              ref={(input) => {
                if (input) input.indeterminate = someSelected && !allSelected;
              }}
              onChange={(e) => handleSelectAll(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
          </div>
          <div className="col-span-4">앞면</div>
          <div className="col-span-4">뒷면</div>
          <div className="col-span-1">상태</div>
          <div className="col-span-1">수정일</div>
          <div className="col-span-1">작업</div>
        </div>
      </div>

      {/* 테이블 바디 */}
      <div className="divide-y divide-gray-200 dark:divide-gray-600">
        {cards.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
            카드가 없습니다.
          </div>
        ) : (
          cards.map((card) => {
            const isEditing = editingCard?.id === card.id;
            const isSaving = savingCard === card.id;
            const status = getStatusText(card);

            return (
              <div key={card.id} className="px-6 py-4">
                {isEditing ? (
                  /* 편집 모드 */
                  <div className="space-y-4">
                    <div className="grid grid-cols-12 gap-4 items-start">
                      <div className="col-span-1">
                        <input
                          type="checkbox"
                          checked={selectedCards.has(card.id!)}
                          onChange={(e) => handleSelectCard(card.id!, e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-2"
                        />
                      </div>
                      <div className="col-span-5">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          앞면
                        </label>
                        <textarea
                          value={editingCard.front}
                          onChange={(e) => setEditingCard({ ...editingCard, front: e.target.value })}
                          onKeyDown={handleKeyDown}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                          rows={3}
                          placeholder="앞면 내용을 입력하세요"
                        />
                      </div>
                      <div className="col-span-5">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          뒷면
                        </label>
                        <textarea
                          value={editingCard.back}
                          onChange={(e) => setEditingCard({ ...editingCard, back: e.target.value })}
                          onKeyDown={handleKeyDown}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                          rows={3}
                          placeholder="뒷면 내용을 입력하세요"
                        />
                      </div>
                      <div className="col-span-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(status)}`}>
                          {status}
                        </span>
                      </div>
                    </div>

                    {editError && (
                      <div className="text-sm text-red-600 dark:text-red-400">
                        {editError}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={saveEditing}
                        disabled={isSaving}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSaving ? '저장 중...' : '저장'}
                      </button>
                      <button
                        onClick={cancelEditing}
                        disabled={isSaving}
                        className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                      >
                        취소
                      </button>
                      <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                        Ctrl+Enter: 저장, Esc: 취소
                      </div>
                    </div>
                  </div>
                ) : (
                  /* 보기 모드 */
                  <div className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-1">
                      <input
                        type="checkbox"
                        checked={selectedCards.has(card.id!)}
                        onChange={(e) => handleSelectCard(card.id!, e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </div>
                    <div className="col-span-4">
                      <div className="text-sm text-gray-900 dark:text-white" title={card.front}>
                        {truncateText(card.front)}
                      </div>
                    </div>
                    <div className="col-span-4">
                      <div className="text-sm text-gray-900 dark:text-white" title={card.back}>
                        {truncateText(card.back)}
                      </div>
                    </div>
                    <div className="col-span-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(status)}`}>
                        {status}
                      </span>
                    </div>
                    <div className="col-span-1">
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(card.updatedAt)}
                      </div>
                    </div>
                    <div className="col-span-1">
                      <div className="flex gap-1">
                        <button
                          onClick={() => startEditing(card)}
                          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                          title="편집"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
                          </svg>
                        </button>
                        <button
                          onClick={() => onCardDelete(card.id!)}
                          className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                          title="삭제"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                            <path fillRule="evenodd" d="M4 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 112 0v4a1 1 0 11-2 0V9zm4 0a1 1 0 112 0v4a1 1 0 11-2 0V9z" clipRule="evenodd"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
