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