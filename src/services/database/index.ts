import * as SQLite from 'expo-sqlite';
import { DB_NAME } from '../../config/constants';

let db: SQLite.SQLiteDatabase | null = null;

export const getDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  if (db) return db;
  
  db = await SQLite.openDatabaseAsync(DB_NAME);
  await initializeDatabase();
  return db;
};

const initializeDatabase = async (): Promise<void> => {
  if (!db) return;

  // Create bills table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS bills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bill_number TEXT UNIQUE NOT NULL,
      order_type TEXT CHECK(order_type IN ('parcel', 'dine-in')) NOT NULL,
      items_json TEXT NOT NULL,
      subtotal REAL NOT NULL,
      total REAL NOT NULL,
      created_at TEXT DEFAULT (datetime('now', 'localtime'))
    );
  `);

  // Create daily counter table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS daily_counter (
      date TEXT PRIMARY KEY,
      counter INTEGER DEFAULT 0
    );
  `);

  // Create settings table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);

  // Create index for faster queries
  await db.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_bills_created_at ON bills(created_at);
  `);
};

export const closeDatabase = async (): Promise<void> => {
  if (db) {
    await db.closeAsync();
    db = null;
  }
};
