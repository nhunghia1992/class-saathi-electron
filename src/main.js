import { app, BrowserWindow, ipcMain, protocol, net } from 'electron';
import started from 'electron-squirrel-startup';
import { SerialPort } from 'serialport';
import path from 'node:path';
import fs from 'node:fs'
import url from 'node:url'
import mime from 'mime'

let serialPort;
let mainWindow;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: false
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  setupSerialportIPC();
  setupSaveFile();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
function setupSerialportIPC() {
  ipcMain.on('serialport', (event, args) => {
    if (!args?.type) return;

    console.log(args.type)
    switch (args.type) {
      case 'open':
        if (serialPort?.isOpen) return;

        // Customize the port path and settings to match your clicker device
        serialPort = new SerialPort({
          path: 'COM3', // Change to correct port
          baudRate: 9600,
          autoOpen: false,
        });

        serialPort.open((err) => {
          if (err) {
            console.error('SerialPort Open Error:', err.message);
            mainWindow.webContents.send('serialport', { type: 'error', payload: err.message });
            return;
          }
          console.log('SerialPort opened');
          mainWindow.webContents.send('serialport', { type: 'opened' });

          serialPort.on('data', (data) => {
            console.log('Serial data received:', data);
            mainWindow.webContents.send('serialport', {
              type: 'data',
              payload: data,
            });
          });

        });

        serialPort.on('close', () => {
          console.log('SerialPort closed');
          mainWindow.webContents.send('serialport', { type: 'closed' });
        });

        serialPort.on('error', (err) => {
          console.error('SerialPort Error:', err);
          mainWindow.webContents.send('serialport', { type: 'error', payload: err.message });
        });

        break;

      case 'write':
        if (serialPort?.isOpen && args.payload) {
          const buffer = Buffer.from(args.payload);
          serialPort.write(buffer, (err) => {
            if (err) {
              console.error('Write error:', err.message);
              mainWindow.webContents.send('serialport', { type: 'error', payload: err.message });
            }
          });
        }
        break;

      case 'close':
        if (serialPort?.isOpen) {
          serialPort.close();
        }
        break;
    }
  });
}

function setupSaveFile() {
  ipcMain.handle('save-file', async (_, buffer, filename) => {
    const savePath = path.join(app.getPath('userData'), 'uploads');
    if (!fs.existsSync(savePath)) fs.mkdirSync(savePath);
    const fullPath = path.join(savePath, filename);
    fs.writeFileSync(fullPath, Buffer.from(buffer));
    return `file://${fullPath}`;
  });
}