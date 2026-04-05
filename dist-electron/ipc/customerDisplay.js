"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCustomerDisplayIpc = registerCustomerDisplayIpc;
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
let customerDisplayWindow = null;
let currentState = null;
function getExternalDisplayBounds() {
    const displays = electron_1.screen.getAllDisplays();
    const primary = electron_1.screen.getPrimaryDisplay();
    const external = displays.find((display) => display.id !== primary.id) ?? primary;
    return external.bounds;
}
function createCustomerDisplayWindow() {
    if (customerDisplayWindow && !customerDisplayWindow.isDestroyed()) {
        return customerDisplayWindow;
    }
    const bounds = getExternalDisplayBounds();
    customerDisplayWindow = new electron_1.BrowserWindow({
        x: bounds.x,
        y: bounds.y,
        width: bounds.width,
        height: bounds.height,
        frame: false,
        movable: false,
        resizable: false,
        minimizable: false,
        maximizable: false,
        fullscreen: true,
        autoHideMenuBar: true,
        backgroundColor: "#020617",
        webPreferences: {
            preload: path_1.default.join(__dirname, "../customer-display-preload.js"),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });
    void customerDisplayWindow.loadFile(path_1.default.join(__dirname, "../customer-display.html"));
    customerDisplayWindow.on("closed", () => {
        customerDisplayWindow = null;
    });
    customerDisplayWindow.webContents.once("did-finish-load", () => {
        if (currentState) {
            customerDisplayWindow?.webContents.send("customer-display:state", currentState);
        }
    });
    return customerDisplayWindow;
}
function sendStateToCustomerDisplay(state) {
    currentState = state;
    const win = createCustomerDisplayWindow();
    if (win.webContents.isLoading())
        return;
    win.webContents.send("customer-display:state", state);
}
function registerCustomerDisplayIpc() {
    electron_1.ipcMain.handle("customer-display:open", async (_event, payload) => {
        sendStateToCustomerDisplay(payload);
        return { success: true };
    });
    electron_1.ipcMain.handle("customer-display:update", async (_event, payload) => {
        sendStateToCustomerDisplay(payload);
        return { success: true };
    });
    electron_1.ipcMain.handle("customer-display:close", async () => {
        currentState = null;
        if (customerDisplayWindow && !customerDisplayWindow.isDestroyed()) {
            customerDisplayWindow.close();
            customerDisplayWindow = null;
        }
        return { success: true };
    });
}
