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

      listOrders: () => Promise<Order[]>;
      createOrder: (payload: OrderCreatePayload) => Promise<Order>;
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

  type PaymentMethod = "cash" | "transfer";

  interface OrderItem {
    id: number | string;
    name: string;
    qty: number;
    price: number;
  }

  interface Order {
    id: number;
    date: string;
    items: number;
    total: number;
    paymentMethod: PaymentMethod;
    receivedAmount: number;
    change: number;
    products: OrderItem[];
  }

  interface OrderCreatePayload {
    date: string;
    items: number;
    total: number;
    paymentMethod: PaymentMethod;
    receivedAmount: number;
    change: number;
    products: OrderItem[];
  }
}