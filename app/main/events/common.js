/**
 * @channel COMMON:
*/

import url from 'url';
import path from 'path';
import fs from 'fs';
import { Menu } from 'electron';
import { PROFILE_PATH } from '../paths';
import Event from './event';

import { editorMode } from '../config/shortcuts.json';

export default class Common extends Event {
  eventSet = new Set([
    'get-webview-path',
    'save-user-avatar',
    'get-local-avatar',
    'get-docuemnts-save-path',
    'app-switch-edit-mode',
  ]);

  constructor(ctx) {
    super(ctx);
    this.name = 'COMMON';
  }

  setListeners() {
    this.listener('get-webview-path', (event) => {
      event.returnValue = url.format({
        pathname: path.join(__dirname, './webview/webview.html'),
        protocol: 'file:',
      });
    });

    // 将用户头像保存到 应用数据文件夹/profile
    this.listener('save-user-avatar', (event, args) => {
      const data = args.replace(/^data:image\/\w+;base64,/, '');
      const avatar = `${PROFILE_PATH}/avatar.png`;
      try {
        fs.writeFileSync(avatar, data, { encoding: 'base64' });
        event.returnValue = {
          url: `file://${avatar}`,
        };
      } catch (ex) {
        console.warn(ex);
        event.returnValue = {
          url: '',
        };
      }
    });

    this.listener('get-local-avatar', (event) => {
      try {
        let avatar = `${PROFILE_PATH}/avatar.png`;
        if (!fs.existsSync(avatar)) {
          avatar = '';
        }
        event.returnValue = avatar;
      } catch (error) {
        event.returnValue = '';
      }
    });

    // get yosoro documents save path
    this.listener('get-docuemnts-save-path', (event) => {
      event.returnValue = global.RUNTIME.paths.DOCUMENTS_ROOT;
    });

    this.listener('app-switch-edit-mode', (event, args) => {
      const cm = Menu.getApplicationMenu();
      let target = 3;
      if (process.platform === 'darwin') {
        target = 4;
      }
      let index = 0;
      for (const [i, item] of editorMode.entries()) {
        if (item.label.toLocaleLowerCase() === args) {
          index = i;
          break;
        }
      }
      cm.items[target].submenu.items[index].checked = true;
      Menu.setApplicationMenu(cm);
    });
  }
}
