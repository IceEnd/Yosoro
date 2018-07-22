import { app } from 'electron';
import fs from 'fs';

const dataPath = app.getPath('appData');

let appDataPath = `${dataPath}/Yosoro`;
if (process.env.NODE_ENV === 'development') {
  appDataPath += 'Test';
}

export const APP_DATA_PATH = appDataPath;
export const PROFILE_PATH = `${appDataPath}/profiledata`;
export const DOCUMENTS_PATH = `${appDataPath}/documents`;
export const PROJECTS_PATH = `${DOCUMENTS_PATH}/projects`;
export const TRASH_PATH = `${DOCUMENTS_PATH}/trash`;
export const DESKTOP_PATH = app.getPath('desktop');

export function initWorkSpace() {
  try {
    if (!fs.existsSync(APP_DATA_PATH)) {
      fs.mkdirSync(APP_DATA_PATH);
    }
    if (!fs.existsSync(PROFILE_PATH)) {
      fs.mkdir(PROFILE_PATH); // 异步创建
    }
    if (!fs.existsSync(DOCUMENTS_PATH)) {
      fs.mkdirSync(DOCUMENTS_PATH);
    }
    if (!fs.existsSync(PROJECTS_PATH)) {
      fs.mkdirSync(PROJECTS_PATH);
    }
    if (!fs.existsSync(TRASH_PATH)) {
      fs.mkdirSync(TRASH_PATH);
    }
  } catch (ex) {
    console.warn(ex);
  }
}
