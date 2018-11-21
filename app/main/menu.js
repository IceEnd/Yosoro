import electron from 'electron';
import Oauth2 from './Oauth2';

import oauthConfig from './oauthConfig';

import { editorMode } from './config/shortcuts.json';

const windowParams = {
  alwaysOnTop: true,
  autoHideMenuBar: true,
  webPreferences: {
    nodeIntegration: false,
    webSecurity: false,
  },
};

const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const Menu = electron.Menu;
const MenuItem = electron.MenuItem;

function getMemuTemplete(mainWindow) {
  const menuTemplete = [{
    label: 'File',
    submenu: [{
      label: 'New Note',
      accelerator: 'CmdOrCtrl+N',
      enabled: false,
      // role: 'new file',
      click: () => mainWindow.webContents.send('new-file'),
    }, {
      label: 'New Project',
      accelerator: 'Shift+CmdOrCtrl+N',
      enabled: false,
      // role: 'new project',
      click: () => mainWindow.webContents.send('new-project'),
    }, {
      type: 'separator',
    }, {
      label: 'Save',
      accelerator: 'CmdOrCtrl+S',
      role: 'save',
      enabled: false,
      click: () => mainWindow.webContents.send('save-content'),
    }],
  }, {
    label: 'Edit',
    submenu: [{
      label: 'Undo',
      accelerator: 'CmdOrCtrl+Z',
      role: 'undo',
    }, {
      label: 'Redo',
      accelerator: 'Shift+CmdOrCtrl+Z',
      role: 'redo',
    }, {
      type: 'separator',
    }, {
      label: 'Cut',
      accelerator: 'CmdOrCtrl+X',
      role: 'cut',
    }, {
      label: 'Copy',
      accelerator: 'CmdOrCtrl+C',
      role: 'copy',
    }, {
      label: 'Paste',
      accelerator: 'CmdOrCtrl+V',
      role: 'paste',
    }, {
      label: 'Select All',
      accelerator: 'CmdOrCtrl+A',
      role: 'selectall',
    }],
  }, {
    label: 'Sync',
    submenu: [{
      label: 'One Drive',
      click: async (menuItem, browserWindow) => {
        const oneDriveOAuth = new Oauth2(oauthConfig.oneDrive, windowParams);
        try {
          const code = await Promise.resolve(oneDriveOAuth.getAuthorizationCode({
            // accessType: 'authorization_code',
            response_type: 'code',
            scope: 'user.read files.read files.read.all files.readwrite.all sites.read.all Files.ReadWrite.AppFolder offline_access',
          }));
          browserWindow.webContents.send('onedrive-oauth-code-reply', {
            code,
            success: true,
          });
        } catch (ex) {
          browserWindow.webContents.send('onedrive-oauth-code-reply', {
            success: false,
            error: ex,
          });
        }
      },
    }],
  }];
  const editMenuItems = [];
  for (const item of editorMode) {
    item.click = () => mainWindow.webContents.send('app-switch-edit-mode', item.label.toLocaleLowerCase());
    editMenuItems.push(item);
  }
  menuTemplete.push({
    label: 'View',
    submenu: [
      ...editMenuItems,
    ],
  });
  if (!app.isPackaged) {
    menuTemplete.push({
      label: 'Debugger',
      submenu: [{
        label: 'Reload',
        accelerator: 'CmdOrCtrl+R',
        click: (item, focusedWindow) => {
          if (focusedWindow) {
            // on reload, start fresh and close any old
            // open secondary windows
            if (focusedWindow.id === 1) {
              BrowserWindow.getAllWindows().forEach((win) => {
                if (win.id > 1) {
                  win.close();
                }
              });
            }
            focusedWindow.reload();
          }
        },
      }, {
        label: 'Toggle Full Screen',
        accelerator: (() => {
          if (process.platform === 'darwin') {
            return 'Ctrl+Command+F';
          }
          return 'F11';
        })(),
        click: (item, focusedWindow) => {
          if (focusedWindow) {
            focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
          }
        },
      }, {
        label: 'Toggle Developer Tools',
        accelerator: (() => {
          if (process.platform === 'darwin') {
            return 'Alt+Command+I';
          }
          return 'Ctrl+Shift+I';
        })(),
        click: (item, focusedWindow) => {
          if (focusedWindow) {
            focusedWindow.toggleDevTools();
          }
        },
      }],
    });
  }
  menuTemplete.push({
    label: 'Help',
    role: 'help',
    submenu: [{
      label: 'Learn More',
      click: () => {
        electron.shell.openExternal('https://yosoro.coolecho.net');
      },
    }],
  });

  // mac, linux
  if (process.platform === 'darwin') {
    const name = 'Yosoro';
    menuTemplete.unshift({
      label: name,
      submenu: [{
        label: `About ${name}`,
        role: 'about',
      }, {
        type: 'separator',
      }, {
        label: 'Website',
        click: () => {
          electron.shell.openExternal('https://yosoro.coolecho.net');
        },
      }, {
        type: 'separator',
      }, {
        label: 'Services',
        role: 'services',
        submenu: [],
      }, {
        type: 'separator',
      }, {
        label: `Hide ${name}`,
        accelerator: 'Command+H',
        role: 'hide',
      }, {
        label: 'Hide Others',
        accelerator: 'Command+Alt+H',
        role: 'hideothers',
      }, {
        label: 'Show All',
        role: 'unhide',
      }, {
        type: 'separator',
      }, {
        label: 'Quit',
        accelerator: 'Command+Q',
        click: () => {
          app.quit();
        },
      }],
    });
  }

  return menuTemplete;
}

export function setMenu(mainWindow) {
  const menuTemplete = getMemuTemplete(mainWindow); // 获取菜单栏
  const menu = Menu.buildFromTemplate(menuTemplete);
  Menu.setApplicationMenu(menu);
}

/**
 * @name getExplorerMenuItem
 * @return {object} menu
 */
export function getExplorerMenuItem(mainWindow) {
  const menu = new Menu();
  menu.append(new MenuItem({
    label: 'New Notebook',
    click: () => mainWindow.webContents.send('new-project'),
  }));
  return menu;
}

/**
 * @description 获取项目导航栏项目右键菜单
 *
 * @export
 * @param {any} mainWindow
 * @returns {Array} menu - 项目右键菜单
 */
export function getExplorerProjectItemMenu(mainWindow) {
  const menu = new Menu();
  menu.append(new MenuItem({
    label: 'Rename',
    click: () => mainWindow.webContents.send('rename-project'),
  }));
  menu.append(new MenuItem({
    label: 'Delete',
    click: () => mainWindow.webContents.send('delete-project'),
  }));
  menu.append(new MenuItem({
    type: 'separator',
  }));
  menu.append(new MenuItem({
    label: 'New Notebook',
    click: () => mainWindow.webContents.send('new-project'),
  }));
  menu.append(new MenuItem({
    type: 'separator',
  }));
  menu.append(new MenuItem({
    label: 'Export as',
    submenu: [{
      label: 'Markdown',
      click: () => mainWindow.webContents.send('export-get-notebook-info', 'md'),
    }, {
      label: 'HTML',
      click: () => mainWindow.webContents.send('export-get-notebook-info', 'html'),
    }, {
      label: 'PDF',
      click: () => mainWindow.webContents.send('export-get-notebook-info', 'pdf'),
    }],
  }));
  return menu;
}

/**
 * @description 文件导航栏右键菜单
 *
 * @export
 * @param {any} mainWindow
 * @returns {Object} menu - 菜单
 */
export function getExplorerFileMenuItem(mainWindow) {
  const menu = new Menu();
  menu.append(new MenuItem({
    label: 'New Note',
    click: () => mainWindow.webContents.send('new-file'),
  }));
  return menu;
}

/**
 * @description 获取项目导航栏项目邮件菜单
 *
 * @export
 * @param {any} mainWindow
 * @returns {Array} menu - 项目右键菜单
 */
export function getExplorerFileItemMenu(mainWindow) {
  const menu = new Menu();
  menu.append(new MenuItem({
    label: 'Rename',
    click: () => mainWindow.webContents.send('rename-note'),
  }));
  menu.append(new MenuItem({
    label: 'Delete',
    click: () => mainWindow.webContents.send('delete-note'),
  }));
  menu.append(new MenuItem({
    label: 'Edit description',
    click: () => mainWindow.webContents.send('node-add-desc'),
  }));
  menu.append(new MenuItem({
    type: 'separator',
  }));
  menu.append(new MenuItem({
    label: 'New Note',
    click: () => mainWindow.webContents.send('new-file'),
  }));
  menu.append(new MenuItem({
    type: 'separator',
  }));
  menu.append(new MenuItem({
    type: 'separator',
  }));
  menu.append(new MenuItem({
    label: 'Upload to OneDrive',
    click: () => mainWindow.webContents.send('upload-note-onedrive'),
  }));
  menu.append(new MenuItem({
    type: 'separator',
  }));
  menu.append(new MenuItem({
    label: 'Export as',
    submenu: [{
      label: 'Markdown',
      click: () => mainWindow.webContents.send('export-get-note-info', 'md'),
    }, {
      label: 'HTML',
      click: () => mainWindow.webContents.send('export-get-note-info', 'html'),
    }, {
      label: 'PDF',
      click: () => mainWindow.webContents.send('export-get-note-info', 'pdf'),
    }],
  }));
  menu.append(new MenuItem({
    type: 'separator',
  }));
  menu.append(new MenuItem({
    label: 'Publish to',
    submenu: [{
      label: 'Medium',
      click: () => mainWindow.webContents.send('post-medium'),
    }],
  }));
  return menu;
}
