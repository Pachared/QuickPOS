"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerOrderIpc = registerOrderIpc;
const electron_1 = require("electron");
const sqlite_1 = require("../database/sqlite");
function validateOrderInput(payload) {
    if (!payload || typeof payload !== "object") {
        throw new Error("ข้อมูลออเดอร์ไม่ถูกต้อง");
    }
    if (!Array.isArray(payload.products) || payload.products.length === 0) {
        throw new Error("ไม่พบรายการสินค้าในออเดอร์");
    }
    const paymentMethod = payload.paymentMethod === "transfer" ? "transfer" : "cash";
    const total = Number(payload.total ?? 0);
    const items = Number(payload.items ?? 0);
    const receivedAmount = Number(payload.receivedAmount ?? 0);
    const change = Number(payload.change ?? 0);
    if (total <= 0) {
        throw new Error("ยอดรวมออเดอร์ต้องมากกว่า 0");
    }
    if (items <= 0) {
        throw new Error("จำนวนสินค้าต้องมากกว่า 0");
    }
    const products = payload.products.map((item) => {
        const id = Number(item.id);
        const qty = Number(item.qty);
        const price = Number(item.price);
        if (!id || id <= 0) {
            throw new Error("พบสินค้าในออเดอร์ที่ไม่มี id ถูกต้อง");
        }
        if (!String(item.name || "").trim()) {
            throw new Error("พบสินค้าในออเดอร์ที่ไม่มีชื่อสินค้า");
        }
        if (qty <= 0) {
            throw new Error("จำนวนสินค้าต้องมากกว่า 0");
        }
        if (price < 0) {
            throw new Error("ราคาสินค้าต้องไม่ติดลบ");
        }
        return {
            id,
            name: String(item.name).trim(),
            qty,
            price,
        };
    });
    return {
        total,
        items,
        paymentMethod,
        receivedAmount,
        change,
        date: String(payload.date || "").trim() ||
            new Date().toLocaleString("sv-SE").replace("T", " ").slice(0, 16),
        products,
    };
}
function registerOrderIpc() {
    electron_1.ipcMain.handle("orders:list", async () => {
        return (0, sqlite_1.listOrders)();
    });
    electron_1.ipcMain.handle("orders:create", async (_event, payload) => {
        return (0, sqlite_1.createOrder)(validateOrderInput(payload));
    });
}
