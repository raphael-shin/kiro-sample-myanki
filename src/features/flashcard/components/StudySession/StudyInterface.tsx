import { useCallback, useEffect, useRef, useState } from 'react';
import { useStudySessionStore } from '@/store/StudySessionStore';
import { StudyQuality } from '@/types/flashcard';
import { AnswerButtons } from './AnswerButtons';

interface StudyInterfaceProps {
  deckId: number;
  onComplete?: () => void;
  onExit?: () => void;
}

export const StudyInterface = ({ deckId, onComplete, onExit }: StudyInterfaceProps) => {
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');
  // 피드백 표시 중 예약된 답 처리 타이머. 값이 있으면 답을 처리하는 중이다
  const pendingAnswerTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (pendingAnswerTimeoutRef.current !== null) {
        clearTimeout(pendingAnswerTimeoutRef.current);
        pendingAnswerTimeoutRef.current = null;
      }
    };
  }, []);
  
  const {
    currentCard,
    isActive,
    loading,
    error,
    sessionStats,
    showAnswer,
    isPaused,
    answerStartTime,
    keyboardShortcutsEnabled,
    startSession,
    endSession,
    pauseSession,
    resumeSession,
    showCardAnswer,
    processAnswer,
    nextCard,
    getProgress
  } = useStudySessionStore();

  useEffect(() => {
    startSession(deckId);
    
    return () => {
      if (isActive) {
        endSession();
      }
    };
  }, [deckId, startSession, endSession, isActive]);

  const handleAnswer = useCallback(async (quality: StudyQuality) => {
    // 이전 답을 처리하는 중이면 추가 입력을 무시한다
    if (pendingAnswerTimeoutRef.current !== null) return;

    // 카드 앞면이 표시된 시각부터 답을 고른 지금까지의 시간. 일시정지 시간도 포함한다
    const responseTime = answerStartTime ? Date.now() - answerStartTime.getTime() : 0;
    
    // 피드백 메시지 표시
    const feedbackMessages = {
      [StudyQuality.AGAIN]: '다시 학습합니다',
      [StudyQuality.HARD]: '다음 복습까지 10분 후',
      [StudyQuality.GOOD]: '다음 복습까지 1일 후',
      [StudyQuality.EASY]: '다음 복습까지 4일 후'
    };
    
    setFeedbackMessage(feedbackMessages[quality]);
    
    // 1초 후 다음 카드로 진행
    pendingAnswerTimeoutRef.current = setTimeout(async () => {
      try {
        await processAnswer(quality, responseTime);
        nextCard();
        setFeedbackMessage('');
      } finally {
        pendingAnswerTimeoutRef.current = null;
      }
    }, 1000);
  }, [processAnswer, nextCard, answerStartTime]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!keyboardShortcutsEnabled || isPaused) return;

      // 입력 중인 텍스트 필드에서는 단축키를 처리하지 않는다
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      switch (event.key) {
        case ' ':
        case 'Enter':
          event.preventDefault();
          if (!showAnswer) {
            showCardAnswer();
          }
          break;
        case '1':
          if (showAnswer) {
            event.preventDefault();
            handleAnswer(StudyQuality.AGAIN);
          }
          break;
        case '2':
          if (showAnswer) {
            event.preventDefault();
            handleAnswer(StudyQuality.HARD);
          }
          break;
        case '3':
          if (showAnswer) {
            event.preventDefault();
            handleAnswer(StudyQuality.GOOD);
          }
          break;
        case '4':
          if (showAnswer) {
            event.preventDefault();
            handleAnswer(StudyQuality.EASY);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [keyboardShortcutsEnabled, isPaused, showAnswer, showCardAnswer, handleAnswer]);

  const handlePauseResume = () => {
    if (isPaused) {
      resumeSession();
    } else {
      pauseSession();
    }
  };

  const handleExit = () => {
    if (window.confirm('학습을 종료하시겠습니까? 진행률은 저장됩니다.')) {
      endSession();
      onExit?.();
    }
  };

  const progress = getProgress();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">학습 세션을 준비하고 있습니다...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={onExit}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  if (!currentCard) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">학습 완료!</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            총 {sessionStats.cardsStudied}장의 카드를 학습했습니다.
          </p>
          <button
            onClick={() => {
              endSession();
              onComplete?.();
            }}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
          >
            완료
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* 상단: 세션 제어 */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-end items-center mb-4">
            <div className="flex gap-2">
              <button
                onClick={handlePauseResume}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                title={isPaused ? '재개' : '일시정지'}
              >
                {isPaused ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 5v10l7-5-7-5z"/>
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5.5 3.5A1.5 1.5 0 017 2h6a1.5 1.5 0 011.5 1.5v13a1.5 1.5 0 01-1.5 1.5H7A1.5 1.5 0 015.5 16.5v-13zM7 4v12h6V4H7z"/>
                  </svg>
                )}
              </button>
              <button
                onClick={handleExit}
                className="p-2 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20"
                title="종료"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/>
                </svg>
              </button>
            </div>
          </div>
          
          {/* 진행률 */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">진행률</span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {progress.totalCards - progress.cardsRemaining}/{progress.totalCards} ({Math.round(progress.percentage)}%)
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div 
              className="bg-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* 중앙: 카드 내용 */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
            {/* 카드 내용 */}
            <div className="mb-8">
              {showAnswer ? (
                <div className="space-y-4">
                  <div className="text-lg text-gray-600 dark:text-gray-400">
                    {currentCard.front}
                  </div>
                  <div className="text-2xl font-medium text-gray-900 dark:text-white">
                    {currentCard.back}
                  </div>
                </div>
              ) : (
                <div className="text-2xl font-medium text-gray-900 dark:text-white mb-6">
                  {currentCard.front}
                </div>
              )}
            </div>

            {/* 답 보기 버튼 또는 답변 버튼들 */}
            {feedbackMessage ? (
              <div className="space-y-4">
                <div className="text-lg text-green-600 dark:text-green-400 font-medium">
                  {feedbackMessage}
                </div>
              </div>
            ) : !showAnswer ? (
              <div className="space-y-4">
                <button
                  onClick={showCardAnswer}
                  disabled={isPaused}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium transition-colors"
                  title={keyboardShortcutsEnabled ? 'Space 또는 Enter로 답 보기' : undefined}
                >
                  답 보기
                </button>
                {keyboardShortcutsEnabled && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Space 또는 Enter
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  답변의 난이도를 선택하세요
                </p>
                <AnswerButtons 
                  onAnswer={handleAnswer}
                  disabled={isPaused}
                />
                {keyboardShortcutsEnabled && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    1: 다시, 2: 어려움, 3: 보통, 4: 쉬움
                  </p>
                )}
              </div>
            )}

            {/* 카드 하단 정보 */}
            <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
              <span>카드 {progress.totalCards - progress.cardsRemaining + 1}</span>
              {keyboardShortcutsEnabled && (
                <div className="flex items-center gap-2" title="키보드 단축키 사용 가능">
                  <span>Space: 답 보기, 1-4: 난이도</span>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
