import { create } from 'zustand';
import { 
  AWSCredentials, 
  CardGenerationRequest, 
  GeneratedCard, 
  AIGenerationHistory 
} from '@/types/ai-generation';
import { AICardGenerationService } from '@/services/AICardGenerationService';
import { CardService } from '@/services/CardService';

interface GenerationProgress {
  step: 'analyzing' | 'generating' | 'validating' | 'complete';
  percentage: number;
  message: string;
  estimatedTimeRemaining?: number;
}

interface AICardGenerationState {
  // AWS 설정 상태
  awsCredentials: AWSCredentials | null;
  isAWSConfigured: boolean;
  
  // 생성 상태
  isGenerating: boolean;
  generationProgress: GenerationProgress;
  currentRequest: CardGenerationRequest | null;
  
  // 생성된 카드
  generatedCards: GeneratedCard[];
  selectedCards: Set<string>;
  
  // 기록
  generationHistory: AIGenerationHistory[];
  
  // 에러 상태
  error: string | null;
  
  // Actions
  setAWSCredentials: (credentials: AWSCredentials) => Promise<void>;
  checkAWSConfiguration: () => Promise<void>;
  startGeneration: (request: CardGenerationRequest) => Promise<void>;
  updateProgress: (progress: GenerationProgress) => void;
  setGeneratedCards: (cards: GeneratedCard[]) => void;
  toggleCardSelection: (cardId: string) => void;
  selectAllCards: (selected: boolean) => void;
  updateCard: (cardId: string, updates: Partial<GeneratedCard>) => void;
  saveSelectedCards: (deckId: number) => Promise<void>;
  loadGenerationHistory: () => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

const initialProgress: GenerationProgress = {
  step: 'analyzing',
  percentage: 0,
  message: '',
};

export const useAICardGenerationStore = create<AICardGenerationState>((set, get) => {
  const aiService = new AICardGenerationService();
  const cardService = new CardService();

  return {
    // Initial state
    awsCredentials: null,
    isAWSConfigured: false,
    isGenerating: false,
    generationProgress: initialProgress,
    currentRequest: null,
    generatedCards: [],
    selectedCards: new Set(),
    generationHistory: [],
    error: null,

    // Actions
    setAWSCredentials: async (credentials: AWSCredentials) => {
      try {
        const success = await aiService.setAWSCredentials(credentials);
        if (success) {
          set({ 
            awsCredentials: credentials, 
            isAWSConfigured: true,
            error: null 
          });
        } else {
          throw new Error('Failed to save AWS credentials');
        }
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'AWS 설정 저장 실패',
          isAWSConfigured: false 
        });
        throw error;
      }
    },

    checkAWSConfiguration: async () => {
      try {
        const isConfigured = await aiService.isConfigured();
        set({ isAWSConfigured: isConfigured });
      } catch (error) {
        set({ isAWSConfigured: false });
      }
    },

    startGeneration: async (request: CardGenerationRequest) => {
      set({ 
        isGenerating: true, 
        currentRequest: request,
        generationProgress: { ...initialProgress, message: '생성 준비 중...' },
        error: null 
      });

      try {
        // 진행률 업데이트 시뮬레이션
        const updateProgress = (step: GenerationProgress['step'], percentage: number, message: string) => {
          set({ generationProgress: { step, percentage, message } });
        };

        updateProgress('analyzing', 10, '주제 분석 중...');
        await new Promise(resolve => setTimeout(resolve, 1000));

        updateProgress('generating', 30, 'AI가 카드를 생성하고 있습니다...');
        const cards = await aiService.generateCards(request);

        updateProgress('validating', 80, '생성된 내용을 검증하고 있습니다...');
        await new Promise(resolve => setTimeout(resolve, 500));

        updateProgress('complete', 100, '카드 생성이 완료되었습니다!');

        set({ 
          generatedCards: cards,
          selectedCards: new Set(cards.map(card => card.id)),
          isGenerating: false 
        });

        // 히스토리 새로고침
        get().loadGenerationHistory();
      } catch (error) {
        set({ 
          isGenerating: false,
          error: error instanceof Error ? error.message : '카드 생성 실패' 
        });
        throw error;
      }
    },

    updateProgress: (progress: GenerationProgress) => {
      set({ generationProgress: progress });
    },

    setGeneratedCards: (cards: GeneratedCard[]) => {
      set({ 
        generatedCards: cards,
        selectedCards: new Set(cards.map(card => card.id))
      });
    },

    toggleCardSelection: (cardId: string) => {
      const { selectedCards } = get();
      const newSelection = new Set(selectedCards);
      
      if (newSelection.has(cardId)) {
        newSelection.delete(cardId);
      } else {
        newSelection.add(cardId);
      }
      
      set({ selectedCards: newSelection });
    },

    selectAllCards: (selected: boolean) => {
      const { generatedCards } = get();
      set({ 
        selectedCards: selected 
          ? new Set(generatedCards.map(card => card.id))
          : new Set()
      });
    },

    updateCard: (cardId: string, updates: Partial<GeneratedCard>) => {
      const { generatedCards } = get();
      const updatedCards = generatedCards.map(card =>
        card.id === cardId ? { ...card, ...updates } : card
      );
      set({ generatedCards: updatedCards });
    },

    saveSelectedCards: async (deckId: number) => {
      const { generatedCards, selectedCards } = get();
      const cardsToSave = generatedCards.filter(card => selectedCards.has(card.id));
      
      try {
        for (const generatedCard of cardsToSave) {
          await cardService.createCard({
            deckId,
            front: generatedCard.front,
            back: generatedCard.back,
          });
        }
        
        // 저장 후 상태 초기화
        get().reset();
      } catch (error) {
        set({ error: error instanceof Error ? error.message : '카드 저장 실패' });
        throw error;
      }
    },

    loadGenerationHistory: async () => {
      try {
        const history = await aiService.getGenerationHistory();
        set({ generationHistory: history });
      } catch (error) {
        console.error('Failed to load generation history:', error);
      }
    },

    clearError: () => {
      set({ error: null });
    },

    reset: () => {
      set({
        isGenerating: false,
        generationProgress: initialProgress,
        currentRequest: null,
        generatedCards: [],
        selectedCards: new Set(),
        error: null,
      });
    },
  };
});
