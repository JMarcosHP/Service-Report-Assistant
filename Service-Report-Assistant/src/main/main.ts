import { app, BrowserWindow } from 'electron';
import path from 'path';

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.ts'),
      contextIsolation: true,
      enableRemoteModule: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

  // Open the DevTools (optional)
  // mainWindow.webContents.openDevTools();
};

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});