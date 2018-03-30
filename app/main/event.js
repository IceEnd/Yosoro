/**
 * @description 主进程事件监听
 */

import { ipcMain, BrowserWindow, app } from 'electron';
import fs from 'fs';
import fse from 'fs-extra';

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
    // const folder = path.join(__dirname, `../documents/projects/${name}`);
    try {
      // createInitWorkSpace();
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
    // const oldfolder = path.join(__dirname, `../documents/projects/${oldName}`);
    // const newfolder = path.join(__dirname, `../documents/projects/${newName}`);
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
      if (fs.existsSync(newPath)) {
        const files = fs.readdirSync(oldPath);
        const fl = files.length;
        for (let i = 0; i < fl; i++) {
          const fileName = files[i];
          fse.moveSync(`${oldPath}/${fileName}`, `${newPath}/${fileName}`, { overwrite: true });
        }
        fs.rmdirSync(oldPath);
      } else {
        fse.moveSync(oldPath, newPath, { overwrite: true });
      }
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

  // 新建文件
  ipcMain.on('create-file', (event, args) => {
    const { name, projectName } = args;
    const file = `${projectsPath}/${projectName}/${name}.md`;
    try {
      const exists = fs.existsSync(file);
      if (exists) { // 文件存在
        event.returnValue = {
          success: false,
          error: {
            errno: -10000,
          },
        };
      } else {
        fs.writeFileSync(file, '');
        event.returnValue = {
          file,
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

  // 重命名笔记标题
  ipcMain.on('rename-note', (event, args) => {
    const { oldName, newName, projectName } = args;
    // const oldPath = `${folder}/${oldName}.md`;
    // const newPath = `${folder}/${newName}.md`;
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
    // const oldPath = `${folder}/${name}.md`;
    // const newPath = path.join(__dirname, `../documents/trash/${projectName}/${name}.md`);
    // const newfolder = path.join(__dirname, `../documents/trash/${projectName}`);
    const oldPath = `${projectsPath}/${projectName}/${name}.md`;
    const newPath = `${trashPath}/${projectName}/${name}.md`;
    const newfolder = `${trashPath}/${projectName}`;
    try {
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
      };
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
      fs.unlinkSync(filePath);
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

  // 永久删除笔记本
  ipcMain.on('permanent-remove-notebook', (event, args) => {
    const { name } = args;
    const folder = `${trashPath}/${name}`;
    try {
      fse.removeSync(folder);
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
}
