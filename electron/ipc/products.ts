import { ipcMain } from "electron";
import {
  createProduct,
  deleteProduct,
  increaseStockByBarcode,
  listProducts,
  updateProduct,
  type ProductInput,
} from "../database/sqlite";

function validateProductInput(payload: any): ProductInput {
  if (!payload || typeof payload !== "object") {
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

  if (Number(payload.price) <= 0) {
    throw new Error("ราคาขายต้องมากกว่า 0");
  }

  if (Number(payload.cost) < 0) {
    throw new Error("ต้นทุนต้องไม่ติดลบ");
  }

  if (Number(payload.stockQty) < 0) {
    throw new Error("จำนวนสินค้าในสต๊อกต้องไม่ติดลบ");
  }

  if (Number(payload.minStock) < 0) {
    throw new Error("สต๊อกขั้นต่ำต้องไม่ติดลบ");
  }

  return {
    barcode: String(payload.barcode),
    sku: String(payload.sku),
    name: String(payload.name),
    category: String(payload.category),
    unit: String(payload.unit),
    price: Number(payload.price),
    cost: Number(payload.cost),
    stockQty: Number(payload.stockQty),
    minStock: Number(payload.minStock),
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

  ipcMain.handle("products:update", async (_event, id: number, payload) => {
    if (!id) {
      throw new Error("ไม่พบรหัสสินค้า");
    }
    return updateProduct(Number(id), validateProductInput(payload));
  });

  ipcMain.handle("products:delete", async (_event, id: number) => {
    if (!id) {
      throw new Error("ไม่พบรหัสสินค้า");
    }
    return deleteProduct(Number(id));
  });

  ipcMain.handle(
    "products:increase-stock-by-barcode",
    async (_event, barcode: string, amount = 1) => {
      return increaseStockByBarcode(String(barcode || ""), Number(amount || 1));
    }
  );
}
