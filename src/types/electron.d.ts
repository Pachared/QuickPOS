export {};

declare global {
  interface Window {
    pos: {
      listProducts: () => Promise<Product>;
      createProduct: (payload: ProductPayload) => Promise<ProductItem>;
      updateProduct: (
        id: number,
        payload: ProductPayload
      ) => Promise<ProductItem>;
      deleteProduct: (id: number) => Promise<{ success: true }>;
      increaseStockByBarcode: (
        barcode: string,
        amount?: number
      ) => Promise<ProductItem>;
    };
  }

  interface ProductItem {
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
    createdAt: string;
    updatedAt: string;
  }

  type Product = ProductItem[];

  interface ProductPayload {
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
  }
}
