import { create } from 'zustand';
import { 
  DeckStatistics, 
  GlobalStatistics, 
  DailyGoals,
  DailyProgress,
  WeeklyTrend,
  GoalAchievement
} from '../types/flashcard';
import { StatisticsService, IStatisticsService } from '../services/StatisticsService';

/**
 * 통계 스토어 상태 인터페이스
 */
interface StatisticsState {
  // 상태
  deckStats: Map<number, DeckStatistics>;
  globalStats: GlobalStatistics | null;
  dailyGoals: DailyGoals | null;
  loading: boolean;
  error: string | null;
  
  // 액션
  loadDeckStats: (deckId: number) => Promise<void>;
  loadGlobalStats: () => Promise<void>;
  updateDailyGoal: (goalType: 'cards' | 'time', value: number) => Promise<void>;
  getDailyProgress: () => Promise<DailyProgress>;
  getWeeklyTrend: () => Promise<WeeklyTrend>;
  clearDeckStats: () => void;
  removeDeckStats: (deckId: number) => void;
  refreshGlobalStats: () => Promise<void>;
  clearGlobalStats: () => void;
  checkGoalAchievement: () => Promise<GoalAchievement>;
  reloadDailyGoals: () => Promise<void>;
  
  // 테스트용
  reset?: () => void;
}

// 의존성 주입을 위한 인스턴스
let statisticsServiceInstance: IStatisticsService | null = null;

export const setStatisticsService = (service: IStatisticsService) => {
  statisticsServiceInstance = service;
};

export const useStatisticsStore = create<StatisticsState>((set, get) => {
  // 서비스 인스턴스 획득 헬퍼
  const getStatisticsService = () => {
    if (statisticsServiceInstance) {
      return statisticsServiceInstance;
    }
    return new StatisticsService();
  };

  return {
    // 초기 상태
    deckStats: new Map(),
    globalStats: null,
    dailyGoals: null,
    loading: false,
    error: null,
    
    // 덱 통계 로딩
    loadDeckStats: async (deckId: number) => {
      set({ loading: true, error: null });
      
      try {
        const statisticsService = getStatisticsService();
        const deckStats = await statisticsService.getDeckStatistics(deckId);
        
        set(state => ({
          deckStats: new Map(state.deckStats).set(deckId, deckStats),
          loading: false
        }));
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'Failed to load deck statistics',
          loading: false 
        });
      }
    },
    
    // 전체 통계 로딩
    loadGlobalStats: async () => {
      set({ loading: true, error: null });
      
      try {
        const statisticsService = getStatisticsService();
        const globalStats = await statisticsService.getGlobalStatistics();
        const dailyGoals = await statisticsService.getDailyGoal();
        
        set({ 
          globalStats,
          dailyGoals,
          loading: false 
        });
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'Failed to load global statistics',
          loading: false 
        });
      }
    },
    
    // 일일 목표 업데이트
    updateDailyGoal: async (goalType: 'cards' | 'time', value: number) => {
      set({ loading: true, error: null });
      
      try {
        const statisticsService = getStatisticsService();
        await statisticsService.setDailyGoal(goalType, value);
        
        // 목표 업데이트 후 다시 로드
        await get().reloadDailyGoals();
        
        set({ loading: false });
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'Failed to update daily goal',
          loading: false 
        });
      }
    },
    
    // 일일 목표 다시 로드 (내부 헬퍼)
    reloadDailyGoals: async () => {
      const statisticsService = getStatisticsService();
      const dailyGoals = await statisticsService.getDailyGoal();
      set({ dailyGoals });
    },
    
    // 일일 진행률 조회
    getDailyProgress: async () => {
      try {
        const statisticsService = getStatisticsService();
        return await statisticsService.getDailyProgress();
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'Failed to get daily progress'
        });
        throw error;
      }
    },
    
    // 주간 트렌드 조회
    getWeeklyTrend: async () => {
      try {
        const statisticsService = getStatisticsService();
        return await statisticsService.getWeeklyTrend();
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'Failed to get weekly trend'
        });
        throw error;
      }
    },
    
    // 덱 통계 캐시 관리
    clearDeckStats: () => {
      set({ deckStats: new Map() });
    },
    
    removeDeckStats: (deckId: number) => {
      set(state => {
        const newDeckStats = new Map(state.deckStats);
        newDeckStats.delete(deckId);
        return { deckStats: newDeckStats };
      });
    },
    
    // 전체 통계 관리
    refreshGlobalStats: async () => {
      // loadGlobalStats와 동일한 로직
      await get().loadGlobalStats();
    },
    
    clearGlobalStats: () => {
      set({ 
        globalStats: null,
        dailyGoals: null 
      });
    },
    
    // 목표 달성 확인
    checkGoalAchievement: async () => {
      try {
        const statisticsService = getStatisticsService();
        return await statisticsService.checkGoalAchievement();
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'Failed to check goal achievement'
        });
        throw error;
      }
    },
    
    // 테스트용 리셋
    reset: () => set({
      deckStats: new Map(),
      globalStats: null,
      dailyGoals: null,
      loading: false,
      error: null
    })
  };
});
