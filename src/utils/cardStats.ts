import { Card } from '../types/flashcard';

export interface CardStats {
  total: number;
  new: number;
  learning: number;
  mastered: number;
  dueToday: number;
}

export function calculateCardStats(cards: Card[]): CardStats {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let newCount = 0;
  let learningCount = 0;
  let masteredCount = 0;
  let dueTodayCount = 0;

  cards.forEach(card => {
    // 오늘 복습해야 할 카드 계산
    if (card.nextReviewDate && new Date(card.nextReviewDate) <= today) {
      dueTodayCount++;
    }

    // 카드 상태 분류
    if (!card.lastReviewDate || card.repetitions === 0) {
      // 신규: 한 번도 학습하지 않음
      newCount++;
    } else if (card.repetitions < 3 || card.easinessFactor < 2.5) {
      // 학습중: 아직 충분히 반복하지 않았거나 어려워함
      learningCount++;
    } else {
      // 완료: 충분히 반복하고 용이도가 높음
      masteredCount++;
    }
  });

  return {
    total: cards.length,
    new: newCount,
    learning: learningCount,
    mastered: masteredCount,
    dueToday: dueTodayCount
  };
}

export function formatCardStats(stats: CardStats): string {
  const parts = [];
  
  if (stats.new > 0) parts.push(`신규 ${stats.new}`);
  if (stats.learning > 0) parts.push(`학습중 ${stats.learning}`);
  if (stats.mastered > 0) parts.push(`완료 ${stats.mastered}`);
  
  return parts.join(' • ');
}
