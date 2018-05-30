/**
 * @description 主进程事件监听
 */

import { ipcMain, BrowserWindow, app, Menu, dialog } from 'electron';
import fs from 'fs';
import fse from 'fs-extra';
import marked from 'marked';
import markdownpdf from 'markdown-pdf';
import schedule from './schedule';

const renderer = new marked.Renderer();

renderer.listitem = function (text) {
  let res = text;
  if (/^\s*\[[x ]\]\s*/.test(text)) {
    res = text.replace(/^\s*\[ \]\s*/, '<input class="task-list-item-checkbox" type="checkbox" disabled></input> ').replace(/^\s*\[x\]\s*/, '<input class="task-list-item-checkbox" checked disabled type="checkbox"></input> ');
    return `<li class="task-list-li">${res}</li>`;
  }
  return `<li>${text}</li>`;
};

marked.setOptions({
  renderer,
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: false,
  smartLists: true,
  smartypants: false,
  highlight: (code) => {
    const value = require('../views/utils/highlight.min.js').highlightAuto(code).value;
    return value;
  },
});

const dataPath = app.getPath('appData');
let appDataPath = `${dataPath}/Yosoro`;
if (process.env.NODE_ENV === 'development') {
  appDataPath += 'Test';
}
const documentsPath = `${appDataPath}/documents`;
const projectsPath = `${documentsPath}/projects`;
const trashPath = `${documentsPath}/trash`;

export default function eventListener(menus) {
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
    const folder = `${projectsPath}/${name}`;
    try {
      if (fs.existsSync(folder)) {
        fse.removeSync(folder);
      }
      fs.mkdirSync(folder);
      event.returnValue = {
        folder,
        success: true,
      };
    } catch (ex) {
      event.returnValue = {
        success: false,
        error: ex,
      };
    }
  });

  ipcMain.on('rename-project', (event, args) => {
    const { oldName, newName } = args;
    const oldfolder = `${projectsPath}/${oldName}`;
    const newfolder = `${projectsPath}/${newName}`;
    const oldTrashFolder = `${trashPath}/${oldName}`;
    const newTrashFolder = `${trashPath}/${newName}`;
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
    const oldPath = `${projectsPath}/${name}`;
    const newPath = `${trashPath}/${name}`;
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
    const file = `${projectsPath}/${projectName}/${name}.md`;
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
    const oldPath = `${projectsPath}/${projectName}/${oldName}.md`;
    const newPath = `${projectsPath}/${projectName}/${newName}.md`;
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
    const filePath = `${projectsPath}/${projectName}/${fileName}.md`;
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
    const filePath = `${projectsPath}/${projectName}/${fileName}.md`;
    const folder = `${projectsPath}/${projectName}`;
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

  ipcMain.on('save-content-to-trash-file', (event, args) => {
    const { content, projectName, name } = args;
    // const file = path.join(__dirname, `../documents/trash/${projectName}/${name}.md`);
    const filePath = `${trashPath}/${projectName}/${name}.md`;
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
    const oldPath = `${projectsPath}/${projectName}/${name}.md`;
    const newPath = `${trashPath}/${projectName}/${name}.md`;
    const newfolder = `${trashPath}/${projectName}`;
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
    const filePath = `${trashPath}/${projectName}/${name}.md`;
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
    const folder = `${trashPath}/${name}`;
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
    const folder = `${projectsPath}/${projectName}`;
    const oldFile = `${trashPath}/${projectName}/${name}.md`;
    const newFile = `${projectsPath}/${projectName}/${name}.md`;
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
    const oldPath = `${trashPath}/${name}`;
    const newPath = `${projectsPath}/${name}`;
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
    const filePath = `${projectsPath}/data.json`;
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

  ipcMain.on('export-note', (events, args) => {
    const { projectName, fileName, type, data } = args;
    const filePath = `${projectsPath}/${projectName}/${fileName}.md`;
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
          content = marked(content);
        }
      } else if (type === 'pdf') {
        title = 'Export as PDF';
        if (!data) {
          content = marked(content);
        }
      }
      const options = {
        title,
        defaultPath: `${app.getPath('desktop')}/${fileName}.${type}`,
      };
      dialog.showSaveDialog(options, (filename) => {
        if (typeof filename === 'string') {
          const extension = `.${type}$`;
          const reg = new RegExp(extension, 'ig');
          let file = filename;
          if (!reg.test(filename)) {
            file += `.${type}`;
          }
          if (type === 'pdf') {
            const webContents = BrowserWindow.getAllWindows()[0].webContents;
            webContents.send('async-export-file');
            markdownpdf().from.string(content).to(file, () => {
              webContents.send('async-export-file-complete');
            });
          } else {
            fs.writeFileSync(file, content);
          }
        }
      });
    } catch (error) {
      console.warn(error);
    }
  });
}
