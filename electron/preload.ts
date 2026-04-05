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

  getSettings: () => ipcRenderer.invoke("settings:get"),
  saveSettings: (payload: any) => ipcRenderer.invoke("settings:save", payload),
  resetSettings: () => ipcRenderer.invoke("settings:reset"),

  openCustomerDisplay: (payload: any) =>
    ipcRenderer.invoke("customer-display:open", payload),
  updateCustomerDisplay: (payload: any) =>
    ipcRenderer.invoke("customer-display:update", payload),
  closeCustomerDisplay: () => ipcRenderer.invoke("customer-display:close"),
});