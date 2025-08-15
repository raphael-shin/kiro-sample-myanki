import { StudyQuality } from '@/types/flashcard';

interface AnswerButtonsProps {
  onAnswer: (quality: StudyQuality) => void;
  disabled?: boolean;
}

export const AnswerButtons: React.FC<AnswerButtonsProps> = ({ onAnswer, disabled = false }) => {
  const buttons = [
    { quality: StudyQuality.AGAIN, label: 'Again', color: 'bg-red-500 hover:bg-red-600' },
    { quality: StudyQuality.HARD, label: 'Hard', color: 'bg-orange-500 hover:bg-orange-600' },
    { quality: StudyQuality.GOOD, label: 'Good', color: 'bg-green-500 hover:bg-green-600' },
    { quality: StudyQuality.EASY, label: 'Easy', color: 'bg-blue-500 hover:bg-blue-600' }
  ];

  return (
    <div className="flex gap-2 justify-center">
      {buttons.map(({ quality, label, color }) => (
        <button
          key={quality}
          onClick={() => onAnswer(quality)}
          disabled={disabled}
          className={`px-4 py-2 text-white rounded-md font-medium transition-colors ${
            disabled 
              ? 'bg-gray-400 cursor-not-allowed' 
              : color
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
};
