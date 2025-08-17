interface GenerationProgress {
  step: 'analyzing' | 'generating' | 'validating' | 'complete';
  percentage: number;
  message: string;
  estimatedTimeRemaining?: number;
}

interface ProgressTrackerProps {
  progress: GenerationProgress;
  onCancel?: () => void;
}

const STEP_MESSAGES = {
  analyzing: '주제 분석 중...',
  generating: 'AI가 카드를 생성하고 있습니다...',
  validating: '생성된 내용을 검증하고 있습니다...',
  complete: '카드 생성이 완료되었습니다!'
};

export function ProgressTracker({ progress, onCancel }: ProgressTrackerProps) {
  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}초`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}분 ${remainingSeconds}초`;
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-medium mb-2">카드 생성 중</h3>
        <p className="text-sm text-gray-600">{progress.message}</p>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-3">
        <div 
          className="bg-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress.percentage}%` }}
        />
      </div>

      <div className="flex justify-between text-sm text-gray-500">
        <span>{progress.percentage}% 완료</span>
        {progress.estimatedTimeRemaining && (
          <span>예상 시간: {formatTime(progress.estimatedTimeRemaining)}</span>
        )}
      </div>

      <div className="flex justify-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${progress.step === 'analyzing' ? 'bg-blue-600' : 'bg-gray-300'}`} />
        <div className={`w-2 h-2 rounded-full ${progress.step === 'generating' ? 'bg-blue-600' : 'bg-gray-300'}`} />
        <div className={`w-2 h-2 rounded-full ${progress.step === 'validating' ? 'bg-blue-600' : 'bg-gray-300'}`} />
        <div className={`w-2 h-2 rounded-full ${progress.step === 'complete' ? 'bg-green-600' : 'bg-gray-300'}`} />
      </div>

      {onCancel && progress.step !== 'complete' && (
        <div className="text-center">
          <button
            onClick={onCancel}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            취소
          </button>
        </div>
      )}
    </div>
  );
}
