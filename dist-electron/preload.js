"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld("pos", {
    listProducts: () => electron_1.ipcRenderer.invoke("products:list"),
    createProduct: (payload) => electron_1.ipcRenderer.invoke("products:create", payload),
    updateProduct: (id, payload) => electron_1.ipcRenderer.invoke("products:update", id, payload),
    deleteProduct: (id) => electron_1.ipcRenderer.invoke("products:delete", id),
    increaseStockByBarcode: (barcode, amount = 1) => electron_1.ipcRenderer.invoke("products:increase-stock-by-barcode", barcode, amount),
    listOrders: () => electron_1.ipcRenderer.invoke("orders:list"),
    createOrder: (payload) => electron_1.ipcRenderer.invoke("orders:create", payload),
    getSettings: () => electron_1.ipcRenderer.invoke("settings:get"),
    saveSettings: (payload) => electron_1.ipcRenderer.invoke("settings:save", payload),
    resetSettings: () => electron_1.ipcRenderer.invoke("settings:reset"),
    openCustomerDisplay: (payload) => electron_1.ipcRenderer.invoke("customer-display:open", payload),
    updateCustomerDisplay: (payload) => electron_1.ipcRenderer.invoke("customer-display:update", payload),
    closeCustomerDisplay: () => electron_1.ipcRenderer.invoke("customer-display:close"),
});
