import { create } from 'zustand';
import { Card, StudyQuality } from '../types/flashcard';
import { SM2_CONSTANTS } from '../algorithms/spaced-repetition/constants';

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
 * 학습 세션 관리를 위한 Zustand 스토어
 * 
 * 간격 반복 학습 세션의 상태를 관리합니다.
 * 현재 카드, 학습 큐, 세션 통계, 진행률 등을 추적합니다.
 */
interface StudySessionState {
  // State
  currentCard: Card | null;
  isActive: boolean;
  loading: boolean;
  error: string | null;
  sessionStats: SessionStats;
  studyQueue: Card[];
  
  // Session Management
  startSession: (deckId: number) => Promise<void>;
  endSession: () => void;
  
  // Answer Processing
  submitAnswer: (quality: StudyQuality, responseTime: number) => Promise<void>;
  processAnswer: (quality: StudyQuality, responseTime: number) => Promise<void>;
  nextCard: () => void;
  
  // Algorithm Integration
  initializeCardData: (cardId: number) => Promise<void>;
  getCardsForReview: (deckId: number) => Promise<Card[]>;
  
  // Progress Tracking
  getProgress: () => ProgressInfo;
  updateProgress: () => void;
  
  // Testing
  reset?: () => void;
}

export const useStudySessionStore = create<StudySessionState>((set, get) => ({
  // Initial state
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
  
  // Session management
  startSession: async (deckId: number) => {
    set({ loading: true, error: null });
    
    try {
      // TODO: Load cards from deck and initialize study queue
      set({ 
        isActive: true, 
        loading: false,
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
      isActive: false,
      currentCard: null,
      studyQueue: [],
      sessionStats: { cardsStudied: 0, correctAnswers: 0, totalTime: 0 }
    });
  },
  
  // Answer processing
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
    
    // TODO: Update spaced repetition data with SM2 algorithm
  },
  
  processAnswer: async (quality: StudyQuality, responseTime: number) => {
    // This combines submitAnswer with SM2 algorithm processing
    await get().submitAnswer(quality, responseTime);
    
    // TODO: Apply SM2 algorithm and update spaced repetition data
    // For now, just call submitAnswer
  },
  
  nextCard: () => {
    const { studyQueue } = get();
    
    if (studyQueue.length > 0) {
      const [nextCard, ...remainingQueue] = studyQueue;
      set({
        currentCard: nextCard,
        studyQueue: remainingQueue
      });
    } else {
      set({ currentCard: null });
    }
  },
  
  // Algorithm integration
  initializeCardData: async (cardId: number) => {
    // TODO: Create initial spaced repetition data for new cards
    // For now, this is a placeholder
  },
  
  getCardsForReview: async (deckId: number) => {
    // TODO: Filter cards that are due for review based on nextReviewDate
    // For now, return empty array
    return [];
  },
  
  // Progress tracking
  getProgress: () => {
    const { sessionStats, studyQueue } = get();
    const totalCards = sessionStats.cardsStudied + studyQueue.length;
    const percentage = totalCards > 0 ? Math.round((sessionStats.cardsStudied / totalCards) * 100) : 0;
    
    return {
      percentage,
      cardsRemaining: studyQueue.length,
      totalCards
    };
  },
  
  updateProgress: () => {
    // Placeholder for triggering progress updates
    // Actual progress is calculated dynamically in getProgress()
  },
  
  // Reset for testing
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
    studyQueue: []
  })
}));
