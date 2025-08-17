import { CardDirection } from '@/types/ai-generation';

interface CardDirectionSelectorProps {
  cardType: string;
  selectedDirection: CardDirection;
  onDirectionChange: (direction: CardDirection) => void;
  showUseCaseHints?: boolean;
}

const CARD_DIRECTION_OPTIONS: CardDirection[] = [
  {
    front: 'english',
    back: 'korean',
    description: '영어 → 한국어'
  },
  {
    front: 'korean',
    back: 'english',
    description: '한국어 → 영어'
  }
];

const DIRECTION_USE_CASES = {
  vocabulary: {
    'english-korean': '영어 단어를 보고 한국어 뜻을 떠올리는 학습',
    'korean-english': '한국어 뜻을 보고 영어 단어를 떠올리는 학습'
  },
  expressions: {
    'english-korean': '영어 표현을 보고 의미와 사용법을 이해하는 학습',
    'korean-english': '상황이나 의미를 보고 적절한 영어 표현을 떠올리는 학습'
  },
  idioms: {
    'english-korean': '영어 숙어를 보고 의미와 유래를 이해하는 학습',
    'korean-english': '상황이나 의미를 보고 적절한 영어 숙어를 떠올리는 학습'
  },
  mixed: {
    'english-korean': '다양한 영어 콘텐츠를 보고 한국어로 이해하는 학습',
    'korean-english': '다양한 상황을 보고 적절한 영어 표현을 떠올리는 학습'
  }
};

export function CardDirectionSelector({ 
  cardType, 
  selectedDirection, 
  onDirectionChange, 
  showUseCaseHints = true 
}: CardDirectionSelectorProps) {
  return (
    <div className="card-direction-selector">
      <label className="block text-sm font-medium mb-2">카드 방향</label>
      <div className="space-y-2">
        {CARD_DIRECTION_OPTIONS.map((option) => {
          const directionKey = `${option.front}-${option.back}`;
          const isSelected = selectedDirection.front === option.front && 
                           selectedDirection.back === option.back;
          
          return (
            <div key={directionKey} className="flex items-start space-x-3">
              <input
                type="radio"
                name="cardDirection"
                value={directionKey}
                checked={isSelected}
                onChange={() => onDirectionChange(option)}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="font-medium">{option.description}</div>
                {showUseCaseHints && (
                  <div className="text-sm text-gray-600 mt-1">
                    {DIRECTION_USE_CASES[cardType]?.[directionKey] || '학습 목적에 따라 선택하세요'}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
