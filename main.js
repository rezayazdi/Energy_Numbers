const { app, BrowserWindow, dialog, ipcMain, clipboard } = require("electron");
const fs = require("fs");
const path = require("path");

function withExt(filePath, ext) {
  return filePath.toLowerCase().endsWith("." + ext) ? filePath : filePath + "." + ext;
}

function backupPath() {
  return path.join(app.getPath("userData"), "contacts-backup.json");
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1100,
    height: 780,
    minWidth: 900,
    minHeight: 700,
    autoHideMenuBar: true,
    title: "شماره ها | رستوران انرژی",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });
  win.loadFile(path.join(__dirname, "index.html"));
}

ipcMain.on("backup-save", (event, data) => {
  try {
    fs.writeFileSync(backupPath(), JSON.stringify(data), "utf8");
    event.returnValue = true;
  } catch {
    event.returnValue = false;
  }
});

ipcMain.on("backup-load", (event) => {
  try {
    const file = backupPath();
    if (!fs.existsSync(file)) {
      event.returnValue = null;
      return;
    }
    const data = JSON.parse(fs.readFileSync(file, "utf8"));
    event.returnValue = Array.isArray(data) ? data : null;
  } catch {
    event.returnValue = null;
  }
});

ipcMain.on("clipboard-read", (event) => {
  try {
    event.returnValue = clipboard.readText() || "";
  } catch {
    event.returnValue = "";
  }
});

ipcMain.handle("save-file", async (event, payload) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  const ext = String(payload.ext || "txt").replace(/^\./, "");
  const filename = path.basename(String(payload.filename || "export." + ext));
  const { canceled, filePath } = await dialog.showSaveDialog(win, {
    defaultPath: filename,
    filters: [{ name: String(payload.filterName || ext), extensions: [ext] }],
  });
  if (canceled || !filePath) return false;
  fs.writeFileSync(withExt(filePath, ext), Buffer.from(payload.bytes));
  return true;
});

ipcMain.handle("save-pdf", async (event, filename) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  const { canceled, filePath } = await dialog.showSaveDialog(win, {
    defaultPath: path.basename(String(filename || "شماره-ها.pdf")),
    filters: [{ name: "PDF", extensions: ["pdf"] }],
  });
  if (canceled || !filePath) return false;
  const data = await win.webContents.printToPDF({
    printBackground: true,
    pageSize: "A4",
  });
  fs.writeFileSync(withExt(filePath, "pdf"), data);
  return true;
});

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
