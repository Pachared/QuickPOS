import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import db from "./database/sqlite";

const isDev = !app.isPackaged;

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  if (isDev) {
    // ตอน dev
    win.loadURL("http://localhost:5173");
    win.webContents.openDevTools();
  } else {
    // ตอน build exe
    win.loadFile(path.join(__dirname, "../dist/index.html"));
  }
  win.webContents.openDevTools();
}

app.whenReady().then(createWindow);

/* ---------- Product Lookup ---------- */

ipcMain.handle("product:getByBarcode", (event, barcode) => {
  const product = db
    .prepare("SELECT * FROM products WHERE barcode=?")
    .get(barcode);

  return product;
});

/* ---------- Save Order ---------- */

ipcMain.handle("order:create", (event, cart) => {
  const total = cart.reduce(
    (sum: number, item: any) => sum + item.price * item.qty,
    0
  );

  const order = db
    .prepare(
      "INSERT INTO orders (total, created_at) VALUES (?, datetime('now'))"
    )
    .run(total);

  const orderId = order.lastInsertRowid;

  const insertItem = db.prepare(`
    INSERT INTO order_items
    (order_id, product_id, quantity, price)
    VALUES (?, ?, ?, ?)
  `);

  const transaction = db.transaction((items) => {
    for (const item of items) {
      insertItem.run(orderId, item.id, item.qty, item.price);
    }
  });

  transaction(cart);

  return { success: true };
});

ipcMain.handle("products:getAll", () => {
  const products = db.prepare("SELECT * FROM products").all();
  return products;
});
