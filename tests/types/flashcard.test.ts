/**
 * 플래시카드 타입 정의 검증 테스트
 * 기본 타입 구조와 타입 안전성을 검증
 */

import {
  StudyQuality,
  Deck,
  Card,
  StudySession,
  CreateDeckInput,
  UpdateDeckInput,
  CreateCardInput,
  UpdateCardInput,
  CreateStudySessionInput,
  DeckStats,
  StudyStats,
  DeckWithStats
} from '@/types/flashcard';

describe('Flashcard Types', () => {
  describe('StudyQuality enum', () => {
    it('should have correct numeric values', () => {
      expect(StudyQuality.AGAIN).toBe(1);
      expect(StudyQuality.HARD).toBe(2);
      expect(StudyQuality.GOOD).toBe(3);
      expect(StudyQuality.EASY).toBe(4);
    });

    it('should be usable as object keys', () => {
      const qualityMap = {
        [StudyQuality.AGAIN]: 'Again',
        [StudyQuality.HARD]: 'Hard',
        [StudyQuality.GOOD]: 'Good',
        [StudyQuality.EASY]: 'Easy'
      };

      expect(qualityMap[StudyQuality.AGAIN]).toBe('Again');
      expect(qualityMap[StudyQuality.EASY]).toBe('Easy');
    });
  });

  describe('Deck interface', () => {
    it('should accept valid deck data', () => {
      const deck: Deck = {
        id: 1,
        name: 'Test Deck',
        description: 'A test deck',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      expect(deck.name).toBe('Test Deck');
      expect(deck.description).toBe('A test deck');
      expect(typeof deck.id).toBe('number');
    });

    it('should work with minimal required fields', () => {
      const deck: Deck = {
        name: 'Minimal Deck'
      };

      expect(deck.name).toBe('Minimal Deck');
      expect(deck.id).toBeUndefined();
      expect(deck.description).toBeUndefined();
    });
  });

  describe('Card interface', () => {
    it('should accept valid card data', () => {
      const card: Card = {
        id: 1,
        deckId: 1,
        front: 'Question',
        back: 'Answer',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      expect(card.deckId).toBe(1);
      expect(card.front).toBe('Question');
      expect(card.back).toBe('Answer');
    });

    it('should require deckId, front, and back fields', () => {
      const card: Card = {
        deckId: 1,
        front: 'Question',
        back: 'Answer'
      };

      expect(card.deckId).toBe(1);
      expect(card.front).toBe('Question');
      expect(card.back).toBe('Answer');
    });
  });

  describe('StudySession interface', () => {
    it('should accept valid study session data', () => {
      const session: StudySession = {
        id: 1,
        cardId: 1,
        studiedAt: new Date(),
        quality: StudyQuality.GOOD,
        responseTime: 5000
      };

      expect(session.cardId).toBe(1);
      expect(session.quality).toBe(StudyQuality.GOOD);
      expect(session.responseTime).toBe(5000);
    });

    it('should work with all quality values', () => {
      const sessions: StudySession[] = [
        {
          cardId: 1,
          studiedAt: new Date(),
          quality: StudyQuality.AGAIN,
          responseTime: 1000
        },
        {
          cardId: 1,
          studiedAt: new Date(),
          quality: StudyQuality.HARD,
          responseTime: 2000
        },
        {
          cardId: 1,
          studiedAt: new Date(),
          quality: StudyQuality.GOOD,
          responseTime: 3000
        },
        {
          cardId: 1,
          studiedAt: new Date(),
          quality: StudyQuality.EASY,
          responseTime: 4000
        }
      ];

      expect(sessions).toHaveLength(4);
      expect(sessions[0].quality).toBe(1);
      expect(sessions[3].quality).toBe(4);
    });
  });

  describe('Input types', () => {
    it('should work with CreateDeckInput', () => {
      const input: CreateDeckInput = {
        name: 'New Deck',
        description: 'A new deck'
      };

      expect(input.name).toBe('New Deck');
      // TypeScript should prevent these properties
      // input.id = 1; // Should cause compile error
      // input.createdAt = new Date(); // Should cause compile error
    });

    it('should work with UpdateDeckInput', () => {
      const input: UpdateDeckInput = {
        name: 'Updated Deck'
      };

      expect(input.name).toBe('Updated Deck');
      expect(input.description).toBeUndefined();
    });

    it('should work with CreateCardInput', () => {
      const input: CreateCardInput = {
        deckId: 1,
        front: 'Question',
        back: 'Answer'
      };

      expect(input.deckId).toBe(1);
      expect(input.front).toBe('Question');
      expect(input.back).toBe('Answer');
    });

    it('should work with UpdateCardInput', () => {
      const input: UpdateCardInput = {
        front: 'Updated Question'
      };

      expect(input.front).toBe('Updated Question');
      expect(input.back).toBeUndefined();
      // TypeScript should prevent deckId updates
      // input.deckId = 2; // Should cause compile error
    });

    it('should work with CreateStudySessionInput', () => {
      const input: CreateStudySessionInput = {
        cardId: 1,
        studiedAt: new Date(),
        quality: StudyQuality.GOOD,
        responseTime: 3000
      };

      expect(input.cardId).toBe(1);
      expect(input.quality).toBe(StudyQuality.GOOD);
      expect(input.responseTime).toBe(3000);
    });
  });

  describe('Stats interfaces', () => {
    it('should work with DeckStats', () => {
      const stats: DeckStats = {
        totalCards: 10,
        studiedCards: 5,
        averageQuality: 3.2,
        lastStudiedAt: new Date()
      };

      expect(stats.totalCards).toBe(10);
      expect(stats.studiedCards).toBe(5);
      expect(stats.averageQuality).toBe(3.2);
    });

    it('should work with StudyStats', () => {
      const stats: StudyStats = {
        totalSessions: 20,
        averageQuality: 3.5,
        averageResponseTime: 4500,
        studyStreak: 5
      };

      expect(stats.totalSessions).toBe(20);
      expect(stats.averageQuality).toBe(3.5);
      expect(stats.averageResponseTime).toBe(4500);
      expect(stats.studyStreak).toBe(5);
    });

    it('should work with DeckWithStats', () => {
      const deckWithStats: DeckWithStats = {
        id: 1,
        name: 'Test Deck',
        description: 'A test deck',
        createdAt: new Date(),
        updatedAt: new Date(),
        stats: {
          totalCards: 10,
          studiedCards: 5,
          averageQuality: 3.2,
          lastStudiedAt: new Date()
        }
      };

      expect(deckWithStats.name).toBe('Test Deck');
      expect(deckWithStats.stats.totalCards).toBe(10);
      expect(deckWithStats.stats.studiedCards).toBe(5);
    });
  });
});