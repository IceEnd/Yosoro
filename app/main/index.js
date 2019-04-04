import electron from 'electron';
import path from 'path';
import url from 'url';
import ChildProcess from 'child_process';
import { setMenu, getExplorerMenuItem, getExplorerFileMenuItem, getExplorerProjectItemMenu, getExplorerFileItemMenu } from './menu';
import { removeEventListeners, eventListener } from './event';
import schedule from './schedule';
import * as appPaths from './paths';
import pkg from '../../package.json';

const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const shell = electron.shell;

app.setName('Yosoro');

function handleSquirrelEvent() {
  if (process.argv.length === 1) {
    return false;
  }

  const appFolder = path.resolve(process.execPath, '..');
  const rootAtomFolder = path.resolve(appFolder, '..');
  const updateDotExe = path.resolve(path.join(rootAtomFolder, 'Update.exe'));
  const exeName = path.basename(process.execPath);

  const spawn = (command, args) => {
    let spawnedProcess;
    try {
      spawnedProcess = ChildProcess.spawn(command, args, { detached: true });
    } catch (error) {
      console.warn(error);
    }

    return spawnedProcess;
  };

  const spawnUpdate = args => spawn(updateDotExe, args);
  const squirrelEvent = process.argv[1];
  switch (squirrelEvent) {
    case '--squirrel-install':
    case '--squirrel-updated': {
      // Install desktop and start menu shortcuts
      spawnUpdate(['--createShortcut', exeName]);
      setTimeout(app.quit, 1000);
      return true;
    }
    case '--squirrel-uninstall': {
      spawnUpdate(['--removeShortcut', exeName]);
      setTimeout(app.quit, 1000);
      return true;
    }
    case '--squirrel-obsolete': {
      app.quit();
      return true;
    }
    default:
      return true;
  }
}

// this should be placed at top of main.js to handle setup events quickly
if (process.platform === 'win32' && handleSquirrelEvent() && process.env.NODE_ENV === 'production') {
  if (handleSquirrelEvent()) {
    app.quit();
  }
}

if (process.platform === 'win32') {
  app.setAppUserModelId(pkg.build.appId);
}

let mainWindow;

appPaths.initWorkSpace();

if (process.env.NODE_ENV === 'development') {
  require('electron-watch')(
    __dirname,
    'dev:main',
    process.cwd(),
  );
}

function createWindow() {
  // Create the browser window.
  const options = {
    title: 'Yosoro',
    width: 1200,
    height: 786,
    minWidth: 1200,
    minHeight: 600,
    titleBarStyle: 'default',
  };
  if (process.platform === 'linux') {
    options.icon = path.join(__dirname, './resource/app.png');
  }
  if (process.platform === 'darwin') {
    options.transparent = true;
    options.frame = true;
    // options.titleBarStyle = 'hiddenInset';
    options.titleBarStyle = 'hidden';
  }
  mainWindow = new BrowserWindow(options);
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.setTitle('Yosoro');

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, './index.html'),
    hash: 'note',
    protocol: 'file:',
    slashes: true,
  }, {
    userAgent: 'Yosoro',
  }));

  // 设置菜单
  setMenu(mainWindow);

  const explorerMenu = getExplorerMenuItem(mainWindow);
  const exploereFileMenu = getExplorerFileMenuItem(mainWindow);
  const projectItemMenu = getExplorerProjectItemMenu(mainWindow);
  const fileItemMenu = getExplorerFileItemMenu(mainWindow);

  eventListener({
    explorerMenu,
    exploereFileMenu,
    projectItemMenu,
    fileItemMenu,
  });

  const webContents = mainWindow.webContents;

  webContents.on('will-navigate', (e, linkUrl) => {
    e.preventDefault();
    shell.openExternal(linkUrl);
  });

  // Emitted when the window is closed.
  mainWindow.on('close', () => {
    mainWindow = null;
    try {
      removeEventListeners();
    } catch (err) {
      // err
    }
  });

  // 配置插件
  if (process.env.NODE_ENV === 'development') {
    require('devtron').install();
    /* eslint-disable import/no-unresolved */
    const CONFIG = require('../../config/devconfig.json');
    const extensions = CONFIG.extensions;
    for (const ex of extensions) {
      BrowserWindow.addDevToolsExtension(ex);
    }
    /* eslint-enable */
  }
}

// 只允许单个实例运行
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }
      mainWindow.focus();
    }
  });

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on('ready', createWindow);
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  app.quit();
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

app.on('before-quit', () => {
  // 退出应用关闭定时器
  schedule.cancelReleases();
});
