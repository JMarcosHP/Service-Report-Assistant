const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

let mainWindow = null;

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // Open the DevTools in development mode
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

// IPC handler for saving data
ipcMain.handle('save-data', async (event, data) => {
  try {
    const { filePath } = await dialog.showSaveDialog({
      title: 'Guardar datos de la congregación',
      defaultPath: path.join(app.getPath('documents'), 'congregation-data.json'),
      filters: [
        { name: 'JSON', extensions: ['json'] }
      ]
    });
    
    if (filePath) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      return { success: true, path: filePath };
    }
    return { success: false, message: 'Operación cancelada' };
  } catch (error) {
    return { success: false, message: error.message };
  }
});

// IPC handler for loading data
ipcMain.handle('load-data', async () => {
  try {
    const { filePaths } = await dialog.showOpenDialog({
      title: 'Cargar datos de la congregación',
      defaultPath: app.getPath('documents'),
      filters: [
        { name: 'JSON', extensions: ['json'] }
      ],
      properties: ['openFile']
    });
    
    if (filePaths && filePaths.length > 0) {
      const data = JSON.parse(fs.readFileSync(filePaths[0], 'utf8'));
      return { success: true, data };
    }
    return { success: false, message: 'Operación cancelada' };
  } catch (error) {
    return { success: false, message: error.message };
  }
});

// IPC handler for exporting to PDF
ipcMain.handle('export-pdf', async (event, options) => {
  try {
    const { filePath } = await dialog.showSaveDialog({
      title: 'Exportar a PDF',
      defaultPath: path.join(app.getPath('documents'), `grupo-${options.group || 'todos'}.pdf`),
      filters: [
        { name: 'PDF', extensions: ['pdf'] }
      ]
    });
    
    if (filePath) {
      // Here you would implement PDF generation logic
      // For now, we'll just return a success message
      return { success: true, path: filePath };
    }
    return { success: false, message: 'Operación cancelada' };
  } catch (error) {
    return { success: false, message: error.message };
  }
});