import sqlite3 from 'sqlite3';
import { Database } from 'sqlite3';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

// Get database path from environment variables or use default
const dbPath = process.env.DB_PATH || path.join(__dirname, '../../data/component_finder.sqlite');

// Ensure the directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Create a database connection
export const getDatabase = async (): Promise<Database> => {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(db);
      }
    });
  });
};

// Create database tables if they don't exist
export const createDatabaseTables = async (): Promise<void> => {
  const db = await getDatabase();
  
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Components table
      db.run(`
        CREATE TABLE IF NOT EXISTS components (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT,
          manufacturer TEXT,
          category TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Shops table
      db.run(`
        CREATE TABLE IF NOT EXISTS shops (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          url TEXT NOT NULL,
          api_key TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Listings table (connects components to shops with price and availability)
      db.run(`
        CREATE TABLE IF NOT EXISTS listings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          component_id INTEGER NOT NULL,
          shop_id INTEGER NOT NULL,
          price REAL,
          currency TEXT DEFAULT 'SEK',
          stock_quantity INTEGER,
          in_stock BOOLEAN,
          url TEXT,
          last_checked TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (component_id) REFERENCES components (id),
          FOREIGN KEY (shop_id) REFERENCES shops (id)
        )
      `);

      // Datasheets table
      db.run(`
        CREATE TABLE IF NOT EXISTS datasheets (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          component_id INTEGER NOT NULL,
          file_path TEXT NOT NULL,
          file_name TEXT NOT NULL,
          file_size INTEGER,
          mime_type TEXT DEFAULT 'application/pdf',
          source_url TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (component_id) REFERENCES components (id)
        )
      `);

      // Parts lists table
      db.run(`
        CREATE TABLE IF NOT EXISTS parts_lists (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Parts list items table
      db.run(`
        CREATE TABLE IF NOT EXISTS parts_list_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          parts_list_id INTEGER NOT NULL,
          component_id INTEGER NOT NULL,
          quantity INTEGER DEFAULT 1,
          notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (parts_list_id) REFERENCES parts_lists (id),
          FOREIGN KEY (component_id) REFERENCES components (id)
        )
      `, (err) => {
        if (err) {
          reject(err);
        } else {
          console.log('Database tables created successfully');
          resolve();
        }
      });
    });
  });
};

// Close the database connection
export const closeDatabase = async (db: Database): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.close((err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};
