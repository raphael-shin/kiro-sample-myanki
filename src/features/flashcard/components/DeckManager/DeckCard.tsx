import { useState } from 'react';
import { Deck } from '../../../../types/flashcard';
import { CardStats, formatCardStats } from '../../../../utils/cardStats';
import { KebabMenu } from '../../../../components/ui/KebabMenu';
import { DeleteConfirmModal } from '../../../../components/ui/DeleteConfirmModal';
import { MultiColorProgressBar } from '../../../../components/ui/MultiColorProgressBar';
import { Chip } from '../../../../components/ui/Chip';

interface DeckCardProps {
  deck: Deck;
  cardCount?: number;
  cardStats?: CardStats;
  lastStudiedAt?: Date;
  onSelect?: (deck: Deck) => void;
  isSelected?: boolean;
  onDelete?: (deck: Deck) => void;
  onEdit?: (deck: Deck) => void;
  onStudy?: (deck: Deck) => void;
  onStats?: (deck: Deck) => void;
}

export const DeckCard = ({ deck, cardCount, cardStats, lastStudiedAt, onSelect, isSelected, onDelete, onEdit, onStudy, onStats }: DeckCardProps) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const isSelectable = !!onSelect;

  const handleClick = () => {
    if (onSelect) {
      onSelect(deck);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    onDelete?.(deck);
  };

  const handleStudy = (event: React.MouseEvent) => {
    event.stopPropagation();
    onStudy?.(deck);
  };

  // Kebab 메뉴 아이템들
  const menuItems = [
    ...(onEdit ? [{
      label: '카드 편집',
      onClick: () => onEdit(deck),
      className: 'text-gray-700 dark:text-gray-300'
    }] : []),
    ...(onStats ? [{
      label: '카드 통계',
      onClick: () => onStats(deck),
      className: 'text-gray-700 dark:text-gray-300'
    }] : []),
    ...(onDelete ? [{
      label: '덱 삭제',
      onClick: handleDelete,
      className: 'text-red-600 dark:text-red-400'
    }] : [])
  ];

  const formatCardCount = (count: number): string => {
    return count === 1 ? '1 card' : `${count} cards`;
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString();
  };

  const baseClasses = "w-full p-6 border rounded-lg bg-white dark:bg-gray-800 shadow-sm min-h-[12rem] flex flex-col";
  const selectedClasses = isSelected ? "ring-2 ring-blue-500" : "";
  const interactiveClasses = isSelectable ? "cursor-pointer hover:shadow-md hover:border-blue-300 transition-all duration-200" : "";
  
  const className = `${baseClasses} ${selectedClasses} ${interactiveClasses}`.trim();

  return (
    <>
      <div 
        className={className}
        onClick={isSelectable ? handleClick : undefined}
        onKeyDown={isSelectable ? handleKeyDown : undefined}
        role={isSelectable ? "button" : undefined}
        tabIndex={isSelectable ? 0 : undefined}
        aria-pressed={isSelectable ? isSelected : undefined}
      >
        {/* 상단: 제목 + 컨텍스트 액션 */}
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2 flex-1 mr-2">
            {deck.name}
          </h3>
          {menuItems.length > 0 && (
            <KebabMenu items={menuItems} />
          )}
        </div>

        {/* 하단: 카드 통계 */}
        <div className="mt-auto pt-3 border-t border-gray-200 dark:border-gray-600">
          <div className="space-y-2">
            {/* 총 카드 수 + 마지막 학습 날짜 */}
            <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
              <span>{cardStats ? `총 ${cardStats.total}장` : (cardCount !== undefined ? formatCardCount(cardCount) : '0 cards')}</span>
              {lastStudiedAt && (
                <span>Last: {formatDate(lastStudiedAt)}</span>
              )}
            </div>

            {/* 오늘 복습할 카드 (항상 표시) */}
            <div className="text-xs font-medium">
              {cardStats && cardStats.dueToday > 0 ? (
                <span className="text-blue-600 dark:text-blue-400">
                  오늘 복습 {cardStats.dueToday}장
                </span>
              ) : (
                <span className="text-green-600 dark:text-green-400">
                  오늘 학습 완료
                </span>
              )}
            </div>

            {/* 프로그레스 바 + 칩 */}
            {cardStats && cardStats.total > 0 && (
              <div className="space-y-1.5">
                <MultiColorProgressBar
                  segments={[
                    { value: cardStats.new, color: 'bg-blue-500', label: '신규' },
                    { value: cardStats.learning, color: 'bg-yellow-500', label: '학습중' },
                    { value: cardStats.mastered, color: 'bg-green-500', label: '완료' }
                  ]}
                  total={cardStats.total}
                  height="h-1.5"
                />
                <div className="flex gap-1 flex-wrap">
                  <Chip label="신규" count={cardStats.new} color="blue" />
                  <Chip label="학습중" count={cardStats.learning} color="yellow" />
                  <Chip label="완료" count={cardStats.mastered} color="green" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Study 버튼 (하단 중앙) */}
        {onStudy && (
          <div className="mt-2">
            <button
              onClick={handleStudy}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
            >
              학습 시작
            </button>
          </div>
        )}
      </div>

      {/* 삭제 확인 모달 */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="덱 삭제"
        message={`"${deck.name}" 덱을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
      />
    </>
  );
};
