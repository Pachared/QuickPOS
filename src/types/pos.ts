export type PaymentMethod = "cash" | "transfer";

export type CartItem = {
  id: number | string;
  name: string;
  price: number;
  qty: number;
};

export type OrderItem = {
  id: number | string;
  name: string;
  qty: number;
  price: number;
};

export type Order = {
  id: number;
  date: string;
  items: number;
  total: number;
  paymentMethod: PaymentMethod;
  receivedAmount: number;
  change: number;
  products: OrderItem[];
};

export type OrderCreatePayload = Omit<Order, "id">;

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

declare global {
  interface Window {
    pos: {
      listProducts: () => Promise<any[]>;
      createProduct: (payload: any) => Promise<any>;
      updateProduct: (id: number, payload: any) => Promise<any>;
      deleteProduct: (id: number) => Promise<{ success: true }>;
      increaseStockByBarcode: (barcode: string, amount?: number) => Promise<any>;

      listOrders: () => Promise<Order[]>;
      createOrder: (payload: OrderCreatePayload) => Promise<Order>;

      getSettings: () => Promise<PosSettings>;
      saveSettings: (payload: PosSettings) => Promise<PosSettings>;
      resetSettings: () => Promise<PosSettings>;
    };
  }
}

export {};