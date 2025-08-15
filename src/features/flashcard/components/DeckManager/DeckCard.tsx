import { Deck } from '../../../../types/flashcard';

interface DeckCardProps {
  deck: Deck;
  cardCount?: number;
  lastStudiedAt?: Date;
  onSelect?: (deck: Deck) => void;
  isSelected?: boolean;
  onDelete?: (deck: Deck) => void;
}

export const DeckCard = ({ deck, cardCount, lastStudiedAt, onSelect, isSelected, onDelete }: DeckCardProps) => {
  const formatCardCount = (count: number) => {
    return count === 1 ? '1 card' : `${count} cards`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString();
  };

  const handleClick = () => {
    onSelect?.(deck);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect?.(deck);
    }
  };

  const handleDelete = (event: React.MouseEvent) => {
    event.stopPropagation();
    const confirmed = window.confirm(`Are you sure you want to delete "${deck.name}"?`);
    if (confirmed) {
      onDelete?.(deck);
    }
  };

  const baseClasses = "p-4 border rounded-lg bg-white shadow-sm";
  const selectedClasses = isSelected ? "ring-2 ring-blue-500" : "";
  const interactiveClasses = onSelect ? "cursor-pointer hover:shadow-md transition-shadow" : "";
  
  const className = `${baseClasses} ${selectedClasses} ${interactiveClasses}`.trim();

  // When onDelete is present, use div container to avoid button nesting
  if (onDelete) {
    return (
      <div className={className}>
        <div 
          onClick={onSelect ? handleClick : undefined}
          onKeyDown={onSelect ? handleKeyDown : undefined}
          role={onSelect ? "button" : undefined}
          tabIndex={onSelect ? 0 : undefined}
          aria-pressed={onSelect ? isSelected : undefined}
          className={onSelect ? "flex-1" : undefined}
        >
          <h3 className="text-lg font-semibold text-gray-900">{deck.name}</h3>
          {deck.description && (
            <p className="mt-2 text-sm text-gray-600">{deck.description}</p>
          )}
          
          {(cardCount !== undefined || lastStudiedAt) && (
            <div className="mt-3 flex flex-col gap-1 text-xs text-gray-500">
              {cardCount !== undefined && (
                <span>{formatCardCount(cardCount)}</span>
              )}
              {lastStudiedAt && (
                <span>Last studied: {formatDate(lastStudiedAt)}</span>
              )}
            </div>
          )}
        </div>

        <button
          onClick={handleDelete}
          aria-label={`Delete ${deck.name}`}
          className="mt-3 px-3 py-1 text-xs text-red-600 border border-red-300 rounded hover:bg-red-50"
        >
          Delete
        </button>
      </div>
    );
  }

  // Original behavior when no onDelete
  const Component = onSelect ? 'button' : 'article';
  const props = onSelect ? {
    role: 'button',
    tabIndex: 0,
    onClick: handleClick,
    onKeyDown: handleKeyDown,
    'aria-pressed': isSelected,
    className
  } : {
    className
  };

  return (
    <Component {...props}>
      <h3 className="text-lg font-semibold text-gray-900">{deck.name}</h3>
      {deck.description && (
        <p className="mt-2 text-sm text-gray-600">{deck.description}</p>
      )}
      
      {(cardCount !== undefined || lastStudiedAt) && (
        <div className="mt-3 flex flex-col gap-1 text-xs text-gray-500">
          {cardCount !== undefined && (
            <span>{formatCardCount(cardCount)}</span>
          )}
          {lastStudiedAt && (
            <span>Last studied: {formatDate(lastStudiedAt)}</span>
          )}
        </div>
      )}
    </Component>
  );
};
