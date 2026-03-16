"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld("api", {
    getProduct: (barcode) => electron_1.ipcRenderer.invoke("product:getByBarcode", barcode),
    createOrder: (cart) => electron_1.ipcRenderer.invoke("order:create", cart),
});
