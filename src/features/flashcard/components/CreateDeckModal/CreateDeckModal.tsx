import { useState } from 'react';

interface CreateDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, description?: string) => void;
  existingDeckNames?: string[];
}

export const CreateDeckModal = ({ isOpen, onClose, onCreate, existingDeckNames = [] }: CreateDeckModalProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [nameError, setNameError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const validateName = (value: string) => {
    if (!value.trim()) {
      setNameError('Deck name is required');
      return false;
    } else if (value.length > 100) {
      setNameError('Deck name must be 100 characters or less');
      return false;
    } else if (existingDeckNames.some(existing => existing.toLowerCase() === value.trim().toLowerCase())) {
      setNameError('Deck name already exists');
      return false;
    } else {
      setNameError('');
      return true;
    }
  };

  const validateDescription = (value: string) => {
    if (value.length > 500) {
      setDescriptionError('Description must be 500 characters or less');
      return false;
    } else {
      setDescriptionError('');
      return true;
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    if (nameError) {
      validateName(value);
    }
  };

  const handleNameBlur = () => {
    validateName(name);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setDescription(value);
    if (descriptionError) {
      validateDescription(value);
    }
  };

  const handleDescriptionBlur = () => {
    validateDescription(description);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const isNameValid = validateName(name);
    const isDescriptionValid = validateDescription(description);
    
    if (!isNameValid || !isDescriptionValid) {
      return;
    }

    setIsLoading(true);
    try {
      await onCreate(name, description);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      data-testid="modal-overlay"
      onClick={handleOverlayClick}
    >
      <div 
        className="bg-white rounded-lg p-6 w-full max-w-md"
        role="dialog"
        aria-labelledby="modal-title"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 id="modal-title" className="text-xl font-semibold">Create New Deck</h2>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="deck-name" className="block text-sm font-medium text-gray-700 mb-2">
              Deck Name
            </label>
            <input
              id="deck-name"
              type="text"
              value={name}
              onChange={handleNameChange}
              onBlur={handleNameBlur}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter deck name"
              disabled={isLoading}
            />
            {nameError && (
              <p className="mt-1 text-sm text-red-600">{nameError}</p>
            )}
          </div>

          <div className="mb-6">
            <label htmlFor="deck-description" className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              id="deck-description"
              value={description}
              onChange={handleDescriptionChange}
              onBlur={handleDescriptionBlur}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter deck description"
              disabled={isLoading}
            />
            <div className="flex justify-between items-center mt-1">
              {descriptionError && (
                <p className="text-sm text-red-600">{descriptionError}</p>
              )}
              <p className="text-sm text-gray-500 ml-auto">{description.length}/500</p>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
