import { ipcMain } from "electron";
import {
  defaultPosSettings,
  getPosSettings,
  resetPosSettings,
  savePosSettings,
  type PosSettingsRow,
} from "../database/sqlite";

function validateSettings(payload: any): PosSettingsRow {
  return {
    shopName:
      typeof payload?.shopName === "string"
        ? payload.shopName
        : defaultPosSettings.shopName,
    receiptFooter:
      typeof payload?.receiptFooter === "string"
        ? payload.receiptFooter
        : defaultPosSettings.receiptFooter,
    receiptHeaderNote:
      typeof payload?.receiptHeaderNote === "string"
        ? payload.receiptHeaderNote
        : defaultPosSettings.receiptHeaderNote,
    printerPaperSize: payload?.printerPaperSize === "58mm" ? "58mm" : "80mm",
    copyCount:
      typeof payload?.copyCount === "number"
        ? Math.min(3, Math.max(1, payload.copyCount))
        : defaultPosSettings.copyCount,
    promptPayId:
      typeof payload?.promptPayId === "string" ? payload.promptPayId : "",
    enableCash:
      typeof payload?.enableCash === "boolean"
        ? payload.enableCash
        : defaultPosSettings.enableCash,
    enableTransfer:
      typeof payload?.enableTransfer === "boolean"
        ? payload.enableTransfer
        : defaultPosSettings.enableTransfer,
    autoPrintReceipt:
      typeof payload?.autoPrintReceipt === "boolean"
        ? payload.autoPrintReceipt
        : defaultPosSettings.autoPrintReceipt,
    showPrintPreview:
      typeof payload?.showPrintPreview === "boolean"
        ? payload.showPrintPreview
        : defaultPosSettings.showPrintPreview,
    soundOnCheckout:
      typeof payload?.soundOnCheckout === "boolean"
        ? payload.soundOnCheckout
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
