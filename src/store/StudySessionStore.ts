import { create } from 'zustand';
import { Card, StudyQuality, StudySessionData, SessionProgress } from '../types/flashcard';
import { SpacedRepetitionService } from '../services/SpacedRepetitionService';
import { SessionManager, ISessionManager } from '../services/SessionManager';

/**
 * 학습 세션 통계 정보
 */
interface SessionStats {
  cardsStudied: number;
  correctAnswers: number;
  totalTime: number;
}

/**
 * 학습 진행률 정보
 */
interface ProgressInfo {
  percentage: number;
  cardsRemaining: number;
  totalCards: number;
}

/**
 * 확장된 학습 세션 상태 인터페이스
 */
interface EnhancedStudySessionState {
  // 기존 상태 (그룹화)
  currentCard: Card | null;
  isActive: boolean;
  loading: boolean;
  error: string | null;
  sessionStats: SessionStats;
  studyQueue: Card[];
  
  // 새로운 상태 (그룹화)
  sessionId: string | null;
  sessionStartTime: Date | null;
  isPaused: boolean;
  showAnswer: boolean;
  answerStartTime: Date | null;
  keyboardShortcutsEnabled: boolean;
  
  // 세션 관리 액션 (그룹화)
  startSession: (deckId: number) => Promise<void>;
  endSession: () => void;
  pauseSession: () => Promise<void>;
  resumeSession: () => Promise<void>;
  
  // 답변 처리 액션 (그룹화)
  submitAnswer: (quality: StudyQuality, responseTime: number) => Promise<void>;
  processAnswer: (quality: StudyQuality, responseTime: number) => Promise<void>;
  nextCard: () => void;
  showCardAnswer: () => void;
  
  // 진행률 추적 액션 (그룹화)
  getProgress: () => ProgressInfo;
  updateProgress: () => void;
  getEstimatedTimeRemaining: () => number;
  
  // 알고리즘 통합 (기존)
  initializeCardData: (cardId: number) => Promise<void>;
  getCardsForReview: (deckId: number) => Promise<Card[]>;
  
  // 테스트용
  reset?: () => void;
}

// 의존성 주입을 위한 인스턴스들
let spacedRepetitionServiceInstance: SpacedRepetitionService | null = null;
let sessionManagerInstance: ISessionManager | null = null;

export const setSpacedRepetitionService = (service: SpacedRepetitionService) => {
  spacedRepetitionServiceInstance = service;
};

export const setSessionManager = (manager: ISessionManager) => {
  sessionManagerInstance = manager;
};

export const useStudySessionStore = create<EnhancedStudySessionState>((set, get) => {
  // 서비스 인스턴스 획득 헬퍼
  const getSpacedRepetitionService = () => {
    if (spacedRepetitionServiceInstance) {
      return spacedRepetitionServiceInstance;
    }
    return new SpacedRepetitionService();
  };

  const getSessionManager = () => {
    if (sessionManagerInstance) {
      return sessionManagerInstance;
    }
    return new SessionManager();
  };

  return {
    // 기존 상태 초기값
    currentCard: null,
    isActive: false,
    loading: false,
    error: null,
    sessionStats: {
      cardsStudied: 0,
      correctAnswers: 0,
      totalTime: 0
    },
    studyQueue: [],
    
    // 새로운 상태 초기값
    sessionId: null,
    sessionStartTime: null,
    isPaused: false,
    showAnswer: false,
    answerStartTime: null,
    keyboardShortcutsEnabled: true,
    
    // 세션 관리 액션들
    startSession: async (deckId: number) => {
      console.log('🎯 Starting study session for deck:', deckId);
      set({ loading: true, error: null });
      
      try {
        const sessionManager = getSessionManager();
        const sessionId = await sessionManager.createSession(deckId);
        
        // 카드 로드
        const spacedRepetitionService = getSpacedRepetitionService();
        const cards = await spacedRepetitionService.getCardsForReview(deckId);
        console.log('📚 Cards loaded:', cards.length, 'cards');
        console.log('📋 Card details:', cards.map(c => ({ id: c.id, front: c.front, lastReviewDate: c.lastReviewDate, repetitions: c.repetitions })));
        
        if (cards.length === 0) {
          console.log('⚠️ No cards available for study');
          set({ 
            error: 'No cards available for study',
            loading: false 
          });
          return;
        }
        
        const [firstCard, ...remainingCards] = cards;
        console.log('🎴 First card:', firstCard?.front, 'Remaining:', remainingCards.length);
        
        set({ 
          sessionId,
          sessionStartTime: new Date(),
          isActive: true, 
          loading: false,
          isPaused: false,
          currentCard: firstCard,
          studyQueue: remainingCards,
          showAnswer: false,
          sessionStats: { cardsStudied: 0, correctAnswers: 0, totalTime: 0 }
        });
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'Failed to start session',
          loading: false 
        });
      }
    },
    
    endSession: () => {
      set({
        sessionId: null,
        sessionStartTime: null,
        isActive: false,
        isPaused: false,
        currentCard: null,
        studyQueue: [],
        showAnswer: false,
        answerStartTime: null,
        sessionStats: { cardsStudied: 0, correctAnswers: 0, totalTime: 0 }
      });
    },

    pauseSession: async () => {
      const { sessionId } = get();
      if (!sessionId) return;

      try {
        const sessionManager = getSessionManager();
        await sessionManager.pauseSession(sessionId);
        set({ isPaused: true });
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'Failed to pause session'
        });
      }
    },

    resumeSession: async () => {
      const { sessionId } = get();
      if (!sessionId) return;

      try {
        const sessionManager = getSessionManager();
        await sessionManager.resumeSession(sessionId);
        set({ isPaused: false });
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'Failed to resume session'
        });
      }
    },
    
    // 답변 처리 액션들
    submitAnswer: async (quality: StudyQuality, responseTime: number) => {
      const { sessionStats } = get();
      const isCorrect = quality === StudyQuality.GOOD || quality === StudyQuality.EASY;
      
      set({
        sessionStats: {
          cardsStudied: sessionStats.cardsStudied + 1,
          correctAnswers: sessionStats.correctAnswers + (isCorrect ? 1 : 0),
          totalTime: sessionStats.totalTime + responseTime
        }
      });
    },
    
    processAnswer: async (quality: StudyQuality, responseTime: number) => {
      try {
        await get().submitAnswer(quality, responseTime);
        
        const { currentCard } = get();
        if (currentCard?.id) {
          const spacedRepetitionService = getSpacedRepetitionService();
          await spacedRepetitionService.processStudyResult(currentCard.id, quality);
        }
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'Failed to process answer'
        });
      }
    },
    
    nextCard: () => {
      const { studyQueue } = get();
      
      if (studyQueue.length > 0) {
        const [nextCard, ...remainingQueue] = studyQueue;
        set({
          currentCard: nextCard,
          studyQueue: remainingQueue,
          showAnswer: false,
          answerStartTime: new Date()
        });
      } else {
        set({ 
          currentCard: null,
          showAnswer: false,
          answerStartTime: null
        });
      }
    },

    showCardAnswer: () => {
      set({ showAnswer: true });
    },
    
    // 진행률 추적 액션들
    getProgress: () => {
      const { sessionStats, studyQueue, currentCard } = get();
      const totalCards = sessionStats.cardsStudied + studyQueue.length + (currentCard ? 1 : 0);
      const percentage = totalCards > 0 ? Math.round((sessionStats.cardsStudied / totalCards) * 100) : 0;
      
      return {
        percentage,
        cardsRemaining: studyQueue.length + (currentCard ? 1 : 0),
        totalCards
      };
    },
    
    updateProgress: () => {
      // 진행률은 getProgress()에서 동적으로 계산됨
    },

    getEstimatedTimeRemaining: () => {
      const { sessionStats, studyQueue } = get();
      if (sessionStats.cardsStudied === 0 || studyQueue.length === 0) {
        return 0;
      }
      
      const averageTimePerCard = sessionStats.totalTime / sessionStats.cardsStudied;
      return Math.round(averageTimePerCard * studyQueue.length);
    },

    // 기존 알고리즘 통합 메서드들
    initializeCardData: async (cardId: number) => {
      try {
        const spacedRepetitionService = getSpacedRepetitionService();
        await spacedRepetitionService.getByCardId(cardId);
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'Failed to initialize card data'
        });
      }
    },
    
    getCardsForReview: async (deckId: number) => {
      try {
        const spacedRepetitionService = getSpacedRepetitionService();
        return await spacedRepetitionService.getCardsForReview(deckId);
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'Failed to get cards for review'
        });
        return [];
      }
    },
    
    // 테스트용 리셋
    reset: () => set({
      currentCard: null,
      isActive: false,
      loading: false,
      error: null,
      sessionStats: {
        cardsStudied: 0,
        correctAnswers: 0,
        totalTime: 0
      },
      studyQueue: [],
      sessionId: null,
      sessionStartTime: null,
      isPaused: false,
      showAnswer: false,
      answerStartTime: null,
      keyboardShortcutsEnabled: true
    })
  };
});
