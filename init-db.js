const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'kohi.db');
const db = new Database(dbPath);

// Create waitlist table
db.exec(`
  CREATE TABLE waitlist (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    position INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Insert test user
const insert = db.prepare(`
  INSERT INTO waitlist (name, email, password_hash, position)
  VALUES (?, ?, ?, ?)
`);

insert.run('Café Lover', 'test@kohi.com', 'placeholder', 1);

console.log('Database initialized successfully');
console.log('Table created: waitlist');
console.log('Test user inserted: Café Lover (test@kohi.com)');

db.close();
