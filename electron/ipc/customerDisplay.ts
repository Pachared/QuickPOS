import { BrowserWindow, ipcMain, screen } from "electron";
import path from "path";

let customerDisplayWindow: BrowserWindow | null = null;
let currentState: any = null;

function getExternalDisplayBounds() {
  const displays = screen.getAllDisplays();
  const primary = screen.getPrimaryDisplay();

  const external =
    displays.find((display) => display.id !== primary.id) ?? primary;

  return external.bounds;
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
      preload: path.join(__dirname, "../customer-display-preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  void customerDisplayWindow.loadFile(
    path.join(__dirname, "../customer-display.html")
  );

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
