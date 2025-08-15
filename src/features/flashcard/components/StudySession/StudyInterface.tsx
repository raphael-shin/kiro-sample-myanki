import { useEffect, useRef } from 'react';
import { useStudySessionStore } from '../../../../store/StudySessionStore';
import { StudyQuality } from '../../../../types/flashcard';
import { CardDisplay } from './CardDisplay';
import { AnswerButtons } from './AnswerButtons';
import { StudyProgress } from './StudyProgress';

interface StudyInterfaceProps {
  deckId: number;
  onComplete: (sessionSummary: SessionSummary) => void;
  onExit: () => void;
}

interface SessionSummary {
  cardsStudied: number;
  totalTime: number;
  averageQuality: number;
  correctAnswers: number;
  sessionDate: Date;
}

export const StudyInterface = ({ deckId, onComplete, onExit }: StudyInterfaceProps) => {
  const answerStartTimeRef = useRef<number>(Date.now());
  
  const {
    currentCard,
    isActive,
    loading,
    error,
    sessionStats,
    showAnswer,
    isPaused,
    keyboardShortcutsEnabled,
    startSession,
    endSession,
    pauseSession,
    resumeSession,
    showCardAnswer,
    processAnswer,
    nextCard,
    getProgress,
    enableKeyboardShortcuts
  } = useStudySessionStore();

  // 세션 시작
  useEffect(() => {
    if (!isActive) {
      startSession(deckId);
    }
  }, [deckId, isActive, startSession]);

  // 답변 시작 시간 초기화
  useEffect(() => {
    if (showAnswer) {
      answerStartTimeRef.current = Date.now();
    }
  }, [showAnswer]);

  // 키보드 단축키 처리
  useEffect(() => {
    if (!keyboardShortcutsEnabled) return;

    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return; // 입력 필드에서는 단축키 비활성화
      }

      const calculateResponseTime = () => Date.now() - answerStartTimeRef.current;

      switch (event.key) {
        case ' ':
          event.preventDefault();
          if (!showAnswer) {
            showCardAnswer();
          }
          break;
        case '1':
          if (showAnswer) {
            handleAnswer(StudyQuality.AGAIN, calculateResponseTime());
          }
          break;
        case '2':
          if (showAnswer) {
            handleAnswer(StudyQuality.HARD, calculateResponseTime());
          }
          break;
        case '3':
          if (showAnswer) {
            handleAnswer(StudyQuality.GOOD, calculateResponseTime());
          }
          break;
        case '4':
          if (showAnswer) {
            handleAnswer(StudyQuality.EASY, calculateResponseTime());
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [keyboardShortcutsEnabled, showAnswer, showCardAnswer]);

  const handleAnswer = async (quality: StudyQuality, responseTime: number) => {
    await processAnswer(quality, responseTime);
    nextCard();
    
    // 세션 완료 확인
    if (!currentCard) {
      const summary: SessionSummary = {
        cardsStudied: sessionStats.cardsStudied,
        totalTime: sessionStats.totalTime,
        averageQuality: sessionStats.cardsStudied > 0 ? sessionStats.correctAnswers / sessionStats.cardsStudied * 4 : 0,
        correctAnswers: sessionStats.correctAnswers,
        sessionDate: new Date()
      };
      onComplete(summary);
    }
  };

  const handleExit = () => {
    if (window.confirm('Are you sure you want to exit? Your progress will be saved.')) {
      endSession();
      onExit();
    }
  };

  const handlePauseResume = () => {
    if (isPaused) {
      resumeSession();
    } else {
      pauseSession();
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading study session...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Error</h3>
          <p className="text-red-600 mt-1">{error}</p>
          <button
            onClick={onExit}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!currentCard) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Session Complete!</h2>
          <p className="text-gray-600 mb-6">You've finished studying all available cards.</p>
          <button
            onClick={onExit}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Return to Deck
          </button>
        </div>
      </div>
    );
  }

  const progress = getProgress();

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Header with controls */}
      <div className="flex justify-between items-center mb-6">
        <StudyProgress 
          current={progress.totalCards - progress.cardsRemaining}
          total={progress.totalCards}
          percentage={progress.percentage}
        />
        <div className="flex gap-2">
          <button
            onClick={handlePauseResume}
            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 border rounded"
          >
            {isPaused ? 'Resume' : 'Pause'}
          </button>
          <button
            onClick={() => enableKeyboardShortcuts(!keyboardShortcutsEnabled)}
            className={`px-3 py-1 text-sm border rounded ${
              keyboardShortcutsEnabled 
                ? 'text-blue-600 border-blue-600' 
                : 'text-gray-600 border-gray-300'
            }`}
          >
            Shortcuts
          </button>
          <button
            onClick={handleExit}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
          >
            Exit
          </button>
        </div>
      </div>

      {/* Card Display */}
      <CardDisplay 
        card={currentCard}
        showAnswer={showAnswer}
        onShowAnswer={showCardAnswer}
        cardNumber={progress.totalCards - progress.cardsRemaining + 1}
        totalCards={progress.totalCards}
      />

      {/* Answer Buttons */}
      {showAnswer && (
        <AnswerButtons 
          onAnswer={handleAnswer}
          disabled={isPaused}
        />
      )}

      {/* Keyboard shortcuts help */}
      {keyboardShortcutsEnabled && (
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Shortcuts: Space (show answer), 1-4 (rate difficulty)</p>
        </div>
      )}
    </div>
  );
};
