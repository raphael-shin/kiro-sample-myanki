// Database type definitions for MyAnki

import { Deck, Card, StudySession } from './flashcard';

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
}

// Database schema version
export const DATABASE_VERSION = 2;
export const DATABASE_NAME = 'MyAnkiDB';