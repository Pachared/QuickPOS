"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCustomerDisplayIpc = registerCustomerDisplayIpc;
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
let customerDisplayWindow = null;
let currentState = null;
function getExternalDisplayBounds() {
    const displays = electron_1.screen.getAllDisplays();
    const primary = electron_1.screen.getPrimaryDisplay();
    const external = displays.find((display) => display.id !== primary.id) ?? primary;
    return external.bounds;
}
function pickExistingPath(paths) {
    for (const filePath of paths) {
        if (fs_1.default.existsSync(filePath)) {
            return filePath;
        }
    }
    return paths[0];
}
function resolveCustomerDisplayHtmlPath() {
    const cwd = process.cwd();
    const appPath = electron_1.app.getAppPath();
    const candidates = [
        path_1.default.join(cwd, "electron", "customer-display.html"),
        path_1.default.join(cwd, "dist-electron", "customer-display.html"),
        path_1.default.join(appPath, "electron", "customer-display.html"),
        path_1.default.join(appPath, "dist-electron", "customer-display.html"),
        path_1.default.join(__dirname, "../customer-display.html"),
    ];
    const resolved = pickExistingPath(candidates);
    console.log("[customer-display] html path =", resolved);
    return resolved;
}
function resolveCustomerDisplayPreloadPath() {
    const cwd = process.cwd();
    const appPath = electron_1.app.getAppPath();
    const candidates = [
        path_1.default.join(cwd, "dist-electron", "customer-display-preload.js"),
        path_1.default.join(appPath, "dist-electron", "customer-display-preload.js"),
        path_1.default.join(__dirname, "../customer-display-preload.js"),
    ];
    const resolved = pickExistingPath(candidates);
    console.log("[customer-display] preload path =", resolved);
    return resolved;
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
            preload: resolveCustomerDisplayPreloadPath(),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });
    const htmlPath = resolveCustomerDisplayHtmlPath();
    void customerDisplayWindow.loadFile(htmlPath);
    customerDisplayWindow.on("closed", () => {
        customerDisplayWindow = null;
    });
    customerDisplayWindow.webContents.once("did-finish-load", () => {
        if (currentState) {
            customerDisplayWindow?.webContents.send("customer-display:state", currentState);
        }
    });
    customerDisplayWindow.webContents.on("did-fail-load", (_event, errorCode, errorDescription, validatedURL) => {
        console.error("[customer-display] did-fail-load", {
            errorCode,
            errorDescription,
            validatedURL,
        });
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
