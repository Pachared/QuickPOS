import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("api", {
  getProduct: (barcode: string) =>
    ipcRenderer.invoke("product:getByBarcode", barcode),

  createOrder: (cart: any[]) => ipcRenderer.invoke("order:create", cart),
});
