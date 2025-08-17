import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { CardGenerationRequest, CardDirection } from '@/types/ai-generation';
import { CardDirectionSelector } from './CardDirectionSelector';
import { AWSSettingsModal } from './AWSSettingsModal';
import { ProgressTracker } from './ProgressTracker';
import { CardPreviewGrid } from './CardPreviewGrid';
import { useAICardGenerationStore } from '@/store/AICardGenerationStore';

interface AICardGenerationModalProps {
  deckId: number;
  isOpen: boolean;
  onClose: () => void;
  onCardsGenerated: () => void;
}

type ModalStep = 'form' | 'generating' | 'preview' | 'settings';

export function AICardGenerationModal({ 
  deckId, 
  isOpen, 
  onClose, 
  onCardsGenerated 
}: AICardGenerationModalProps) {
  const [currentStep, setCurrentStep] = useState<ModalStep>('form');
  const [showAWSSettings, setShowAWSSettings] = useState(false);
  
  const [formData, setFormData] = useState<CardGenerationRequest>({
    topic: '',
    cardCount: 10,
    cardType: 'vocabulary',
    difficulty: 'intermediate',
    language: 'ko',
    cardDirection: {
      front: 'english',
      back: 'korean',
      description: '영어 → 한국어'
    }
  });

  const {
    isAWSConfigured,
    isGenerating,
    generationProgress,
    generatedCards,
    selectedCards,
    error,
    setAWSCredentials,
    checkAWSConfiguration,
    startGeneration,
    toggleCardSelection,
    selectAllCards,
    updateCard,
    saveSelectedCards,
    clearError,
    reset
  } = useAICardGenerationStore();

  useEffect(() => {
    if (isOpen) {
      checkAWSConfiguration();
      reset();
      setCurrentStep('form');
    }
  }, [isOpen, checkAWSConfiguration, reset]);

  useEffect(() => {
    if (isGenerating) {
      setCurrentStep('generating');
    } else if (generatedCards.length > 0 && !isGenerating) {
      setCurrentStep('preview');
    }
  }, [isGenerating, generatedCards.length]);

  if (!isOpen) return null;

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAWSConfigured) {
      setShowAWSSettings(true);
      return;
    }

    try {
      await startGeneration(formData);
    } catch (error) {
      console.error('카드 생성 실패:', error);
    }
  };

  const handleAWSCredentialsSaved = async (credentials: any) => {
    try {
      await setAWSCredentials(credentials);
      setShowAWSSettings(false);
      // 자동으로 생성 시작
      await startGeneration(formData);
    } catch (error) {
      console.error('AWS 설정 저장 실패:', error);
    }
  };

  const handleSaveCards = async () => {
    try {
      await saveSelectedCards(deckId);
      onCardsGenerated();
      onClose();
    } catch (error) {
      console.error('카드 저장 실패:', error);
    }
  };

  const handleCancel = () => {
    if (isGenerating) {
      // 생성 중 취소 확인
      if (confirm('카드 생성을 취소하시겠습니까?')) {
        reset();
        setCurrentStep('form');
      }
    } else {
      onClose();
    }
  };

  const renderForm = () => (
    <Card className="w-full max-w-2xl p-6">
      <h2 className="text-xl font-semibold mb-4">AI 카드 생성</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-sm">{error}</p>
          <button 
            onClick={clearError}
            className="text-red-600 text-xs underline mt-1"
          >
            닫기
          </button>
        </div>
      )}
      
      <form onSubmit={handleFormSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">주제</label>
          <input
            type="text"
            value={formData.topic}
            onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="예: 여행, 음식, 비즈니스 등"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">카드 개수</label>
            <select
              value={formData.cardCount}
              onChange={(e) => setFormData(prev => ({ ...prev, cardCount: Number(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[5, 10, 15, 20, 25, 30].map(count => (
                <option key={count} value={count}>{count}개</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">카드 유형</label>
            <select
              value={formData.cardType}
              onChange={(e) => setFormData(prev => ({ ...prev, cardType: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="vocabulary">단어</option>
              <option value="expressions">표현</option>
              <option value="idioms">숙어</option>
              <option value="mixed">혼합</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">난이도</label>
          <select
            value={formData.difficulty}
            onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value as any }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="beginner">초급</option>
            <option value="intermediate">중급</option>
            <option value="advanced">고급</option>
          </select>
        </div>

        <CardDirectionSelector
          cardType={formData.cardType}
          selectedDirection={formData.cardDirection}
          onDirectionChange={(direction) => setFormData(prev => ({ ...prev, cardDirection: direction }))}
        />

        <div className="flex gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            취소
          </Button>
          <Button type="submit" className="flex-1">
            생성 시작
          </Button>
        </div>
      </form>
    </Card>
  );

  const renderGenerating = () => (
    <Card className="w-full max-w-md p-6">
      <ProgressTracker 
        progress={generationProgress}
        onCancel={handleCancel}
      />
    </Card>
  );

  const renderPreview = () => (
    <Card className="w-full max-w-4xl p-6 max-h-[80vh] overflow-y-auto">
      <CardPreviewGrid
        cards={generatedCards}
        selectedCards={selectedCards}
        onSelectionChange={toggleCardSelection}
        onCardEdit={updateCard}
      />

      <div className="flex gap-2 mt-6">
        <Button variant="outline" onClick={() => setCurrentStep('form')} className="flex-1">
          다시 생성
        </Button>
        <Button 
          onClick={handleSaveCards}
          disabled={selectedCards.size === 0}
          className="flex-1"
        >
          선택한 카드 저장 ({selectedCards.size}개)
        </Button>
      </div>
    </Card>
  );

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        {currentStep === 'form' && renderForm()}
        {currentStep === 'generating' && renderGenerating()}
        {currentStep === 'preview' && renderPreview()}
      </div>

      <AWSSettingsModal
        isOpen={showAWSSettings}
        onClose={() => setShowAWSSettings(false)}
        onCredentialsSaved={handleAWSCredentialsSaved}
      />
    </>
  );
}
