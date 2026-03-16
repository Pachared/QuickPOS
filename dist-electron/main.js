"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const sqlite_1 = __importDefault(require("./database/sqlite"));
const isDev = !electron_1.app.isPackaged;
function createWindow() {
    const win = new electron_1.BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path_1.default.join(__dirname, "preload.js"),
        },
    });
    if (isDev) {
        // ตอน dev
        win.loadURL("http://localhost:5173");
        win.webContents.openDevTools();
    }
    else {
        // ตอน build exe
        win.loadFile(path_1.default.join(__dirname, "../dist/index.html"));
    }
    win.webContents.openDevTools();
}
electron_1.app.whenReady().then(createWindow);
/* ---------- Product Lookup ---------- */
electron_1.ipcMain.handle("product:getByBarcode", (event, barcode) => {
    const product = sqlite_1.default
        .prepare("SELECT * FROM products WHERE barcode=?")
        .get(barcode);
    return product;
});
/* ---------- Save Order ---------- */
electron_1.ipcMain.handle("order:create", (event, cart) => {
    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const order = sqlite_1.default
        .prepare("INSERT INTO orders (total, created_at) VALUES (?, datetime('now'))")
        .run(total);
    const orderId = order.lastInsertRowid;
    const insertItem = sqlite_1.default.prepare(`
    INSERT INTO order_items
    (order_id, product_id, quantity, price)
    VALUES (?, ?, ?, ?)
  `);
    const transaction = sqlite_1.default.transaction((items) => {
        for (const item of items) {
            insertItem.run(orderId, item.id, item.qty, item.price);
        }
    });
    transaction(cart);
    return { success: true };
});
electron_1.ipcMain.handle("products:getAll", () => {
    const products = sqlite_1.default.prepare("SELECT * FROM products").all();
    return products;
});
