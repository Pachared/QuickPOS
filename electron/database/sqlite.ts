import Database from "better-sqlite3";
import { app } from "electron";
import fs from "fs";
import path from "path";

export type ProductStatus = "active" | "inactive";

export interface ProductRow {
  id: number;
  barcode: string;
  sku: string;
  name: string;
  category: string;
  unit: string;
  price: number;
  cost: number;
  stockQty: number;
  minStock: number;
  supplier: string;
  location: string;
  description: string;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
}

let dbInstance: Database.Database | null = null;

function ensureDb() {
  if (dbInstance) return dbInstance;

  const userDataPath = app.getPath("userData");
  const dataDir = path.join(userDataPath, "data");

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const dbPath = path.join(dataDir, "pos.db");
  const db = new Database(dbPath);

  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      barcode TEXT NOT NULL UNIQUE,
      sku TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT '',
      unit TEXT NOT NULL DEFAULT 'ชิ้น',
      price REAL NOT NULL DEFAULT 0,
      cost REAL NOT NULL DEFAULT 0,
      stock_qty INTEGER NOT NULL DEFAULT 0,
      min_stock INTEGER NOT NULL DEFAULT 0,
      supplier TEXT NOT NULL DEFAULT '',
      location TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      total REAL NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      price REAL NOT NULL DEFAULT 0,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
    CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
    CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
    CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
  `);

  dbInstance = db;
  return db;
}

export function getDb() {
  return ensureDb();
}

function mapProduct(row: any): ProductRow {
  return {
    id: row.id,
    barcode: row.barcode,
    sku: row.sku,
    name: row.name,
    category: row.category,
    unit: row.unit,
    price: Number(row.price),
    cost: Number(row.cost),
    stockQty: Number(row.stock_qty),
    minStock: Number(row.min_stock),
    supplier: row.supplier,
    location: row.location,
    description: row.description,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function listProducts(): ProductRow[] {
  const db = getDb();
  const rows = db
    .prepare(
      `
      SELECT *
      FROM products
      ORDER BY id DESC
      `
    )
    .all();

  return rows.map(mapProduct);
}

export function getProductByBarcode(barcode: string): ProductRow | null {
  const db = getDb();
  const row = db
    .prepare(
      `
      SELECT *
      FROM products
      WHERE barcode = ?
      LIMIT 1
      `
    )
    .get(barcode.trim());

  return row ? mapProduct(row) : null;
}

export interface ProductInput {
  barcode: string;
  sku: string;
  name: string;
  category: string;
  unit: string;
  price: number;
  cost: number;
  stockQty: number;
  minStock: number;
  supplier: string;
  location: string;
  description: string;
  status: ProductStatus;
}

function normalizeProductInput(input: ProductInput) {
  return {
    barcode: input.barcode.trim(),
    sku: input.sku.trim(),
    name: input.name.trim(),
    category: input.category.trim(),
    unit: input.unit.trim() || "ชิ้น",
    price: Number(input.price || 0),
    cost: Number(input.cost || 0),
    stockQty: Number(input.stockQty || 0),
    minStock: Number(input.minStock || 0),
    supplier: input.supplier.trim(),
    location: input.location.trim(),
    description: input.description.trim(),
    status: input.status === "inactive" ? "inactive" : "active",
  } satisfies ProductInput;
}

export function createProduct(input: ProductInput): ProductRow {
  const db = getDb();
  const data = normalizeProductInput(input);
  const now = new Date().toISOString();

  const result = db
    .prepare(
      `
      INSERT INTO products (
        barcode, sku, name, category, unit, price, cost,
        stock_qty, min_stock, supplier, location, description, status,
        created_at, updated_at
      )
      VALUES (
        @barcode, @sku, @name, @category, @unit, @price, @cost,
        @stockQty, @minStock, @supplier, @location, @description, @status,
        @createdAt, @updatedAt
      )
      `
    )
    .run({
      ...data,
      createdAt: now,
      updatedAt: now,
    });

  const row = db
    .prepare("SELECT * FROM products WHERE id = ?")
    .get(result.lastInsertRowid);

  return mapProduct(row);
}

export function updateProduct(id: number, input: ProductInput): ProductRow {
  const db = getDb();
  const data = normalizeProductInput(input);
  const now = new Date().toISOString();

  const result = db
    .prepare(
      `
      UPDATE products
      SET
        barcode = @barcode,
        sku = @sku,
        name = @name,
        category = @category,
        unit = @unit,
        price = @price,
        cost = @cost,
        stock_qty = @stockQty,
        min_stock = @minStock,
        supplier = @supplier,
        location = @location,
        description = @description,
        status = @status,
        updated_at = @updatedAt
      WHERE id = @id
      `
    )
    .run({
      id,
      ...data,
      updatedAt: now,
    });

  if (result.changes === 0) {
    throw new Error("ไม่พบสินค้าที่ต้องการแก้ไข");
  }

  const row = db.prepare("SELECT * FROM products WHERE id = ?").get(id);
  return mapProduct(row);
}

export function deleteProduct(id: number) {
  const db = getDb();
  const result = db.prepare("DELETE FROM products WHERE id = ?").run(id);

  if (result.changes === 0) {
    throw new Error("ไม่พบสินค้าที่ต้องการลบ");
  }

  return { success: true };
}

export function increaseStockByBarcode(barcode: string, amount = 1): ProductRow {
  const db = getDb();
  const cleanBarcode = barcode.trim();
  const cleanAmount = Number(amount || 1);

  if (!cleanBarcode) {
    throw new Error("barcode ว่าง");
  }

  if (cleanAmount <= 0) {
    throw new Error("จำนวนที่เพิ่มต้องมากกว่า 0");
  }

  const now = new Date().toISOString();

  const result = db
    .prepare(
      `
      UPDATE products
      SET
        stock_qty = stock_qty + @amount,
        updated_at = @updatedAt
      WHERE barcode = @barcode
      `
    )
    .run({
      barcode: cleanBarcode,
      amount: cleanAmount,
      updatedAt: now,
    });

  if (result.changes === 0) {
    throw new Error("ไม่พบบาร์โค้ดนี้ในระบบ");
  }

  const row = db
    .prepare("SELECT * FROM products WHERE barcode = ? LIMIT 1")
    .get(cleanBarcode);

  return mapProduct(row);
}