/**
 * @description notes events
 * @channel NOTES:
 */

import { BrowserWindow, dialog, shell } from 'electron';
import fs from 'fs';
import fse from 'fs-extra';
import {
  DESKTOP_PATH,
  getProjectsPath,
  getTrashPath,
  setDocumentsPath,
  splitFlag,
} from '../paths';
import { generateHtml, exportPDF } from '../utils/utils';
import Event from './event';

export default class Notes extends Event {
  eventSet = new Set([
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
    'export-note',
    'export-notebook',
    'open-file-dialog',
  ]);

  constructor(ctx) {
    super(ctx);
    this.name = 'NOTES';
  }

  setListeners() {
    // create notes folder
    this.listener('create-project', (event, args) => {
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

    // rename folder
    this.listener('rename-project', (event, args) => {
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

    // move to trash
    this.listener('move-project-to-trash', (event, args) => {
      const { name } = args;
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

    // create file
    this.listener('create-file', (event, args) => {
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

    // rename file
    this.listener('rename-note', (event, args) => {
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

    // read file
    this.listener('read-file', (event, args) => {
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

    // save file
    this.listener('save-content-to-file', (event, args) => {
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

    // auto save file
    this.listener('auto-save-content-to-file', (event, args) => {
      const { content, fileName, projectName } = args;
      const filePath = `${getProjectsPath()}/${projectName}/${fileName}.md`;
      const folder = `${getProjectsPath()}/${projectName}`;
      try {
        if (!fs.existsSync(folder)) {
          fs.mkdirSync(folder);
        }
        fs.writeFile(filePath, content, () => {
        });
      } catch (ex) {
        console.warn(ex);
      }
    });

    // save trash file
    this.listener('save-content-to-trash-file', (event, args) => {
      const { content, projectName, name } = args;
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

    // move note to trash
    this.listener('move-file-to-trash', (event, args) => {
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

    // remove note permanent
    this.listener('permanent-remove-note', (event, args) => {
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

    // remove fold permanentg
    this.listener('permanent-remove-notebook', (event, args) => {
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

    // restore file
    this.listener('restore-note', (event, args) => {
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

    // restore folder
    this.listener('restore-notebook', (event, args) => {
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

    // save upload info. not use
    this.listener('save-upload-info-data', (event, args) => {
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

    // export-nopte
    this.listener('export-note', async (event, args) => {
      const { projectName, fileName, type, data } = args;
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
            if (type === 'html' || type === 'pdf') {
              content = await generateHtml(content);
            }
            if (type === 'pdf') {
              event.sender.send('async-export-file');
              await exportPDF(file, content);
              event.sender.send('async-export-file-complete');
            } else {
              fs.writeFileSync(file, content);
            }
          }
        });
      } catch (error) {
        console.warn(error);
        event.sender.send('async-export-file-complete');
      }
    });

    /**
     * 导出笔记本
     * 暂时只遍历一层目录
     */
    this.listener('export-notebook', async (event, args) => {
      const { notebook, type } = args;
      try {
        const folderPath = `${getProjectsPath()}/${notebook}`;
        const exportPath = `${DESKTOP_PATH}/${notebook}`;
        if (!fs.existsSync(exportPath)) {
          fs.mkdirSync(exportPath);
        }
        if (type === 'md') {
          fse.copySync(folderPath, exportPath);
        } else {
          const notes = fs.readdirSync(folderPath);
          if (type === 'pdf') {
            event.sender.send('async-export-file');
          }
          /* eslint-disable no-await-in-loop */
          for (const note of notes) {
            let content = fs.readFileSync(`${folderPath}/${note}`, {
              encoding: 'utf8',
            });
            content = await generateHtml(content);
            const name = note.replace(/\.md/ig, '');
            const fileName = `${exportPath}/${name}.${type}`;
            if (type === 'html') {
              fs.writeFileSync(fileName, content);
            } else if (type === 'pdf') {
              await exportPDF(fileName, content);
            }
          }
        }
        if (type === 'pdf') {
          event.sender.send('async-export-file-complete');
        }
        shell.openExternal(`file://${exportPath}`);
      } catch (ex) {
        console.warn(ex);
        event.sender.send('async-export-file-complete');
      }
    });

    this.listener('open-file-dialog', (event, args) => {
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
  }
}
