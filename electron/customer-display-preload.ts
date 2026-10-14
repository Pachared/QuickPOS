import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("customerDisplay", {
  onStateChange: (callback: (payload: unknown) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, payload: unknown) => {
      callback(payload);
    };

    ipcRenderer.on("customer-display:state", listener);

    return () => {
      ipcRenderer.removeListener("customer-display:state", listener);
    };
  },
});
