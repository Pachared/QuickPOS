export interface Product {
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
  status: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}

export type ProductPayload = Omit<Product, "id" | "createdAt" | "updatedAt">;

function ensurePosApi() {
  if (!window.pos) {
    throw new Error("POS API ไม่พร้อมใช้งาน");
  }
  return window.pos;
}

export const posApi = {
  listProducts: async (): Promise<Product[]> => {
    return ensurePosApi().listProducts();
  },

  createProduct: async (payload: ProductPayload): Promise<Product> => {
    return ensurePosApi().createProduct(payload);
  },

  updateProduct: async (
    id: number,
    payload: ProductPayload
  ): Promise<Product> => {
    return ensurePosApi().updateProduct(id, payload);
  },

  deleteProduct: async (id: number) => {
    return ensurePosApi().deleteProduct(id);
  },

  increaseStockByBarcode: async (
    barcode: string,
    amount = 1
  ): Promise<Product> => {
    return ensurePosApi().increaseStockByBarcode(barcode, amount);
  },
};
