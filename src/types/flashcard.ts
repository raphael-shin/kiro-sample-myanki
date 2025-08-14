/**
 * 플래시카드 관련 타입 정의
 * Basic 노트 타입만 지원하는 간단한 플래시카드 시스템
 */

/**
 * 학습 품질 열거형
 * 간격 반복 알고리즘에서 사용되는 답변 품질 점수
 */
export enum StudyQuality {
  AGAIN = 1,    // 다시 - 답을 틀렸거나 기억하지 못함
  HARD = 2,     // 어려움 - 답을 맞췄지만 어려웠음
  GOOD = 3,     // 보통 - 적절한 노력으로 답을 맞춤
  EASY = 4      // 쉬움 - 쉽게 답을 맞춤
}

/**
 * 덱(카드 묶음) 인터페이스
 */
export interface Deck {
  id?: number;
  name: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * 카드 인터페이스 (Basic 타입만 지원)
 */
export interface Card {
  id?: number;
  deckId: number;
  front: string;    // 앞면 내용
  back: string;     // 뒷면 내용
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * 학습 세션 인터페이스
 * 사용자가 카드를 학습한 기록을 저장
 */
export interface StudySession {
  id?: number;
  cardId: number;
  studiedAt: Date;
  quality: StudyQuality;
  responseTime: number;  // 응답 시간 (밀리초)
}

/**
 * 덱 생성을 위한 입력 타입
 */
export type CreateDeckInput = Omit<Deck, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * 덱 수정을 위한 입력 타입
 */
export type UpdateDeckInput = Partial<Omit<Deck, 'id' | 'createdAt' | 'updatedAt'>>;

/**
 * 카드 생성을 위한 입력 타입
 */
export type CreateCardInput = Omit<Card, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * 카드 수정을 위한 입력 타입
 */
export type UpdateCardInput = Partial<Omit<Card, 'id' | 'deckId' | 'createdAt' | 'updatedAt'>>;

/**
 * 학습 세션 생성을 위한 입력 타입
 */
export type CreateStudySessionInput = Omit<StudySession, 'id'>;

/**
 * 학습 세션 수정을 위한 입력 타입
 */
export type UpdateStudySessionInput = Partial<Omit<StudySession, 'id' | 'cardId'>>;

/**
 * 덱 통계 정보
 */
export interface DeckStats {
  totalCards: number;
  studiedCards: number;
  averageQuality: number;
  lastStudiedAt?: Date;
}

/**
 * 학습 통계 정보
 */
export interface StudyStats {
  totalSessions: number;
  averageQuality: number;
  averageResponseTime: number;
  lastStudiedAt?: Date;
  studyStreak: number;
}

/**
 * 통계 정보가 포함된 덱
 */
export interface DeckWithStats extends Deck {
  stats: DeckStats;
}