import { ipcMain } from "electron";
import {
  createProduct,
  deleteProduct,
  increaseStockByBarcode,
  listProducts,
  updateProduct,
  type ProductInput,
} from "../database/pos-database";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function finiteNumber(value: unknown, message: string, minimum: number) {
  const number = Number(value);
  if (!Number.isFinite(number) || number < minimum) throw new Error(message);
  return number;
}

function validateProductInput(payload: unknown): ProductInput {
  if (!isRecord(payload)) {
    throw new Error("ข้อมูลสินค้าไม่ถูกต้อง");
  }

  if (!String(payload.barcode || "").trim()) {
    throw new Error("กรุณากรอกบาร์โค้ดสินค้า");
  }

  if (!String(payload.sku || "").trim()) {
    throw new Error("กรุณากรอกรหัสสินค้า");
  }

  if (!String(payload.name || "").trim()) {
    throw new Error("กรุณากรอกชื่อสินค้า");
  }

  if (!String(payload.category || "").trim()) {
    throw new Error("กรุณาเลือกหมวดหมู่สินค้า");
  }

  if (!String(payload.unit || "").trim()) {
    throw new Error("กรุณาเลือกหน่วยสินค้า");
  }

  return {
    barcode: String(payload.barcode),
    sku: String(payload.sku),
    name: String(payload.name),
    category: String(payload.category),
    unit: String(payload.unit),
    price: finiteNumber(payload.price, "ราคาขายต้องมากกว่า 0", Number.EPSILON),
    cost: finiteNumber(payload.cost, "ต้นทุนต้องไม่ติดลบ", 0),
    stockQty: finiteNumber(payload.stockQty, "จำนวนสินค้าในสต๊อกต้องไม่ติดลบ", 0),
    minStock: finiteNumber(payload.minStock, "สต๊อกขั้นต่ำต้องไม่ติดลบ", 0),
    supplier: String(payload.supplier || ""),
    location: String(payload.location || ""),
    description: String(payload.description || ""),
    status: payload.status === "inactive" ? "inactive" : "active",
  };
}

export function registerProductIpc() {
  ipcMain.handle("products:list", async () => {
    return listProducts();
  });

  ipcMain.handle("products:create", async (_event, payload) => {
    return createProduct(validateProductInput(payload));
  });

  ipcMain.handle("products:update", async (_event, id: unknown, payload: unknown) => {
    if (!Number.isSafeInteger(Number(id)) || Number(id) <= 0) {
      throw new Error("ไม่พบรหัสสินค้า");
    }
    return updateProduct(Number(id), validateProductInput(payload));
  });

  ipcMain.handle("products:delete", async (_event, id: unknown) => {
    if (!Number.isSafeInteger(Number(id)) || Number(id) <= 0) {
      throw new Error("ไม่พบรหัสสินค้า");
    }
    return deleteProduct(Number(id));
  });

  ipcMain.handle(
    "products:increase-stock-by-barcode",
    async (_event, barcode: unknown, amount: unknown = 1) => {
      const quantity = finiteNumber(amount, "จำนวนที่เพิ่มต้องมากกว่า 0", Number.EPSILON);
      if (!Number.isSafeInteger(quantity)) throw new Error("จำนวนที่เพิ่มต้องเป็นจำนวนเต็ม");
      return increaseStockByBarcode(String(barcode || ""), quantity);
    }
  );
}
