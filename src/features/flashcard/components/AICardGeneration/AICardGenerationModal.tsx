import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { CardGenerationRequest, GeneratedCard, CardDirection } from '@/types/ai-generation';
import { CardDirectionSelector } from './CardDirectionSelector';
import { AWSSettingsModal } from './AWSSettingsModal';
import { AICardGenerationService } from '@/services/AICardGenerationService';

interface AICardGenerationModalProps {
  deckId: number;
  isOpen: boolean;
  onClose: () => void;
  onCardsGenerated: (cards: GeneratedCard[]) => void;
}

type ModalStep = 'form' | 'generating' | 'preview' | 'settings';

interface GenerationProgress {
  step: 'analyzing' | 'generating' | 'validating' | 'complete';
  percentage: number;
  message: string;
}

export function AICardGenerationModal({ 
  deckId, 
  isOpen, 
  onClose, 
  onCardsGenerated 
}: AICardGenerationModalProps) {
  const [currentStep, setCurrentStep] = useState<ModalStep>('form');
  const [showAWSSettings, setShowAWSSettings] = useState(false);
  const [progress, setProgress] = useState<GenerationProgress>({
    step: 'analyzing',
    percentage: 0,
    message: ''
  });
  
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

  const [generatedCards, setGeneratedCards] = useState<GeneratedCard[]>([]);
  const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set());
  const [aiService] = useState(() => new AICardGenerationService());

  if (!isOpen) return null;

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // AWS 설정 확인
    const isConfigured = await aiService.isConfigured();
    if (!isConfigured) {
      setShowAWSSettings(true);
      return;
    }

    setCurrentStep('generating');
    
    try {
      // 진행률 시뮬레이션
      setProgress({ step: 'analyzing', percentage: 10, message: '주제 분석 중...' });
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setProgress({ step: 'generating', percentage: 50, message: '카드 생성 중...' });
      const cards = await aiService.generateCards(formData);
      
      setProgress({ step: 'validating', percentage: 80, message: '내용 검증 중...' });
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setProgress({ step: 'complete', percentage: 100, message: '생성 완료!' });
      
      setGeneratedCards(cards);
      setSelectedCards(new Set(cards.map(card => card.id)));
      setCurrentStep('preview');
    } catch (error) {
      console.error('카드 생성 실패:', error);
      alert('카드 생성에 실패했습니다. 다시 시도해주세요.');
      setCurrentStep('form');
    }
  };

  const handleAWSCredentialsSaved = async (credentials: any) => {
    try {
      await aiService.setAWSCredentials(credentials);
      setShowAWSSettings(false);
      // 자동으로 생성 시작
      handleFormSubmit(new Event('submit') as any);
    } catch (error) {
      alert('AWS 설정 저장에 실패했습니다.');
    }
  };

  const handleCardToggle = (cardId: string) => {
    setSelectedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  };

  const handleSaveCards = () => {
    const cardsToSave = generatedCards.filter(card => selectedCards.has(card.id));
    onCardsGenerated(cardsToSave);
    onClose();
  };

  const renderForm = () => (
    <Card className="w-full max-w-2xl p-6">
      <h2 className="text-xl font-semibold mb-4">AI 카드 생성</h2>
      
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
      <h2 className="text-xl font-semibold mb-4">카드 생성 중</h2>
      
      <div className="space-y-4">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress.percentage}%` }}
          />
        </div>
        
        <div className="text-center">
          <div className="text-sm text-gray-600">{progress.message}</div>
          <div className="text-xs text-gray-500 mt-1">{progress.percentage}%</div>
        </div>
      </div>
    </Card>
  );

  const renderPreview = () => (
    <Card className="w-full max-w-4xl p-6 max-h-[80vh] overflow-y-auto">
      <h2 className="text-xl font-semibold mb-4">
        생성된 카드 ({selectedCards.size}/{generatedCards.length}개 선택)
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {generatedCards.map(card => (
          <div 
            key={card.id}
            className={`border rounded-lg p-4 cursor-pointer transition-colors ${
              selectedCards.has(card.id) 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onClick={() => handleCardToggle(card.id)}
          >
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={selectedCards.has(card.id)}
                onChange={() => handleCardToggle(card.id)}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="font-medium mb-2">{card.front}</div>
                <div className="text-sm text-gray-600 whitespace-pre-line">{card.back}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
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
