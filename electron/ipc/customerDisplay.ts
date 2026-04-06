import { app, BrowserWindow, ipcMain, screen } from "electron";
import path from "path";
import fs from "fs";

let customerDisplayWindow: BrowserWindow | null = null;
let currentState: any = null;

function getExternalDisplayBounds() {
  const displays = screen.getAllDisplays();
  const primary = screen.getPrimaryDisplay();
  const external =
    displays.find((display) => display.id !== primary.id) ?? primary;

  return external.bounds;
}

function pickExistingPath(paths: string[]) {
  for (const filePath of paths) {
    if (fs.existsSync(filePath)) {
      return filePath;
    }
  }

  return paths[0];
}

function resolveCustomerDisplayHtmlPath() {
  const cwd = process.cwd();
  const appPath = app.getAppPath();

  const candidates = [
    path.join(cwd, "electron", "customer-display.html"),
    path.join(cwd, "dist-electron", "customer-display.html"),
    path.join(appPath, "electron", "customer-display.html"),
    path.join(appPath, "dist-electron", "customer-display.html"),
    path.join(__dirname, "../customer-display.html"),
  ];

  const resolved = pickExistingPath(candidates);
  console.log("[customer-display] html path =", resolved);
  return resolved;
}

function resolveCustomerDisplayPreloadPath() {
  const cwd = process.cwd();
  const appPath = app.getAppPath();

  const candidates = [
    path.join(cwd, "dist-electron", "customer-display-preload.js"),
    path.join(appPath, "dist-electron", "customer-display-preload.js"),
    path.join(__dirname, "../customer-display-preload.js"),
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

  customerDisplayWindow = new BrowserWindow({
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
      customerDisplayWindow?.webContents.send(
        "customer-display:state",
        currentState
      );
    }
  });

  customerDisplayWindow.webContents.on(
    "did-fail-load",
    (_event, errorCode, errorDescription, validatedURL) => {
      console.error("[customer-display] did-fail-load", {
        errorCode,
        errorDescription,
        validatedURL,
      });
    }
  );

  return customerDisplayWindow;
}

function sendStateToCustomerDisplay(state: any) {
  currentState = state;

  const win = createCustomerDisplayWindow();

  if (win.webContents.isLoading()) return;

  win.webContents.send("customer-display:state", state);
}

export function registerCustomerDisplayIpc() {
  ipcMain.handle("customer-display:open", async (_event, payload) => {
    sendStateToCustomerDisplay(payload);
    return { success: true };
  });

  ipcMain.handle("customer-display:update", async (_event, payload) => {
    sendStateToCustomerDisplay(payload);
    return { success: true };
  });

  ipcMain.handle("customer-display:close", async () => {
    currentState = null;

    if (customerDisplayWindow && !customerDisplayWindow.isDestroyed()) {
      customerDisplayWindow.close();
      customerDisplayWindow = null;
    }

    return { success: true };
  });
}