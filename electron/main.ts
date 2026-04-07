import { app, BrowserWindow } from "electron";
import path from "path";
import { registerProductIpc } from "./ipc/products";
import { registerOrderIpc } from "./ipc/orders";
import { registerSettingsIpc } from "./ipc/settings";
import { registerCustomerDisplayIpc } from "./ipc/customerDisplay";
import "./database/sqlite";

let mainWindow: BrowserWindow | null = null;

const isDev = !app.isPackaged;
const DEV_SERVER_URL = "http://localhost:5173";

function getAppIcon() {
  switch (process.platform) {
    case "win32":
      return path.resolve(__dirname, "../assets/QuickPOS.ico");
    case "darwin":
      return path.resolve(__dirname, "../assets/QuickPOS.icns");
    default:
      return path.resolve(__dirname, "../assets/QuickPOS.png");
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    icon: getAppIcon(),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.setMenu(null);

  if (isDev) {
    void mainWindow.loadURL(DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    void mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }
}

app.whenReady().then(() => {
  registerProductIpc();
  registerOrderIpc();
  registerSettingsIpc();
  registerCustomerDisplayIpc();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});