"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSettingsIpc = registerSettingsIpc;
const electron_1 = require("electron");
const sqlite_1 = require("../database/sqlite");
function validateSettings(payload) {
    return {
        shopName: typeof payload?.shopName === "string"
            ? payload.shopName
            : sqlite_1.defaultPosSettings.shopName,
        receiptFooter: typeof payload?.receiptFooter === "string"
            ? payload.receiptFooter
            : sqlite_1.defaultPosSettings.receiptFooter,
        receiptHeaderNote: typeof payload?.receiptHeaderNote === "string"
            ? payload.receiptHeaderNote
            : sqlite_1.defaultPosSettings.receiptHeaderNote,
        printerPaperSize: payload?.printerPaperSize === "58mm" ? "58mm" : "80mm",
        copyCount: typeof payload?.copyCount === "number"
            ? Math.min(3, Math.max(1, payload.copyCount))
            : sqlite_1.defaultPosSettings.copyCount,
        promptPayId: typeof payload?.promptPayId === "string" ? payload.promptPayId : "",
        enableCash: typeof payload?.enableCash === "boolean"
            ? payload.enableCash
            : sqlite_1.defaultPosSettings.enableCash,
        enableTransfer: typeof payload?.enableTransfer === "boolean"
            ? payload.enableTransfer
            : sqlite_1.defaultPosSettings.enableTransfer,
        autoPrintReceipt: typeof payload?.autoPrintReceipt === "boolean"
            ? payload.autoPrintReceipt
            : sqlite_1.defaultPosSettings.autoPrintReceipt,
        showPrintPreview: typeof payload?.showPrintPreview === "boolean"
            ? payload.showPrintPreview
            : sqlite_1.defaultPosSettings.showPrintPreview,
        soundOnCheckout: typeof payload?.soundOnCheckout === "boolean"
            ? payload.soundOnCheckout
            : sqlite_1.defaultPosSettings.soundOnCheckout,
    };
}
function registerSettingsIpc() {
    electron_1.ipcMain.handle("settings:get", async () => {
        return (0, sqlite_1.getPosSettings)();
    });
    electron_1.ipcMain.handle("settings:save", async (_event, payload) => {
        const input = validateSettings(payload);
        if (!input.enableCash && !input.enableTransfer) {
            throw new Error("ต้องเปิดวิธีชำระเงินอย่างน้อย 1 วิธี");
        }
        if (input.enableTransfer && !input.promptPayId.trim()) {
            throw new Error("กรุณากรอกพร้อมเพย์ / เบอร์รับโอน");
        }
        return (0, sqlite_1.savePosSettings)(input);
    });
    electron_1.ipcMain.handle("settings:reset", async () => {
        return (0, sqlite_1.resetPosSettings)();
    });
}
