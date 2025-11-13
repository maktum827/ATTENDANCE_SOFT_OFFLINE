/* eslint global-require: off, no-console: off, promise/always-return: off */
import path from 'path';
import fs from 'fs';
import {
  app,
  BrowserWindow,
  shell,
  ipcMain,
  protocol,
  net,
  screen,
} from 'electron';
// import log from 'electron-log';
import installExtension, { REDUX_DEVTOOLS } from 'electron-devtools-installer';
import dotenv from 'dotenv';
import { ChildProcess, exec, spawn } from 'child_process';
import http from 'http';
import server from '../../backend/server';
import { resolveHtmlPath } from './util';

dotenv.config();

// flask server
let flaskProcess: ChildProcess | null = null;

function startFlaskServer() {
  const flaskPort = 4009;

  const checkServerRunning = (): Promise<boolean> => {
    return new Promise((resolve) => {
      const req = http.get(`http://127.0.0.1:${flaskPort}/health`, (res) => {
        resolve(res.statusCode === 200);
      });
      req.on('error', () => resolve(false));
      req.end();
    });
  };

  const launchServer = () => {
    const serverPath = app.isPackaged
      ? path.join(process.resourcesPath, 'zk_server.exe')
      : path.join(__dirname, '../../flask_server/zk_server.py');

    const isWindows = process.platform === 'win32';

    if (app.isPackaged) {
      flaskProcess = spawn(serverPath, [], {
        detached: false,
        windowsHide: true,
        stdio: 'ignore',
      });
    } else {
      const pythonCmd = isWindows ? 'python' : 'python3';
      flaskProcess = spawn(pythonCmd, [serverPath], {
        stdio: 'inherit',
      });
    }

    flaskProcess.unref();
    console.log('✅ Flask server started.');
  };

  checkServerRunning().then((isRunning) => {
    if (isRunning) {
      console.log('⚙️ Flask server already running.');
    } else {
      console.log('🚀 Starting Flask server...');
      launchServer();
    }
  });
}

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});

ipcMain.on('restart-app', () => {
  app.quit();
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload,
    )
    .catch(console.log);
};

let mainWindow: BrowserWindow | null = null;

const createWindow = async () => {
  server();
  // startFlaskServer();
  // if (!flaskProcess || flaskProcess.killed) {
  //   startFlaskServer();
  // }

  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  const UPLOADS_PATH = path.join(
    app.getPath('home'),
    'AppData',
    'Roaming',
    'Tanzim',
    'uploads',
  );

  const getPublicPath = (...paths: string[]): string => {
    return path.join(UPLOADS_PATH, ...paths);
  };

  // Handle the custom protocol for loading assets
  protocol.handle('local', (request) => {
    const url = request.url.replace('local://', '');
    const filePath = getPublicPath(url);
    return net.fetch(`file://${filePath}`);
  });

  protocol.handle('static', (request) => {
    const url = request.url.replace('static://', '');
    const filePath = getAssetPath(url);
    return net.fetch(`file://${filePath}`);
  });

  ipcMain.handle('get-id-backgrounds', () =>
    fs.readdirSync(getAssetPath('images/samples1')).map((file, index) => ({
      id: index + 1,
      src: `static://images/samples1/${file}`,
    })),
  );

  // Get the primary display's screen size
  const { width, height } = screen.getPrimaryDisplay().workAreaSize; // This gives the available screen size
  mainWindow = new BrowserWindow({
    show: false,
    width,
    height,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
    autoHideMenuBar: true, // Hide the default menu bar
    frame: true, // Keep window frame for minimize/maximize/close buttons
  });

  // for redux extension
  await installExtension(REDUX_DEVTOOLS);

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.once('ready-to-show', () => {
    if (!mainWindow) throw new Error('"mainWindow" is not defined');
    mainWindow.maximize();
    mainWindow.show();
    mainWindow.focus();
  });

  // mainWindow.on('ready-to-show', () => {
  //   if (!mainWindow) {
  //     throw new Error('"mainWindow" is not defined');
  //   }
  //   if (process.env.START_MINIMIZED) {
  //     mainWindow.minimize();
  //   } else {
  //     mainWindow.show();
  //   }
  // });

  mainWindow.on('closed', () => {
    flaskProcess = null;
    mainWindow = null;
  });

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });
};

function cleanUpFlaskProcess() {
  if (flaskProcess && !flaskProcess.killed) {
    console.log('Cleaning up Flask process...');
    if (process.platform === 'win32') {
      exec(`taskkill /pid ${flaskProcess.pid} /f /t`, (err) => {
        if (err) {
          console.error(`Error terminating Flask process: ${err}`);
        } else {
          console.log(`Flask process ${flaskProcess?.pid} terminated.`);
        }
      });
    } else {
      flaskProcess.kill('SIGTERM');
      console.log('Flask process killed with SIGTERM');
    }
    flaskProcess = null;
  }
}

app.on('before-quit', () => {
  cleanUpFlaskProcess();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit(); // Triggers 'before-quit'
  }
});

process.on('exit', () => {
  cleanUpFlaskProcess(); // Extra safety
});

process.on('SIGINT', () => {
  cleanUpFlaskProcess();
  process.exit();
});

process.on('SIGTERM', () => {
  cleanUpFlaskProcess();
  process.exit();
});

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
