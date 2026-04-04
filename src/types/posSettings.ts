export type PosSettings = {
  shopName: string;
  receiptFooter: string;
  receiptHeaderNote: string;
  printerPaperSize: "58mm" | "80mm";
  copyCount: number;
  promptPayId: string;
  enableCash: boolean;
  enableTransfer: boolean;
  autoPrintReceipt: boolean;
  showPrintPreview: boolean;
  soundOnCheckout: boolean;
};

export const defaultPosSettings: PosSettings = {
  shopName: "QuickPOS Store",
  receiptFooter: "ขอบคุณที่ใช้บริการ",
  receiptHeaderNote: "ใบเสร็จรับเงิน / ใบกำกับอย่างย่อ",
  printerPaperSize: "80mm",
  copyCount: 1,
  promptPayId: "",
  enableCash: true,
  enableTransfer: true,
  autoPrintReceipt: false,
  showPrintPreview: true,
  soundOnCheckout: true,
};
