"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld("pos", {
    listProducts: () => electron_1.ipcRenderer.invoke("products:list"),
    createProduct: (payload) => electron_1.ipcRenderer.invoke("products:create", payload),
    updateProduct: (id, payload) => electron_1.ipcRenderer.invoke("products:update", id, payload),
    deleteProduct: (id) => electron_1.ipcRenderer.invoke("products:delete", id),
    increaseStockByBarcode: (barcode, amount = 1) => electron_1.ipcRenderer.invoke("products:increase-stock-by-barcode", barcode, amount),
});
