const Database = require('better-sqlite3');
const path = require('path');

const DATABASE_PATH = path.join(__dirname, '..', '..', 'database', 'kohi.db');

const db = new Database(DATABASE_PATH);
db.pragma('journal_mode = WAL');

module.exports = db;
