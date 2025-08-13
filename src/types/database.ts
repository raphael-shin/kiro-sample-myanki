// Database type definitions for MyAnki

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
}

// Database schema version
export const DATABASE_VERSION = 1;
export const DATABASE_NAME = 'MyAnkiDB';