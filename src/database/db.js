import * as SQLite from 'expo-sqlite';
import { CREATE_TABLES } from './schema';

let database = null;

export const getDatabase = () => {
  if (!database) {
    database = SQLite.openDatabaseSync('craftlog.db');
  }
  return database;
};

export const initDatabase = async () => {
  const db = getDatabase();
  // Activer les foreign keys + exécuter les statements séparément
  const statements = CREATE_TABLES
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (const statement of statements) {
    await db.execAsync(statement + ';');
  }
};
