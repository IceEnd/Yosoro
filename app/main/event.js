/**
 * @description 主进程事件监听
 */

import { ipcMain, BrowserWindow, Menu, dialog, shell } from 'electron';
import fs from 'fs';
import fse from 'fs-extra';
import path from 'path';
import url from 'url';
import {
  PROFILE_PATH,
  DESKTOP_PATH,
  getProjectsPath,
  getTrashPath,
  setDocumentsPath,
  splitFlag,
} from './paths';

import uploder from './services/uploader/index';
import { markedToHtml } from '../views/utils/utils';
import schedule from './schedule';
import PDF from './pdf';

import { editorMode } from './config/shortcuts.json';

export function eventListener(menus) {
  const { explorerMenu, exploereFileMenu, projectItemMenu,
    fileItemMenu } = menus;

  // 监听Explorer导航右键事件
  ipcMain.on('show-context-menu-explorer', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    explorerMenu.popup(win);
  });

  // 项目右键菜单
  ipcMain.on('show-context-menu-project-item', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    projectItemMenu.popup(win);
  });

  // 监听File Explorer导航右键事件
  ipcMain.on('show-context-menu-explorer-file', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    exploereFileMenu.popup(win);
  });

  ipcMain.on('show-context-menu-file-item', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    fileItemMenu.popup(win);
  });

  // 新建项目文件夹
  ipcMain.on('create-project', (event, args) => {
    const name = args;
    const folder = `${getProjectsPath()}/${name}`;
    try {
      if (fs.existsSync(folder)) {
        event.returnValue = {
          folder,
          success: true,
        };
      } else {
        fs.mkdirSync(folder);
        event.returnValue = {
          folder,
          success: true,
        };
      }
    } catch (ex) {
      event.returnValue = {
        success: false,
        error: ex,
      };
    }
  });

  ipcMain.on('rename-project', (event, args) => {
    const { oldName, newName } = args;
    const oldfolder = `${getProjectsPath()}/${oldName}`;
    const newfolder = `${getProjectsPath()}/${newName}`;
    const oldTrashFolder = `${getTrashPath()}/${oldName}`;
    const newTrashFolder = `${getTrashPath()}/${newName}`;
    try {
      fs.renameSync(oldfolder, newfolder);
      if (fs.existsSync(oldTrashFolder)) {
        fs.renameSync(oldTrashFolder, newTrashFolder);
      }
      event.returnValue = {
        success: true,
        folder: newfolder,
      };
    } catch (ex) {
      event.returnValue = {
        success: false,
        error: ex,
      };
    }
  });

  // 将项目文件夹移到废纸篓
  ipcMain.on('move-project-to-trash', (event, args) => {
    const { name } = args;
    // const newPath = path.join(__dirname, `../documents/trash/${name}`);
    const oldPath = `${getProjectsPath()}/${name}`;
    const newPath = `${getTrashPath()}/${name}`;
    try {
      if (!fs.existsSync(oldPath)) { // 不存在对应文件夹
        event.returnValue = {
          success: true,
          code: 1,
        };
      } else {
        if (fs.existsSync(newPath)) {
          const files = fs.readdirSync(oldPath);
          const fl = files.length;
          for (let i = 0; i < fl; i++) {
            const fileName = files[i];
            fse.moveSync(`${oldPath}/${fileName}`, `${newPath}/${fileName}`, { overwrite: true });
          }
        } else {
          fse.moveSync(oldPath, newPath, { overwrite: true });
        }
        if (fs.existsSync(oldPath)) {
          fs.rmdirSync(oldPath);
        }
        event.returnValue = {
          success: true,
          folder: newPath,
          code: 0,
        };
      }
    } catch (ex) {
      event.returnValue = {
        success: false,
        error: ex,
      };
    }
  });

  // 新建文件
  ipcMain.on('create-file', (event, args) => {
    const { name, projectName } = args;
    const file = `${getProjectsPath()}/${projectName}/${name}.md`;
    try {
      fs.writeFileSync(file, '');
      event.returnValue = {
        file,
        success: true,
      };
    } catch (ex) {
      event.returnValue = {
        success: false,
        error: ex,
      };
    }
  });

  // 重命名笔记标题
  ipcMain.on('rename-note', (event, args) => {
    const { oldName, newName, projectName } = args;
    const oldPath = `${getProjectsPath()}/${projectName}/${oldName}.md`;
    const newPath = `${getProjectsPath()}/${projectName}/${newName}.md`;
    try {
      fs.renameSync(oldPath, newPath);
      event.returnValue = {
        success: true,
        folder: newPath,
      };
    } catch (ex) {
      event.returnValue = {
        success: false,
        error: ex,
      };
    }
  });

  // 读取文件内容
  ipcMain.on('read-file', (event, args) => {
    const { projectName, fileName } = args;
    const filePath = `${getProjectsPath()}/${projectName}/${fileName}.md`;
    try {
      const data = fs.readFileSync(filePath, {
        encoding: 'utf8',
      });
      event.returnValue = {
        success: true,
        data,
      };
    } catch (ex) {
      event.returnValue = {
        success: false,
        error: ex,
      };
    }
  });

  // 保存文件内容
  ipcMain.on('save-content-to-file', (event, args) => {
    const { content, fileName, projectName } = args;
    const filePath = `${getProjectsPath()}/${projectName}/${fileName}.md`;
    const folder = `${getProjectsPath()}/${projectName}`;
    try {
      if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder);
      }
      fs.writeFileSync(filePath, content);
      event.returnValue = {
        success: true,
      };
    } catch (ex) {
      event.returnValue = {
        success: false,
        error: ex,
      };
    }
  });

  ipcMain.on('auto-save-content-to-file', (event, args) => {
    const { content, fileName, projectName } = args;
    const filePath = `${getProjectsPath()}/${projectName}/${fileName}.md`;
    const folder = `${getProjectsPath()}/${projectName}`;
    try {
      if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder);
      }
      fs.writeFile(filePath, content, () => {
        // console.info(`${projectName}/${fileName}:auto save`);
      });
    } catch (ex) {
      console.warn(ex);
    }
  });

  ipcMain.on('save-content-to-trash-file', (event, args) => {
    const { content, projectName, name } = args;
    // const file = path.join(__dirname, `../documents/trash/${projectName}/${name}.md`);
    const filePath = `${getTrashPath()}/${projectName}/${name}.md`;
    try {
      fs.writeFileSync(filePath, content);
      event.returnValue = {
        success: true,
      };
    } catch (ex) {
      event.returnValue = {
        success: false,
        error: ex,
      };
    }
  });

  // 将笔记移动到废纸篓中
  ipcMain.on('move-file-to-trash', (event, args) => {
    const { name, projectName } = args;
    const oldPath = `${getProjectsPath()}/${projectName}/${name}.md`;
    const newPath = `${getTrashPath()}/${projectName}/${name}.md`;
    const newfolder = `${getTrashPath()}/${projectName}`;
    try {
      if (!fs.existsSync(oldPath)) {
        event.returnValue = {
          success: true,
          folder: newPath,
          code: 1,
        };
      } else {
        if (!fs.existsSync(newfolder)) {
          fs.mkdirSync(newfolder);
        }
        fse.moveSync(oldPath, newPath, { overwrite: true });
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
        event.returnValue = {
          success: true,
          folder: newPath,
          code: 0,
        };
      }
    } catch (ex) {
      event.returnValue = {
        success: false,
        error: ex,
      };
    }
  });

  // 永久删除笔记
  ipcMain.on('permanent-remove-note', (event, args) => {
    const { projectName, name } = args;
    const filePath = `${getTrashPath()}/${projectName}/${name}.md`;
    try {
      if (!fs.existsSync(filePath)) {
        event.returnValue = {
          success: true,
          code: 1,
        };
      } else {
        fs.unlinkSync(filePath);
        event.returnValue = {
          success: true,
          code: 0,
        };
      }
    } catch (ex) {
      event.returnValue = {
        success: false,
        error: ex,
      };
    }
  });

  // 永久删除笔记本
  ipcMain.on('permanent-remove-notebook', (event, args) => {
    const { name } = args;
    const folder = `${getTrashPath()}/${name}`;
    try {
      if (!fs.existsSync(folder)) {
        event.returnValue = {
          success: true,
          code: 1,
        };
      } else {
        fse.removeSync(folder);
        event.returnValue = {
          success: true,
        };
      }
    } catch (ex) {
      event.returnValue = {
        success: false,
        error: ex,
      };
    }
  });

  // 从废纸篓中还原笔记
  ipcMain.on('restore-note', (event, args) => {
    const { projectName, name } = args;
    const folder = `${getProjectsPath()}/${projectName}`;
    const oldFile = `${getTrashPath()}/${projectName}/${name}.md`;
    const newFile = `${getProjectsPath()}/${projectName}/${name}.md`;
    try {
      if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder);
      }
      fse.moveSync(oldFile, newFile, { overwrite: true });
      event.returnValue = {
        success: true,
      };
    } catch (ex) {
      event.returnValue = {
        success: false,
        error: ex,
      };
    }
  });

  // 从废纸篓中还原笔记本
  ipcMain.on('restore-notebook', (event, args) => {
    const { name } = args;
    const oldPath = `${getTrashPath()}/${name}`;
    const newPath = `${getProjectsPath()}/${name}`;
    try {
      const files = fs.readdirSync(oldPath);
      const fl = files.length;
      for (let i = 0; i < fl; i++) {
        const fileName = files[i];
        fse.moveSync(`${oldPath}/${fileName}`, `${newPath}/${fileName}`, { overwrite: true });
      }
      fs.rmdirSync(oldPath);
      event.returnValue = {
        success: true,
      };
    } catch (ex) {
      event.returnValue = {
        success: false,
        error: ex,
      };
    }
  });

  // 保存上传信息
  ipcMain.on('save-upload-info-data', (event, args) => {
    const content = JSON.stringify(args);
    const filePath = `${getProjectsPath()}/data.json`;
    try {
      fs.writeFileSync(filePath, content);
      event.returnValue = {
        success: true,
        path: filePath,
      };
    } catch (ex) {
      event.returnValue = {
        success: false,
        error: ex,
      };
    }
  });

  // 启用 | 启用 菜单 "new -file"
  ipcMain.on('file-new-enbaled', (event, args) => {
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

  ipcMain.on('start-release-schedule', () => {
    schedule.releaseSchedule();
  });

  ipcMain.on('stop-release-schedule', () => {
    schedule.cancelReleases();
  });

  ipcMain.on('export-note', (event, args) => {
    const { projectName, fileName, type, data } = args;
    const folderPath = `${getProjectsPath()}/${projectName}`;
    const filePath = `${getProjectsPath()}/${projectName}/${fileName}.md`;
    try {
      let content;
      if (data) {
        content = data;
      } else {
        content = fs.readFileSync(filePath, {
          encoding: 'utf8',
        });
      }
      let title = '';
      if (type === 'md') {
        title = 'Export as Markdown';
      } else if (type === 'html') {
        title = 'Export as Html';
        if (!data) {
          content = markedToHtml(content, false);
        }
      } else if (type === 'pdf') {
        title = 'Export as PDF';
      }
      const options = {
        title,
        defaultPath: `${DESKTOP_PATH}/${fileName}.${type}`,
      };
      dialog.showSaveDialog(options, async (fname) => {
        if (typeof fname === 'string') {
          const extension = `.${type}$`;
          const reg = new RegExp(extension, 'ig');
          let file = fname;
          if (!reg.test(fname)) {
            file += `.${type}`;
          }
          if (type === 'pdf') {
            event.sender.send('async-export-file');
            const pdf = new PDF([`${fileName}.md`], folderPath, file, false);
            await pdf.start();
            event.sender.send('async-export-file-complete');
          } else {
            fs.writeFileSync(file, content);
          }
        }
      });
    } catch (error) {
      console.warn(error);
    }
  });

  /**
   * 导出笔记本
   * 暂时只遍历一层目录
   */
  ipcMain.on('export-notebook', async (event, args) => {
    const { notebook, type } = args;
    try {
      event.sender.send('async-export-file');
      const folderPath = `${getProjectsPath()}/${notebook}`;
      const exportPath = `${DESKTOP_PATH}/${notebook}`;
      if (!fs.existsSync(exportPath)) {
        fs.mkdirSync(exportPath);
      }
      if (type === 'md') {
        fse.copySync(folderPath, exportPath);
      } else if (type === 'pdf') {
        const notes = fs.readdirSync(folderPath);
        const pdf = new PDF(notes, folderPath, exportPath);
        await pdf.start();
      } else {
        const promiseArr = [];
        const notes = fs.readdirSync(folderPath);
        for (const note of notes) {
          let content = fs.readFileSync(`${folderPath}/${note}`, {
            encoding: 'utf8',
          });
          content = markedToHtml(content, false);
          const name = note.replace(/\.md/ig, '');
          promiseArr.push(new Promise((resolve) => {
            fs.writeFile(`${exportPath}/${name}.${type}`, content, (err) => {
              if (err) {
                console.warn(err);
              }
              resolve('done');
            });
          }));
        }
        await Promise.all(promiseArr);
      }
      event.sender.send('async-export-file-complete');
      shell.openExternal(`file://${exportPath}`);
    } catch (ex) {
      console.warn(ex);
      event.sender.send('async-export-file-complete');
    }
  });

  ipcMain.on('get-webview-path', (event) => {
    event.returnValue = url.format({
      pathname: path.join(__dirname, './webview/webview.html'),
      protocol: 'file:',
    });
  });

  // 将用户头像保存到 应用数据文件夹/profile
  ipcMain.on('save-user-avatar', (event, args) => {
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

  // 获取本地存储的avatar
  ipcMain.on('get-local-avatar', (event) => {
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
  ipcMain.on('get-docuemnts-save-path', (event) => {
    event.returnValue = global.RUNTIME.paths.DOCUMENTS_ROOT;
  });

  ipcMain.on('open-file-dialog', (event, args) => {
    const { properties, cbChannel, cbOver } = args;
    const win = BrowserWindow.fromWebContents(event.sender);
    dialog.showOpenDialog(win, {
      properties,
    }, (filePaths) => {
      if (filePaths) {
        const { DOCUMENTS_ROOT, DOCUMENTS_PATH, DBS_PATH } = global.RUNTIME.paths;
        const newDocRoot = filePaths[0];
        const newDocPath = `${newDocRoot}${splitFlag}documents`;
        const newDBPath = `${newDocRoot}${splitFlag}yodbs`;
        if (DOCUMENTS_ROOT !== newDocRoot) {
          event.sender.send(cbChannel);
          try {
            fse.moveSync(DOCUMENTS_PATH, newDocPath, { overwrite: true });
            fse.moveSync(DBS_PATH, newDBPath, { overwrite: true });
            setDocumentsPath(newDocRoot);
            event.sender.send(cbOver, {
              code: true,
              res: newDocRoot,
            });
          } catch (ex) {
            console.error(ex);
            event.sender.send(cbOver, {
              code: false,
            });
          }
        }
      }
    });
  });

  ipcMain.on('app-switch-edit-mode', (event, args) => {
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

  // upload picture
  ipcMain.on('pic-upload', async (event, paylod) => {
    try {
      const res = await uploder(paylod);
      const doc = await global.RUNTIME.imageDB.insert(res);
      const { uuid, from } = paylod;
      event.sender.send('pic-upload', {
        code: 0,
        data: { ...doc, uuid, from },
      });
    } catch (ex) {
      console.warn(ex);
      event.sender.send('pic-upload', {
        code: -1,
        data: ex,
      });
    }
  });

  ipcMain.on('pic-upload-sync', async (event, paylod) => {
    const seed = paylod.seed;
    try {
      const res = await uploder(paylod);
      const doc = await global.RUNTIME.imageDB.insert(res);
      event.sender.send(`pic-upload-sync-cb-${seed}`, {
        code: 0,
        data: doc,
      });
    } catch (ex) {
      event.sender.send(`pic-upload-sync-cb-${seed}`, {
        code: -1,
        data: ex,
      });
    }
  });

  ipcMain.on('get-images-list', async (event) => {
    const list = await global.RUNTIME.imageDB.findAll({}, { date: -1 });
    event.sender.send('get-images-list', list);
  });

  ipcMain.on('images-delete', (event, payload) => {
    global.RUNTIME.imageDB.remove({ _id: payload });
  });
}

export function removeEventListeners() {
  const listeners = [
    'show-context-menu-explorer',
    'show-context-menu-project-item',
    'show-context-menu-explorer-file',
    'show-context-menu-file-item',
    'show-context-menu-file-item',
    'create-project',
    'rename-project',
    'move-project-to-trash',
    'create-file',
    'rename-note',
    'read-file',
    'save-content-to-file',
    'auto-save-content-to-file',
    'save-content-to-trash-file',
    'move-file-to-trash',
    'permanent-remove-note',
    'permanent-remove-notebook',
    'restore-note',
    'restore-notebook',
    'save-upload-info-data',
    'file-new-enbaled',
    'start-release-schedule',
    'export-note',
    'export-notebook',
    'get-webview-path',
    'save-user-avatar',
    'get-local-avatar',
    'get-docuemnts-save-path',
    'app-switch-edit-mode',
    'pic-upload',
    'get-images-list',
    'images-delete',
  ];
  for (const listener of listeners) {
    ipcMain.removeAllListeners(listener);
  }
}
