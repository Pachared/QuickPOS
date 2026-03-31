import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("pos", {
  listProducts: () => ipcRenderer.invoke("products:list"),
  createProduct: (payload: any) =>
    ipcRenderer.invoke("products:create", payload),
  updateProduct: (id: number, payload: any) =>
    ipcRenderer.invoke("products:update", id, payload),
  deleteProduct: (id: number) => ipcRenderer.invoke("products:delete", id),
  increaseStockByBarcode: (barcode: string, amount = 1) =>
    ipcRenderer.invoke("products:increase-stock-by-barcode", barcode, amount),

  listOrders: () => ipcRenderer.invoke("orders:list"),
  createOrder: (payload: any) => ipcRenderer.invoke("orders:create", payload),
});