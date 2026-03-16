import Database from "better-sqlite3";

const db = new Database("pos.db");

db.prepare(
  `
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  barcode TEXT UNIQUE,
  price REAL,
  stock INTEGER
)
`
).run();

db.prepare(
  `
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  total REAL,
  created_at TEXT
)
`
).run();

db.prepare(
  `
CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER,
  product_id INTEGER,
  quantity INTEGER,
  price REAL
)
`
).run();

export default db;
