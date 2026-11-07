const { app, BrowserWindow, shell, ipcMain, Notification, Menu } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1240,
    height: 840,
    minWidth: 900,
    minHeight: 650,
    title: 'Kerala Fit — Health, Nutrition & Fitness Management Platform',
    backgroundColor: '#0a0f1d',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
    },
  });

  // Windows Desktop Custom App Menu
  const template = [
    {
      label: 'Kerala Fit',
      submenu: [
        { label: 'About Kerala Fit', click: () => shell.openExternal('https://github.com/sarangsvkm/Kerala-Fit') },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'MyHealthVault',
      submenu: [
        {
          label: 'Open MyHealthVault API Status',
          click: () => shell.openExternal('http://localhost:8080/actuator/health')
        },
        {
          label: 'Open MyHealthVault GitHub',
          click: () => shell.openExternal('https://github.com/sarangsvkm/MyHealthVault')
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  // Check if running in development mode or production built bundle
  const isDev = process.env.ELECTRON_DEV === '1';
  const distPath = path.join(__dirname, '..', 'dist', 'index.html');

  if (isDev) {
    mainWindow.loadURL('http://localhost:8081');
  } else if (fs.existsSync(distPath)) {
    mainWindow.loadFile(distPath);
  } else {
    // If dist doesn't exist yet, try dev server or fallback
    mainWindow.loadURL('http://localhost:8081').catch(() => {
      mainWindow.loadFile(distPath);
    });
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Handle external web links securely
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Native Desktop Notifications
ipcMain.on('notify', (event, { title, message }) => {
  if (Notification.isSupported()) {
    new Notification({
      title: title || 'Kerala Fit',
      body: message || '',
    }).show();
  }
});

// Window controls
ipcMain.on('window-minimize', () => {
  if (mainWindow) mainWindow.minimize();
});
ipcMain.on('window-maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});
ipcMain.on('window-close', () => {
  if (mainWindow) mainWindow.close();
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
