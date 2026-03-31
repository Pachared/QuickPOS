"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDb = getDb;
exports.listProducts = listProducts;
exports.getProductByBarcode = getProductByBarcode;
exports.createProduct = createProduct;
exports.updateProduct = updateProduct;
exports.deleteProduct = deleteProduct;
exports.increaseStockByBarcode = increaseStockByBarcode;
exports.createOrder = createOrder;
exports.getOrderById = getOrderById;
exports.listOrders = listOrders;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const electron_1 = require("electron");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
let dbInstance = null;
function ensureDb() {
    if (dbInstance)
        return dbInstance;
    const appPath = electron_1.app.getAppPath();
    const rootPath = electron_1.app.isPackaged ? path_1.default.dirname(appPath) : appPath;
    const dataDir = path_1.default.join(rootPath, "data");
    if (!fs_1.default.existsSync(dataDir)) {
        fs_1.default.mkdirSync(dataDir, { recursive: true });
    }
    const dbPath = path_1.default.join(dataDir, "pos.db");
    const db = new better_sqlite3_1.default(dbPath);
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
      order_date TEXT NOT NULL,
      items INTEGER NOT NULL DEFAULT 0,
      total REAL NOT NULL DEFAULT 0,
      payment_method TEXT NOT NULL DEFAULT 'cash',
      received_amount REAL NOT NULL DEFAULT 0,
      change_amount REAL NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      product_name TEXT NOT NULL DEFAULT '',
      quantity INTEGER NOT NULL DEFAULT 1,
      price REAL NOT NULL DEFAULT 0,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
    );

    CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
    CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
    CREATE INDEX IF NOT EXISTS idx_orders_order_date ON orders(order_date);
    CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
    CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
  `);
    dbInstance = db;
    return db;
}
function getDb() {
    return ensureDb();
}
function mapProduct(row) {
    return {
        id: Number(row.id),
        barcode: String(row.barcode),
        sku: String(row.sku),
        name: String(row.name),
        category: String(row.category),
        unit: String(row.unit),
        price: Number(row.price),
        cost: Number(row.cost),
        stockQty: Number(row.stock_qty),
        minStock: Number(row.min_stock),
        supplier: String(row.supplier),
        location: String(row.location),
        description: String(row.description),
        status: row.status === "inactive" ? "inactive" : "active",
        createdAt: String(row.created_at),
        updatedAt: String(row.updated_at),
    };
}
function normalizeProductInput(input) {
    return {
        barcode: String(input.barcode || "").trim(),
        sku: String(input.sku || "").trim(),
        name: String(input.name || "").trim(),
        category: String(input.category || "").trim(),
        unit: String(input.unit || "").trim() || "ชิ้น",
        price: Number(input.price || 0),
        cost: Number(input.cost || 0),
        stockQty: Number(input.stockQty || 0),
        minStock: Number(input.minStock || 0),
        supplier: String(input.supplier || "").trim(),
        location: String(input.location || "").trim(),
        description: String(input.description || "").trim(),
        status: input.status === "inactive" ? "inactive" : "active",
    };
}
function listProducts() {
    const db = getDb();
    const rows = db
        .prepare(`
      SELECT *
      FROM products
      ORDER BY id DESC
      `)
        .all();
    return rows.map(mapProduct);
}
function getProductByBarcode(barcode) {
    const db = getDb();
    const row = db
        .prepare(`
      SELECT *
      FROM products
      WHERE barcode = ?
      LIMIT 1
      `)
        .get(String(barcode || "").trim());
    return row ? mapProduct(row) : null;
}
function createProduct(input) {
    const db = getDb();
    const data = normalizeProductInput(input);
    const now = new Date().toISOString();
    const result = db
        .prepare(`
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
      `)
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
function updateProduct(id, input) {
    const db = getDb();
    const data = normalizeProductInput(input);
    const now = new Date().toISOString();
    const result = db
        .prepare(`
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
      `)
        .run({
        id: Number(id),
        ...data,
        updatedAt: now,
    });
    if (result.changes === 0) {
        throw new Error("ไม่พบสินค้าที่ต้องการแก้ไข");
    }
    const row = db.prepare("SELECT * FROM products WHERE id = ?").get(Number(id));
    return mapProduct(row);
}
function deleteProduct(id) {
    const db = getDb();
    const result = db.prepare("DELETE FROM products WHERE id = ?").run(Number(id));
    if (result.changes === 0) {
        throw new Error("ไม่พบสินค้าที่ต้องการลบ");
    }
    return { success: true };
}
function increaseStockByBarcode(barcode, amount = 1) {
    const db = getDb();
    const cleanBarcode = String(barcode || "").trim();
    const cleanAmount = Number(amount || 1);
    if (!cleanBarcode) {
        throw new Error("barcode ว่าง");
    }
    if (cleanAmount <= 0) {
        throw new Error("จำนวนที่เพิ่มต้องมากกว่า 0");
    }
    const now = new Date().toISOString();
    const result = db
        .prepare(`
      UPDATE products
      SET
        stock_qty = stock_qty + @amount,
        updated_at = @updatedAt
      WHERE barcode = @barcode
      `)
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
function createOrder(input) {
    const db = getDb();
    if (!Array.isArray(input.products) || input.products.length === 0) {
        throw new Error("ไม่พบรายการสินค้าในออเดอร์");
    }
    const tx = db.transaction((payload) => {
        const now = new Date().toISOString();
        const orderResult = db
            .prepare(`
        INSERT INTO orders (
          order_date,
          items,
          total,
          payment_method,
          received_amount,
          change_amount,
          created_at
        )
        VALUES (
          @date,
          @items,
          @total,
          @paymentMethod,
          @receivedAmount,
          @change,
          @createdAt
        )
        `)
            .run({
            date: String(payload.date),
            items: Number(payload.items),
            total: Number(payload.total),
            paymentMethod: payload.paymentMethod === "transfer" ? "transfer" : "cash",
            receivedAmount: Number(payload.receivedAmount),
            change: Number(payload.change),
            createdAt: now,
        });
        const orderId = Number(orderResult.lastInsertRowid);
        const insertItemStmt = db.prepare(`
      INSERT INTO order_items (
        order_id,
        product_id,
        product_name,
        quantity,
        price
      )
      VALUES (
        @orderId,
        @productId,
        @productName,
        @quantity,
        @price
      )
      `);
        const updateStockStmt = db.prepare(`
      UPDATE products
      SET
        stock_qty = stock_qty - @quantity,
        updated_at = @updatedAt
      WHERE id = @productId
        AND stock_qty >= @quantity
      `);
        for (const item of payload.products) {
            const product = db
                .prepare(`
          SELECT id, name, stock_qty
          FROM products
          WHERE id = ?
          LIMIT 1
          `)
                .get(Number(item.id));
            if (!product) {
                throw new Error(`ไม่พบสินค้า id ${item.id}`);
            }
            if (Number(product.stock_qty) < Number(item.qty)) {
                throw new Error(`สต๊อกสินค้า "${product.name}" ไม่เพียงพอ`);
            }
            insertItemStmt.run({
                orderId,
                productId: Number(item.id),
                productName: String(item.name || product.name),
                quantity: Number(item.qty),
                price: Number(item.price),
            });
            const stockResult = updateStockStmt.run({
                productId: Number(item.id),
                quantity: Number(item.qty),
                updatedAt: now,
            });
            if (stockResult.changes === 0) {
                throw new Error(`ตัดสต๊อกสินค้า "${product.name}" ไม่สำเร็จ`);
            }
        }
        return orderId;
    });
    const orderId = tx(input);
    const created = getOrderById(orderId);
    if (!created) {
        throw new Error("บันทึกออเดอร์สำเร็จแต่ไม่สามารถอ่านข้อมูลออเดอร์ได้");
    }
    return created;
}
function getOrderById(id) {
    const db = getDb();
    const order = db
        .prepare(`
      SELECT
        id,
        order_date,
        items,
        total,
        payment_method,
        received_amount,
        change_amount,
        created_at
      FROM orders
      WHERE id = ?
      LIMIT 1
      `)
        .get(Number(id));
    if (!order)
        return null;
    const items = db
        .prepare(`
      SELECT
        product_id,
        product_name,
        quantity,
        price
      FROM order_items
      WHERE order_id = ?
      ORDER BY id ASC
      `)
        .all(Number(id));
    return {
        id: Number(order.id),
        date: String(order.order_date),
        items: Number(order.items),
        total: Number(order.total),
        paymentMethod: order.payment_method === "transfer" ? "transfer" : "cash",
        receivedAmount: Number(order.received_amount),
        change: Number(order.change_amount),
        createdAt: String(order.created_at),
        products: items.map((item) => ({
            id: Number(item.product_id),
            name: String(item.product_name),
            qty: Number(item.quantity),
            price: Number(item.price),
        })),
    };
}
function listOrders() {
    const db = getDb();
    const orders = db
        .prepare(`
      SELECT
        id,
        order_date,
        items,
        total,
        payment_method,
        received_amount,
        change_amount,
        created_at
      FROM orders
      ORDER BY id DESC
      `)
        .all();
    const itemStmt = db.prepare(`
    SELECT
      product_id,
      product_name,
      quantity,
      price
    FROM order_items
    WHERE order_id = ?
    ORDER BY id ASC
    `);
    return orders.map((order) => {
        const products = itemStmt.all(Number(order.id));
        return {
            id: Number(order.id),
            date: String(order.order_date),
            items: Number(order.items),
            total: Number(order.total),
            paymentMethod: order.payment_method === "transfer" ? "transfer" : "cash",
            receivedAmount: Number(order.received_amount),
            change: Number(order.change_amount),
            createdAt: String(order.created_at),
            products: products.map((item) => ({
                id: Number(item.product_id),
                name: String(item.product_name),
                qty: Number(item.quantity),
                price: Number(item.price),
            })),
        };
    });
}
