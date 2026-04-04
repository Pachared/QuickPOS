import { app, BrowserWindow } from "electron";
import path from "path";
import { registerProductIpc } from "./ipc/products";
import { registerOrderIpc } from "./ipc/orders";
import { registerSettingsIpc } from "./ipc/settings";
import "./database/sqlite";

let mainWindow: BrowserWindow | null = null;

const isDev = !app.isPackaged;
const DEV_SERVER_URL = "http://localhost:5173";

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    icon: path.join(__dirname, "../assets/QuickPOS.png"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

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
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
