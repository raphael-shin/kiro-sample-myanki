import { useState, useEffect, useMemo } from 'react';
import { Card, CreateCardInput, UpdateCardInput } from '@/types/flashcard';
import { AIGenerationHistory } from '@/types/ai-generation';
import { CardService } from '@/services/CardService';
import { AICardGenerationService } from '@/services/AICardGenerationService';
import { db } from '@/db/MyAnkiDB';
import { calculateCardStats } from '@/utils/cardStats';
import { CardTable } from './CardTable';
import { CreateCardModal } from './CreateCardModal';
import { AICardGenerationModal } from '../AICardGeneration/AICardGenerationModal';

interface CardEditorPageProps {
  deckId: number;
  deckName: string;
  onBack: () => void;
}

type SortField = 'updatedAt' | 'front' | 'createdAt';
type SortOrder = 'asc' | 'desc';
type StatusFilter = 'all' | 'new' | 'learning' | 'mastered';

export const CardEditorPage = ({ deckId, deckName, onBack }: CardEditorPageProps) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [filteredCards, setFilteredCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortField, setSortField] = useState<SortField>('updatedAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [selectedCards, setSelectedCards] = useState<Set<number>>(new Set());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAIGenerationModal, setShowAIGenerationModal] = useState(false);
  const [aiGenerationHistory, setAIGenerationHistory] = useState<AIGenerationHistory[]>([]);
  const [error, setError] = useState<string>('');

  const cardService = new CardService(db);
  const aiService = new AICardGenerationService();

  // 카드 통계 계산
  const cardStats = useMemo(() => {
    return calculateCardStats(cards);
  }, [cards]);

  // 초기 데이터 로드
  useEffect(() => {
    loadCards();
    loadAIGenerationHistory();
  }, [deckId]);

  // 검색 및 필터링
  useEffect(() => {
    if (searchQuery.trim()) {
      searchCards();
    } else {
      applyFiltersAndSort();
    }
  }, [searchQuery, statusFilter, sortField, sortOrder, cards]);

  const loadCards = async () => {
    try {
      setLoading(true);
      const loadedCards = await cardService.getCardsByDeckId(deckId);
      setCards(loadedCards);
      setError('');
    } catch (err) {
      setError('카드를 불러오는데 실패했습니다.');
      console.error('Failed to load cards:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadAIGenerationHistory = async () => {
    try {
      const history = await aiService.getGenerationHistory();
      const deckHistory = history.filter(h => h.deckId === deckId).slice(0, 5);
      setAIGenerationHistory(deckHistory);
    } catch (err) {
      console.error('Failed to load AI generation history:', err);
    }
  };

  const searchCards = async () => {
    try {
      const results = await cardService.searchCards(deckId, searchQuery.trim());
      setFilteredCards(applySortAndFilter(results));
    } catch (err) {
      setError('검색에 실패했습니다.');
      console.error('Search failed:', err);
    }
  };

  const applyFiltersAndSort = () => {
    setFilteredCards(applySortAndFilter(cards));
  };

  const applySortAndFilter = (cardList: Card[]) => {
    let filtered = [...cardList];

    // 상태 필터 적용
    if (statusFilter !== 'all') {
      filtered = filtered.filter(card => {
        if (statusFilter === 'new') {
          return !card.lastReviewDate || (card.repetitions || 0) === 0;
        } else if (statusFilter === 'learning') {
          return (card.repetitions || 0) > 0 && ((card.repetitions || 0) < 3 || (card.easinessFactor || 2.5) < 2.5);
        } else if (statusFilter === 'mastered') {
          return (card.repetitions || 0) >= 3 && (card.easinessFactor || 2.5) >= 2.5;
        }
        return true;
      });
    }

    // 정렬 적용
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortField) {
        case 'front':
          aValue = a.front.toLowerCase();
          bValue = b.front.toLowerCase();
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt || 0);
          bValue = new Date(b.createdAt || 0);
          break;
        case 'updatedAt':
        default:
          aValue = new Date(a.updatedAt || 0);
          bValue = new Date(b.updatedAt || 0);
          break;
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  };

  const handleCardUpdate = async (cardId: number, updates: UpdateCardInput) => {
    try {
      await cardService.update(cardId, updates);
      
      // 로컬 상태 업데이트
      setCards(prev => prev.map(card => 
        card.id === cardId 
          ? { ...card, ...updates, updatedAt: new Date() }
          : card
      ));
      
      return { success: true };
    } catch (err) {
      console.error('Failed to update card:', err);
      return { success: false, error: '카드 수정에 실패했습니다.' };
    }
  };

  const handleCardDelete = async (cardId: number) => {
    if (!window.confirm('이 카드를 삭제하시겠습니까?')) {
      return;
    }

    try {
      await cardService.delete(cardId);
      setCards(prev => prev.filter(card => card.id !== cardId));
      setSelectedCards(prev => {
        const newSet = new Set(prev);
        newSet.delete(cardId);
        return newSet;
      });
    } catch (err) {
      setError('카드 삭제에 실패했습니다.');
      console.error('Failed to delete card:', err);
    }
  };

  const handleCardCreate = async (input: CreateCardInput) => {
    try {
      const newCardId = await cardService.create(input);
      const newCard = await cardService.getById(newCardId);
      
      if (newCard) {
        setCards(prev => [newCard, ...prev]);
      }
      
      setShowCreateModal(false);
      return { success: true };
    } catch (err) {
      console.error('Failed to create card:', err);
      return { success: false, error: '카드 생성에 실패했습니다.' };
    }
  };

  const handleBulkDelete = async () => {
    if (selectedCards.size === 0) return;
    
    if (!window.confirm(`선택된 ${selectedCards.size}개 카드를 삭제하시겠습니까?`)) {
      return;
    }

    const cardIds = Array.from(selectedCards);
    let successCount = 0;

    for (const cardId of cardIds) {
      try {
        await cardService.delete(cardId);
        successCount++;
      } catch (err) {
        console.error(`Failed to delete card ${cardId}:`, err);
      }
    }

    // 성공한 카드들만 제거
    setCards(prev => prev.filter(card => !selectedCards.has(card.id!)));
    setSelectedCards(new Set());

    if (successCount < cardIds.length) {
      setError(`${cardIds.length - successCount}개 카드 삭제에 실패했습니다.`);
    }
  };

  const handleAICardsGenerated = () => {
    setShowAIGenerationModal(false);
    loadCards(); // 새로 생성된 카드들을 다시 로드
    loadAIGenerationHistory(); // 생성 기록도 업데이트
  };

  const getStatusText = (card: Card) => {
    if (!card.lastReviewDate || (card.repetitions || 0) === 0) return '신규';
    if ((card.repetitions || 0) < 3 || (card.easinessFactor || 2.5) < 2.5) return '학습중';
    return '완료';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case '신규': return 'text-blue-600 bg-blue-100';
      case '학습중': return 'text-yellow-600 bg-yellow-100';
      case '완료': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">카드를 불러오고 있습니다...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 헤더 */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"/>
                </svg>
              </button>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{deckName}</h1>
            </div>
            
            <div className="text-sm text-gray-600 dark:text-gray-400">
              전체 {cardStats.total} / 신규 {cardStats.new} / 학습중 {cardStats.learning} / 완료 {cardStats.mastered}
            </div>
          </div>

          {/* 툴바 */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* 검색 */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="카드 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"/>
                </svg>
              </div>

              {/* 상태 필터 */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">모든 상태</option>
                <option value="new">신규</option>
                <option value="learning">학습중</option>
                <option value="mastered">완료</option>
              </select>

              {/* 정렬 */}
              <select
                value={`${sortField}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortField(field as SortField);
                  setSortOrder(order as SortOrder);
                }}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="updatedAt-desc">수정일 ↓</option>
                <option value="updatedAt-asc">수정일 ↑</option>
                <option value="createdAt-desc">생성일 ↓</option>
                <option value="createdAt-asc">생성일 ↑</option>
                <option value="front-asc">앞면 A→Z</option>
                <option value="front-desc">앞면 Z→A</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowAIGenerationModal(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 font-medium flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                AI 카드 생성
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
              >
                + 새 카드
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      )}

      {/* 선택된 카드 액션 */}
      {selectedCards.size > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-700 dark:text-blue-300">
                {selectedCards.size}개 카드 선택됨
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handleBulkDelete}
                  className="px-3 py-1 text-sm text-red-600 hover:text-red-800 border border-red-300 rounded hover:bg-red-50"
                >
                  삭제
                </button>
                <button
                  onClick={() => setSelectedCards(new Set())}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:bg-gray-50"
                >
                  선택 해제
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 카드 테이블 */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* AI 생성 기록 */}
        {aiGenerationHistory.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">최근 AI 생성 기록</h3>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {aiGenerationHistory.map((history) => (
                  <div key={history.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {history.topic}
                          </span>
                          <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded">
                            {history.cardType}
                          </span>
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded">
                            {history.difficulty}
                          </span>
                        </div>
                        <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                          {history.cardCount}개 카드 생성 • {new Date(history.generatedAt).toLocaleDateString('ko-KR')}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {history.metadata?.tokensUsed ? `${history.metadata.tokensUsed} 토큰` : ''}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <CardTable
          cards={filteredCards}
          selectedCards={selectedCards}
          onSelectionChange={setSelectedCards}
          onCardUpdate={handleCardUpdate}
          onCardDelete={handleCardDelete}
          getStatusText={getStatusText}
          getStatusColor={getStatusColor}
        />
      </div>

      {/* 새 카드 생성 모달 */}
      {showCreateModal && (
        <CreateCardModal
          deckId={deckId}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCardCreate}
        />
      )}

      {/* AI 카드 생성 모달 */}
      {showAIGenerationModal && (
        <AICardGenerationModal
          deckId={deckId}
          isOpen={showAIGenerationModal}
          onClose={() => setShowAIGenerationModal(false)}
          onCardsGenerated={handleAICardsGenerated}
        />
      )}
    </div>
  );
};
