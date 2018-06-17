import electron from 'electron';
import path from 'path';
import url from 'url';
import fs from 'fs';
import { setMenu, getExplorerMenuItem, getExplorerFileMenuItem, getExplorerProjectItemMenu, getExplorerFileItemMenu } from './menu';
import { removeEventListeners, eventListener } from './event';
import schedule from './schedule';

const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
// const ipcMain = electron.ipcMain;
// const Menu = electron.Menu;
// const Tray = electron.Tray;
// const dialog = electron.dialog;
const shell = electron.shell;

app.setName('Yosoro');

let mainWindow;
// let tray = null;

const dataPath = app.getPath('appData');
let appDataPath = `${dataPath}/Yosoro`;
if (process.env.NODE_ENV === 'development') {
  appDataPath += 'Test';
}
const documentsPath = `${appDataPath}/documents`;
const projectsPath = `${appDataPath}/documents/projects`;
const trashPath = `${appDataPath}/documents/trash`;

function createInitWorkSpace() {
  if (!fs.existsSync(appDataPath)) {
    fs.mkdirSync(appDataPath);
  }
  if (!fs.existsSync(documentsPath)) {
    fs.mkdirSync(documentsPath);
  }
  if (!fs.existsSync(projectsPath)) {
    fs.mkdirSync(projectsPath);
  }
  if (!fs.existsSync(trashPath)) {
    fs.mkdirSync(trashPath);
  }
}

createInitWorkSpace();

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
    options.titleBarStyle = 'hiddenInset';
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

  // Tray模块
  // const iconPath = path.join(__dirname, './resource/tray-icon.png');
  // tray = new Tray(iconPath);
  // const contextMenu = Menu.buildFromTemplate([{
  //   label: 'Tray',
  // }]);
  // tray.setToolTip('This is my yosoyo-dektop.');
  // tray.setContextMenu(contextMenu);

  const webContents = mainWindow.webContents;

  webContents.on('will-navigate', (e, linkUrl) => {
    e.preventDefault();
    shell.openExternal(linkUrl);
  });

  // Emitted when the window is closed.
  mainWindow.on('close', () => {
    mainWindow = null;
    removeEventListeners();
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

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  // if (tray) {
  //   tray.destroy();
  // }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// app.on('browser-window-created', (event, win) => {
//   win.webContents.on('context-menu', (e, params) => {
//     explorerMenu.popup(win, params.x, params.y)
//   });
// });

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

app.on('before-quit', () => {
  // 推出应用关闭定时器
  schedule.cancelReleases();
});
