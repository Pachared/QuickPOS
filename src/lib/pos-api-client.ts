import type { Product, ProductInput } from "../types/pos-models";

export type { Product } from "../types/pos-models";

export type ProductPayload = ProductInput;

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
