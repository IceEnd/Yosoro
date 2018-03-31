import electron from 'electron';
import path from 'path';
import url from 'url';
import fs from 'fs';
import { setMenu, getExplorerMenuItem, getExplorerFileMenuItem, getExplorerProjectItemMenu, getExplorerFileItemMenu } from './menu';
import eventListener from './event';

const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const ipcMain = electron.ipcMain;
// const Menu = electron.Menu;
// const Tray = electron.Tray;
const dialog = electron.dialog;
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
    'dev:electron-main',
    path.join(__dirname, './'),
  );
}

function createWindow() {
  // Create the browser window.
  const options = {
    title: 'Yosoro',
    width: 1180,
    height: 786,
    minWidth: 1180,
    minHeight: 600,
    titleBarStyle: 'hiddenInset',
    frame: true,
    backgroundColor: 'ransparent',
  };
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
    ipcMain.removeAllListeners('show-context-menu-explorer');
    ipcMain.removeAllListeners('show-context-menu-project-item');
    ipcMain.removeAllListeners('show-context-menu-explorer-file');
    ipcMain.removeAllListeners('show-context-menu-file-item');
  });

  // 监听 新建 消息
  ipcMain.on('new-file', (event) => {
    event.sender.send('new-file');
  });

  // 监听新建项目指令
  ipcMain.on('new-project', (event) => {
    event.sender.send('new-project');
  });

  ipcMain.on('open-file-dialog', (event) => {
    dialog.showOpenDialog({
      properties: ['openFile', 'openDirectory'],
    }, (files) => {
      if (files) {
        event.sender.send('selected-directory', files);
      }
    });
  });

  // 配置插件
  if (process.env.NODE_ENV === 'development') {
    require('devtron').install();
    const CONFIG = require('../../config/devconfig.json');
    const extensions = CONFIG.extensions;
    for (let i = 0; i < extensions.length; i++) {
      BrowserWindow.addDevToolsExtension(extensions[i]);
    }
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
