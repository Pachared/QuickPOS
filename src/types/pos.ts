export type PaymentMethod = "cash" | "transfer";
export type ProductStatus = "active" | "inactive";

export type CartItem = {
  id: number | string;
  barcode?: string;
  sku?: string;
  name: string;
  category?: string;
  unit?: string;
  price: number;
  cost?: number;
  stockQty?: number;
  minStock?: number;
  supplier?: string;
  location?: string;
  description?: string;
  status?: ProductStatus;
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
  createdAt?: string;
};

export type Product = {
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
};

export type ProductInput = {
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
};

export type OrderCreatePayload = {
  total: number;
  items: number;
  paymentMethod: PaymentMethod;
  receivedAmount: number;
  change: number;
  date: string;
  products: Array<{
    id: number;
    name: string;
    qty: number;
    price: number;
  }>;
};

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

export type CustomerDisplayPayload = {
  mode: "idle" | "transfer";
  shopName: string;
  receiptHeaderNote: string;
  receiptNo: string;
  promptPayId: string;
  total: number;
  qrDataUrl: string;
};

declare global {
  interface Window {
    pos: {
      listProducts: () => Promise<Product[]>;
      createProduct: (payload: ProductInput) => Promise<Product>;
      updateProduct: (id: number, payload: ProductInput) => Promise<Product>;
      deleteProduct: (id: number) => Promise<{ success: true }>;
      increaseStockByBarcode: (
        barcode: string,
        amount?: number
      ) => Promise<Product>;

      listOrders: () => Promise<Order[]>;
      createOrder: (payload: OrderCreatePayload) => Promise<Order>;

      getSettings: () => Promise<PosSettings>;
      saveSettings: (payload: PosSettings) => Promise<PosSettings>;
      resetSettings: () => Promise<PosSettings>;

      openCustomerDisplay: (
        payload: CustomerDisplayPayload
      ) => Promise<{ success: true }>;
      updateCustomerDisplay: (
        payload: CustomerDisplayPayload
      ) => Promise<{ success: true }>;
      closeCustomerDisplay: () => Promise<{ success: true }>;
    };

    customerDisplay: {
      onStateChange: (
        callback: (payload: CustomerDisplayPayload) => void
      ) => () => void;
    };
  }
}

export {};