const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("energy", {
  saveFile: (payload) => ipcRenderer.invoke("save-file", payload),
  savePdf: (filename) => ipcRenderer.invoke("save-pdf", filename),
  saveBackup: (data) => ipcRenderer.sendSync("backup-save", data),
  loadBackup: () => ipcRenderer.sendSync("backup-load"),
  readClipboard: () => ipcRenderer.sendSync("clipboard-read"),
});
