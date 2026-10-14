import { ipcMain } from "electron";
import { createOrder, listOrders, type OrderInput } from "../database/sqlite";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function positiveInteger(value: unknown, message: string) {
  const number = Number(value);
  if (!Number.isSafeInteger(number) || number <= 0) throw new Error(message);
  return number;
}

function nonNegativeAmount(value: unknown, message: string) {
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) throw new Error(message);
  return Math.round((number + Number.EPSILON) * 100) / 100;
}

function validateOrderInput(payload: unknown): OrderInput {
  if (!isRecord(payload)) {
    throw new Error("ข้อมูลออเดอร์ไม่ถูกต้อง");
  }

  if (!Array.isArray(payload.products) || payload.products.length === 0) {
    throw new Error("ไม่พบรายการสินค้าในออเดอร์");
  }

  if (payload.paymentMethod !== "cash" && payload.paymentMethod !== "transfer") {
    throw new Error("วิธีชำระเงินไม่ถูกต้อง");
  }

  const products = payload.products.map((item) => {
    if (!isRecord(item)) throw new Error("ข้อมูลสินค้าในออเดอร์ไม่ถูกต้อง");
    return {
      id: positiveInteger(item.id, "พบสินค้าในออเดอร์ที่ไม่มี id ถูกต้อง"),
      qty: positiveInteger(item.qty, "จำนวนสินค้าต้องมากกว่า 0"),
    };
  });

  return {
    paymentMethod: payload.paymentMethod,
    receivedAmount: nonNegativeAmount(payload.receivedAmount, "จำนวนเงินรับไม่ถูกต้อง"),
    products,
  };
}

export function registerOrderIpc() {
  ipcMain.handle("orders:list", async () => {
    return listOrders();
  });

  ipcMain.handle("orders:create", async (_event, payload) => {
    return createOrder(validateOrderInput(payload));
  });
}
