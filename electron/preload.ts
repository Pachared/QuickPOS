import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("api", {
  getProducts: () => ipcRenderer.invoke("products:getAll"),

  getProduct: (barcode: string) =>
    ipcRenderer.invoke("product:getByBarcode", barcode),

  createOrder: (cart: any[]) =>
    ipcRenderer.invoke("order:create", cart),
});
