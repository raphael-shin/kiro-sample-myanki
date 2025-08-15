// Database type definitions for MyAnki

import { Deck, Card, StudySession } from './flashcard';
import { SpacedRepetitionCard } from './spaced-repetition';

export interface Setting {
  id?: number;
  key: string;
  value: string | number | boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Database table interfaces
export interface DatabaseTables {
  settings: Setting;
  decks: Deck;
  cards: Card;
  studySessions: StudySession;
  spacedRepetitionData: SpacedRepetitionCard;
}

// Database schema version
export const DATABASE_VERSION = 3;
export const DATABASE_NAME = 'MyAnkiDB';