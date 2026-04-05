"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld("customerDisplay", {
    onStateChange: (callback) => {
        const listener = (_event, payload) => {
            callback(payload);
        };
        electron_1.ipcRenderer.on("customer-display:state", listener);
        return () => {
            electron_1.ipcRenderer.removeListener("customer-display:state", listener);
        };
    },
});
