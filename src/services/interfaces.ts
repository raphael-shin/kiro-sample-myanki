/**
 * 서비스 레이어 인터페이스 정의
 * 타입 안전한 CRUD 작업과 비즈니스 로직을 위한 인터페이스
 */

import {
  Deck,
  Card,
  StudySession,
  CreateDeckInput,
  UpdateDeckInput,
  CreateCardInput,
  UpdateCardInput,
  CreateStudySessionInput,
  UpdateStudySessionInput,
  DeckStats,
  StudyStats,
  DeckWithStats
} from '@/types/flashcard';

/**
 * 제네릭 CRUD 서비스 인터페이스
 * 모든 데이터 모델에 대한 기본 CRUD 작업을 정의
 */
export interface CRUDService<T, CreateInput, UpdateInput> {
  /**
   * 새로운 엔티티 생성
   * @param item 생성할 엔티티 데이터
   * @returns 생성된 엔티티의 ID
   */
  create(item: CreateInput): Promise<number>;

  /**
   * ID로 엔티티 조회
   * @param id 조회할 엔티티 ID
   * @returns 엔티티 또는 undefined
   */
  getById(id: number): Promise<T | undefined>;

  /**
   * 모든 엔티티 조회
   * @returns 모든 엔티티 배열
   */
  getAll(): Promise<T[]>;

  /**
   * 엔티티 수정
   * @param id 수정할 엔티티 ID
   * @param updates 수정할 데이터
   */
  update(id: number, updates: UpdateInput): Promise<void>;

  /**
   * 엔티티 삭제
   * @param id 삭제할 엔티티 ID
   */
  delete(id: number): Promise<void>;
}

/**
 * 덱 서비스 인터페이스
 * 덱 관리를 위한 특화된 메서드들을 정의
 */
export interface IDeckService extends CRUDService<Deck, CreateDeckInput, UpdateDeckInput> {
  /**
   * 통계 정보가 포함된 덱 조회
   * @param id 덱 ID
   * @returns 통계 정보가 포함된 덱
   */
  getDeckWithStats(id: number): Promise<DeckWithStats | undefined>;

  /**
   * 덱 이름으로 검색
   * @param query 검색 쿼리
   * @returns 검색 결과 덱 배열
   */
  searchDecks(query: string): Promise<Deck[]>;

  /**
   * 덱 이름 중복 확인
   * @param name 확인할 덱 이름
   * @param excludeId 제외할 덱 ID (수정 시 사용)
   * @returns 중복 여부
   */
  isDuplicateName(name: string, excludeId?: number): Promise<boolean>;
}

/**
 * 카드 서비스 인터페이스
 * 카드 관리를 위한 특화된 메서드들을 정의
 */
export interface ICardService extends CRUDService<Card, CreateCardInput, UpdateCardInput> {
  /**
   * 특정 덱의 모든 카드 조회
   * @param deckId 덱 ID
   * @returns 해당 덱의 카드 배열
   */
  getCardsByDeck(deckId: number): Promise<Card[]>;

  /**
   * 학습용 카드 조회 (향후 간격 반복 알고리즘 적용)
   * @param deckId 덱 ID
   * @returns 학습할 카드 배열
   */
  getCardsForStudy(deckId: number): Promise<Card[]>;

  /**
   * 덱 내에서 카드 검색
   * @param deckId 덱 ID
   * @param query 검색 쿼리
   * @returns 검색 결과 카드 배열
   */
  searchCards(deckId: number, query: string): Promise<Card[]>;

  /**
   * 덱의 카드 개수 조회
   * @param deckId 덱 ID
   * @returns 카드 개수
   */
  getCardCount(deckId: number): Promise<number>;
}

/**
 * 학습 서비스 인터페이스
 * 학습 기록 관리를 위한 특화된 메서드들을 정의
 */
export interface IStudyService extends CRUDService<StudySession, CreateStudySessionInput, UpdateStudySessionInput> {
  /**
   * 특정 카드의 학습 기록 조회
   * @param cardId 카드 ID
   * @returns 해당 카드의 학습 기록 배열 (시간순 정렬)
   */
  getStudyHistory(cardId: number): Promise<StudySession[]>;

  /**
   * 카드의 학습 통계 계산
   * @param cardId 카드 ID
   * @returns 학습 통계 정보
   */
  getStudyStats(cardId: number): Promise<StudyStats>;

  /**
   * 학습 세션 기록
   * @param cardId 카드 ID
   * @param quality 답변 품질
   * @param responseTime 응답 시간 (밀리초)
   * @returns 생성된 학습 세션 ID
   */
  recordStudySession(cardId: number, quality: number, responseTime: number): Promise<number>;

  /**
   * 덱의 학습 통계 계산
   * @param deckId 덱 ID
   * @returns 덱 통계 정보
   */
  getDeckStats(deckId: number): Promise<DeckStats>;

  /**
   * 특정 기간의 학습 기록 조회
   * @param startDate 시작 날짜
   * @param endDate 종료 날짜
   * @returns 해당 기간의 학습 기록 배열
   */
  getStudyHistoryByDateRange(startDate: Date, endDate: Date): Promise<StudySession[]>;
}