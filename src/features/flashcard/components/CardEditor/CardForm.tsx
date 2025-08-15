import { useState } from 'react';

interface CardFormProps {
  onSave: (front: string, back: string) => void;
  onCancel: () => void;
  initialFront?: string;
  initialBack?: string;
}

export const CardForm = ({ onSave, onCancel, initialFront = '', initialBack = '' }: CardFormProps) => {
  const [front, setFront] = useState(initialFront);
  const [back, setBack] = useState(initialBack);
  const [frontError, setFrontError] = useState('');
  const [backError, setBackError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [saveError, setSaveError] = useState('');

  const validateFront = (value: string) => {
    if (!value.trim()) {
      setFrontError('Front content is required');
      return false;
    } else if (value.length > 1000) {
      setFrontError('Front content must be 1000 characters or less');
      return false;
    } else {
      setFrontError('');
      return true;
    }
  };

  const validateBack = (value: string) => {
    if (!value.trim()) {
      setBackError('Back content is required');
      return false;
    } else if (value.length > 1000) {
      setBackError('Back content must be 1000 characters or less');
      return false;
    } else {
      setBackError('');
      return true;
    }
  };

  const handleFrontChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFront(value);
    if (frontError) {
      validateFront(value);
    }
  };

  const handleBackChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBack(value);
    if (backError) {
      validateBack(value);
    }
  };

  const handleFrontBlur = () => {
    validateFront(front);
  };

  const handleBackBlur = () => {
    validateBack(back);
  };

  const handleSave = async () => {
    const isFrontValid = validateFront(front);
    const isBackValid = validateBack(back);
    
    if (isFrontValid && isBackValid) {
      setIsLoading(true);
      setSaveError('');
      
      try {
        await onSave(front.trim(), back.trim());
      } catch (error) {
        setSaveError('Failed to save card');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="card-front" className="block text-sm font-medium text-gray-700 mb-2">
          Front
        </label>
        <input
          id="card-front"
          type="text"
          value={front}
          onChange={handleFrontChange}
          onBlur={handleFrontBlur}
          disabled={isLoading}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter front content"
        />
        {frontError && (
          <p className="mt-1 text-sm text-red-600">{frontError}</p>
        )}
      </div>

      <div>
        <label htmlFor="card-back" className="block text-sm font-medium text-gray-700 mb-2">
          Back
        </label>
        <input
          id="card-back"
          type="text"
          value={back}
          onChange={handleBackChange}
          onBlur={handleBackBlur}
          disabled={isLoading}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter back content"
        />
        {backError && (
          <p className="mt-1 text-sm text-red-600">{backError}</p>
        )}
      </div>

      {saveError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{saveError}</p>
        </div>
      )}

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  );
};
