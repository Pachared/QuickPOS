import { ipcMain } from "electron";
import {
  defaultPosSettings,
  getPosSettings,
  resetPosSettings,
  savePosSettings,
  type PosSettingsRow,
} from "../database/sqlite";

function validateSettings(payload: unknown): PosSettingsRow {
  const input = payload && typeof payload === "object" ? payload as Record<string, unknown> : {};
  const copyCount = Number(input.copyCount);
  return {
    shopName:
      typeof input.shopName === "string"
        ? input.shopName
        : defaultPosSettings.shopName,
    receiptFooter:
      typeof input.receiptFooter === "string"
        ? input.receiptFooter
        : defaultPosSettings.receiptFooter,
    receiptHeaderNote:
      typeof input.receiptHeaderNote === "string"
        ? input.receiptHeaderNote
        : defaultPosSettings.receiptHeaderNote,
    printerPaperSize: input.printerPaperSize === "58mm" ? "58mm" : "80mm",
    copyCount:
      Number.isSafeInteger(copyCount)
        ? Math.min(3, Math.max(1, copyCount))
        : defaultPosSettings.copyCount,
    promptPayId:
      typeof input.promptPayId === "string" ? input.promptPayId : "",
    enableCash:
      typeof input.enableCash === "boolean"
        ? input.enableCash
        : defaultPosSettings.enableCash,
    enableTransfer:
      typeof input.enableTransfer === "boolean"
        ? input.enableTransfer
        : defaultPosSettings.enableTransfer,
    autoPrintReceipt:
      typeof input.autoPrintReceipt === "boolean"
        ? input.autoPrintReceipt
        : defaultPosSettings.autoPrintReceipt,
    showPrintPreview:
      typeof input.showPrintPreview === "boolean"
        ? input.showPrintPreview
        : defaultPosSettings.showPrintPreview,
    soundOnCheckout:
      typeof input.soundOnCheckout === "boolean"
        ? input.soundOnCheckout
        : defaultPosSettings.soundOnCheckout,
  };
}

export function registerSettingsIpc() {
  ipcMain.handle("settings:get", async () => {
    return getPosSettings();
  });

  ipcMain.handle("settings:save", async (_event, payload) => {
    const input = validateSettings(payload);

    if (!input.enableCash && !input.enableTransfer) {
      throw new Error("ต้องเปิดวิธีชำระเงินอย่างน้อย 1 วิธี");
    }

    if (input.enableTransfer && !input.promptPayId.trim()) {
      throw new Error("กรุณากรอกพร้อมเพย์ / เบอร์รับโอน");
    }

    return savePosSettings(input);
  });

  ipcMain.handle("settings:reset", async () => {
    return resetPosSettings();
  });
}
