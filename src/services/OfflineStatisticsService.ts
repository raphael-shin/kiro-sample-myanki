import { db } from '@/db/MyAnkiDB';

export interface OfflineStats {
  totalSessions: number;
  totalCardsStudied: number;
  averageEaseFactor: number;
  lastUpdated: Date;
}

export interface DeckOfflineStats {
  deckId: number;
  totalCards: number;
  totalSessions: number;
  averageEaseFactor: number;
  lastUpdated: Date;
}

export class OfflineStatisticsService {
  async calculateOfflineStats(): Promise<OfflineStats> {
    const [sessions, cards] = await Promise.all([
      db.studySessions.toArray(),
      db.cards.toArray(),
    ]);

    const totalSessions = sessions.length;
    const totalCardsStudied = sessions.length; // Each session represents one card studied

    // Get spaced repetition data for ease factors
    const spacedRepData = await db.spacedRepetitionData.toArray();
    const averageEaseFactor = spacedRepData.length > 0
      ? spacedRepData.reduce((sum, data) => sum + data.easeFactor, 0) / spacedRepData.length
      : 0;

    return {
      totalSessions,
      totalCardsStudied,
      averageEaseFactor,
      lastUpdated: new Date(),
    };
  }

  async getDeckOfflineStats(deckId: number): Promise<DeckOfflineStats> {
    const cards = await db.cards.where('deckId').equals(deckId).toArray();
    const cardIds = cards.map(card => card.id!);
    
    // Get all sessions and filter by cardId
    const allSessions = await db.studySessions.toArray();
    const sessions = allSessions.filter(session => cardIds.includes(session.cardId));
    
    const totalCards = cards.length;
    const totalSessions = sessions.length;

    // Get spaced repetition data for this deck's cards
    const spacedRepData = await db.spacedRepetitionData
      .where('cardId')
      .anyOf(cardIds)
      .toArray();

    const averageEaseFactor = spacedRepData.length > 0
      ? spacedRepData.reduce((sum, data) => sum + data.easeFactor, 0) / spacedRepData.length
      : 0;

    return {
      deckId,
      totalCards,
      totalSessions,
      averageEaseFactor,
      lastUpdated: new Date(),
    };
  }
}
