const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'msp.db');

let db = null;

function save() {
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

async function initialize() {
  if (db) return;
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  const SQL = await initSqlJs();
  if (fs.existsSync(DB_PATH)) {
    db = new SQL.Database(fs.readFileSync(DB_PATH));
  } else {
    db = new SQL.Database();
  }
  db.run(`
    CREATE TABLE IF NOT EXISTS tickets (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL, phone TEXT DEFAULT '',
      category TEXT DEFAULT 'Other / Not Sure', priority TEXT DEFAULT 'medium',
      status TEXT DEFAULT 'open', subject TEXT NOT NULL,
      created TEXT NOT NULL, updated TEXT NOT NULL, notes TEXT DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS ticket_messages (
      id TEXT PRIMARY KEY, ticket_id TEXT NOT NULL,
      from_type TEXT NOT NULL, author TEXT NOT NULL,
      text TEXT NOT NULL, ts TEXT NOT NULL,
      FOREIGN KEY (ticket_id) REFERENCES tickets(id)
    );
    CREATE TABLE IF NOT EXISTS clients (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL,
      phone TEXT DEFAULT '', company TEXT DEFAULT '',
      type TEXT DEFAULT 'individual', since TEXT NOT NULL, notes TEXT DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY, invoice_number TEXT NOT NULL UNIQUE,
      client_id TEXT, email TEXT, client_name TEXT,
      amount REAL NOT NULL, status TEXT DEFAULT 'pending',
      due_date TEXT, paid_at TEXT, paid_amount REAL,
      notes TEXT, created TEXT NOT NULL, updated TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS activities (
      id TEXT PRIMARY KEY, type TEXT NOT NULL,
      description TEXT NOT NULL, entity_type TEXT,
      entity_id TEXT, created TEXT NOT NULL
    );
  `);
  save();
}

function all(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
}

function get(sql, params = []) {
  const rows = all(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

function run(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.run(params);
  stmt.free();
  save();
}

module.exports = { initialize, all, get, run, save, get db() { return db; } };
