/**
 * @description menus events
 * @Channel MENUS:
 */

import { BrowserWindow, Menu } from 'electron';
import Event from './event';

export default class Menus extends Event {
  eventSet = new Set([
    'show-context-menu-explorer',
    'show-context-menu-project-item',
    'show-context-menu-explorer-file',
    'show-context-menu-file-item',
    'file-new-enbaled',
  ]);

  constructor(ctx = {}) {
    super(ctx);
    this.name = 'MENU';
  }

  setListeners() {
    // 监听Explorer导航右键事件
    this.listener('show-context-menu-explorer', (event) => {
      const win = BrowserWindow.fromWebContents(event.sender);
      this.ctx.explorerMenu.popup(win);
    });

    // 项目右键菜单
    this.listener('show-context-menu-project-item', (event) => {
      const win = BrowserWindow.fromWebContents(event.sender);
      this.ctx.projectItemMenu.popup(win);
    });

    // 监听File Explorer导航右键事件
    this.listener('show-context-menu-explorer-file', (event) => {
      const win = BrowserWindow.fromWebContents(event.sender);
      this.ctx.exploereFileMenu.popup(win);
    });

    this.listener('show-context-menu-file-item', (event) => {
      const win = BrowserWindow.fromWebContents(event.sender);
      this.ctx.fileItemMenu.popup(win);
    });

    // 启用 | 启用 菜单 `new -> file`
    this.listener('file-new-enbaled', (event, args) => {
      const { flag, type } = args;
      let index = 0;
      let saveFlag = false;
      let itemIndex = 0;
      if (type === 'new-note') {
        index = 0;
        saveFlag = true;
      } else if (type === 'new-project') {
        index = 1;
      } else if (type === 'save') {
        index = 2;
      }
      if (process.platform === 'darwin') {
        itemIndex = 1;
      } else {
        itemIndex = 0;
      }
      const menu = Menu.getApplicationMenu();
      try {
        if (menu) {
          menu.items[itemIndex].submenu.items[index].enabled = flag;
          if (saveFlag) {
            menu.items[itemIndex].submenu.items[3].enabled = flag;
          }
        }
        Menu.setApplicationMenu(menu);
      } catch (ex) {
        console.warn(ex);
      }
    });
  }
}

