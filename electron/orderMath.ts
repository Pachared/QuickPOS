export type PricedOrderItem = {
  price: number;
  qty: number;
};

export function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function calculateOrderTotal(items: PricedOrderItem[]) {
  return roundMoney(
    items.reduce((sum, item) => sum + item.price * item.qty, 0)
  );
}
