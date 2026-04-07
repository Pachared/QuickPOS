"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const products_1 = require("./ipc/products");
const orders_1 = require("./ipc/orders");
const settings_1 = require("./ipc/settings");
const customerDisplay_1 = require("./ipc/customerDisplay");
require("./database/sqlite");
let mainWindow = null;
const isDev = !electron_1.app.isPackaged;
const DEV_SERVER_URL = "http://localhost:5173";
function getAppIcon() {
    switch (process.platform) {
        case "win32":
            return path_1.default.resolve(__dirname, "../assets/QuickPOS.ico");
        case "darwin":
            return path_1.default.resolve(__dirname, "../assets/QuickPOS.icns");
        default:
            return path_1.default.resolve(__dirname, "../assets/QuickPOS.png");
    }
}
function createWindow() {
    mainWindow = new electron_1.BrowserWindow({
        width: 1400,
        height: 900,
        icon: getAppIcon(),
        webPreferences: {
            preload: path_1.default.join(__dirname, "preload.js"),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });
    mainWindow.setMenu(null);
    if (isDev) {
        void mainWindow.loadURL(DEV_SERVER_URL);
        mainWindow.webContents.openDevTools();
    }
    else {
        void mainWindow.loadFile(path_1.default.join(__dirname, "../dist/index.html"));
    }
}
electron_1.app.whenReady().then(() => {
    (0, products_1.registerProductIpc)();
    (0, orders_1.registerOrderIpc)();
    (0, settings_1.registerSettingsIpc)();
    (0, customerDisplay_1.registerCustomerDisplayIpc)();
    createWindow();
    electron_1.app.on("activate", () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0)
            createWindow();
    });
});
electron_1.app.on("window-all-closed", () => {
    if (process.platform !== "darwin")
        electron_1.app.quit();
});
