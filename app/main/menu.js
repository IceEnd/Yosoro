import electron from 'electron';
import electronOauth2 from './electron-oauth2';

import oauthConfig from './oauthConfig';

const windowParams = {
  alwaysOnTop: true,
  autoHideMenuBar: true,
  webPreferences: {
    nodeIntegration: false,
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
      accelerator: 'CmdOrCtrl+Z',
      role: 'new file',
      click: () => mainWindow.webContents.send('new-file', 1),
    }, {
      label: 'New Project',
      asselerator: 'cmd+Shift+N',
      role: 'New Project',
      click: () => mainWindow.webContents.send('new-project'),
    }, {
      type: 'separator',
    }, {
      label: 'Save',
      accelerator: 'CmdOrCtrl+S',
      role: 'save',
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
    label: 'Auth',
    submenu: [{
      label: 'One Driver',
      click: async (menuItem, browserWindow) => {
        const oneDriverOAuth = electronOauth2(oauthConfig.oneDriver, windowParams);
        try {
          const code = await Promise.resolve(oneDriverOAuth.getAuthorizationCode({
            // accessType: 'authorization_code',
            response_type: 'code',
            scope: 'user.read files.read files.read.all files.readwrite.all sites.read.all Files.ReadWrite.AppFolder offline_access',
          }));
          browserWindow.webContents.send('onedriver-oauth-code-reply', {
            code,
            success: true,
          });
        } catch (ex) {
          browserWindow.webContents.send('onedriver-oauth-code-reply', {
            success: false,
            error: ex,
          });
        }
      },
    }],
  }];
  if (process.env.NODE_ENV === 'development') {
    menuTemplete.push({
      label: 'View',
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
      }, {
        type: 'separator',
      }, {
        label: 'App Menu Demo',
        click: (item, focusedWindow) => {
          if (focusedWindow) {
            const options = {
              type: 'info',
              title: 'Application Menu Demo',
              buttons: ['Ok'],
              message: 'This demo is for the Menu section, showing how to create a clickable menu item in the application menu.',
            };
            electron.dialog.showMessageBox(focusedWindow, options);
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
        electron.shell.openExternal('https://github.com/IceEnd/Yosoro');
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
    // Window menu.
    // menuTemplete[3].submenu.push({
    //   type: 'separator',
    // }, {
    //   label: 'Bring All to Front',
    //   role: 'front',
    // });
  }

  // if (process.platform === 'win32') {
  //   const helpMenu = menuTemplete[menuTemplete.length - 1].submenu;
  // }

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
  // menu.append(new MenuItem({
  //   label: 'New Note',
  // }));
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
    label: 'Upload to OneDriver',
    click: () => mainWindow.webContents.send('upload-note-onedriver'),
  }));
  return menu;
}
