import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("pos", {
  listProducts: () => ipcRenderer.invoke("products:list"),
  createProduct: (payload: unknown) =>
    ipcRenderer.invoke("products:create", payload),
  updateProduct: (id: number, payload: unknown) =>
    ipcRenderer.invoke("products:update", id, payload),
  deleteProduct: (id: number) => ipcRenderer.invoke("products:delete", id),
  increaseStockByBarcode: (barcode: string, amount = 1) =>
    ipcRenderer.invoke("products:increase-stock-by-barcode", barcode, amount),

  listOrders: () => ipcRenderer.invoke("orders:list"),
  createOrder: (payload: unknown) => ipcRenderer.invoke("orders:create", payload),

  getSettings: () => ipcRenderer.invoke("settings:get"),
  saveSettings: (payload: unknown) => ipcRenderer.invoke("settings:save", payload),
  resetSettings: () => ipcRenderer.invoke("settings:reset"),

  openCustomerDisplay: (payload: unknown) =>
    ipcRenderer.invoke("customer-display:open", payload),
  updateCustomerDisplay: (payload: unknown) =>
    ipcRenderer.invoke("customer-display:update", payload),
  closeCustomerDisplay: () => ipcRenderer.invoke("customer-display:close"),
});
