import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("customerDisplay", {
  onStateChange: (callback: (payload: any) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, payload: any) => {
      callback(payload);
    };

    ipcRenderer.on("customer-display:state", listener);

    return () => {
      ipcRenderer.removeListener("customer-display:state", listener);
    };
  },
});