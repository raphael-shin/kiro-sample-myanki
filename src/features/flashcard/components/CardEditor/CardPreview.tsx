interface CardPreviewProps {
  front: string;
  back: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const CardPreview = ({ front, back, onEdit, onDelete }: CardPreviewProps) => {
  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div data-testid="card-preview" className="p-4 border rounded-lg bg-white shadow-sm">
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Front</h3>
        <div className="p-3 bg-gray-50 rounded border min-h-[60px] flex items-center">
          {front ? (
            <p className="text-gray-900">{truncateText(front)}</p>
          ) : (
            <p className="text-gray-400 italic">Enter front content</p>
          )}
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Back</h3>
        <div className="p-3 bg-gray-50 rounded border min-h-[60px] flex items-center">
          {back ? (
            <p className="text-gray-900">{truncateText(back)}</p>
          ) : (
            <p className="text-gray-400 italic">Enter back content</p>
          )}
        </div>
      </div>

      {(onEdit || onDelete) && (
        <div className="flex justify-end gap-2">
          {onEdit && (
            <button
              onClick={onEdit}
              className="px-3 py-1 text-xs text-blue-600 border border-blue-300 rounded hover:bg-blue-50"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="px-3 py-1 text-xs text-red-600 border border-red-300 rounded hover:bg-red-50"
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
};
