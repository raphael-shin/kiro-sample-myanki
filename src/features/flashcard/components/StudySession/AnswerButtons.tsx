import { useEffect, useRef } from 'react';
import { StudyQuality } from '@/types/flashcard';

interface AnswerButtonsProps {
  onAnswer: (quality: StudyQuality, responseTime: number) => void;
  disabled?: boolean;
}

export const AnswerButtons: React.FC<AnswerButtonsProps> = ({ onAnswer, disabled = false }) => {
  const startTimeRef = useRef<number>(Date.now());

  // Reset start time when component mounts or re-renders
  useEffect(() => {
    startTimeRef.current = Date.now();
  }, []);

  const handleAnswer = (quality: StudyQuality) => {
    const responseTime = Date.now() - startTimeRef.current;
    onAnswer(quality, responseTime);
    
    // Reset start time for next answer
    startTimeRef.current = Date.now();
  };

  const buttons = [
    { 
      quality: StudyQuality.AGAIN, 
      label: '다시', 
      shortcut: '1',
      color: 'bg-red-600 hover:bg-red-700' 
    },
    { 
      quality: StudyQuality.HARD, 
      label: '어려움', 
      shortcut: '2',
      color: 'bg-orange-600 hover:bg-orange-700' 
    },
    { 
      quality: StudyQuality.GOOD, 
      label: '보통', 
      shortcut: '3',
      color: 'bg-green-600 hover:bg-green-700' 
    },
    { 
      quality: StudyQuality.EASY, 
      label: '쉬움', 
      shortcut: '4',
      color: 'bg-blue-600 hover:bg-blue-700' 
    }
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
      {buttons.map((button) => (
        <button
          key={button.quality}
          onClick={() => handleAnswer(button.quality)}
          disabled={disabled}
          className={`
            px-4 py-4 text-white rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
            transform hover:scale-105 active:scale-95
            ${disabled ? 'bg-gray-400' : button.color}
          `}
          title={`${button.label} (${button.shortcut})`}
        >
          <div className="text-center">
            <div className="font-semibold text-base">{button.label}</div>
            <div className="text-xs opacity-80 mt-1">({button.shortcut})</div>
          </div>
        </button>
      ))}
    </div>
  );
};
