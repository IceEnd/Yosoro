import { app } from 'electron';
import fs from 'fs';
import FSDB from './utils/FSDB';
// import { initConfig } from './utils/config';

export const splitFlag = process.platform === 'win32' ? '\\' : '/';

const dataPath = app.getPath('appData');

const SETTINGS_TEMP = {};

let appDataPath = `${dataPath}${splitFlag}Yosoro`;
if (process.env.NODE_ENV === 'development') {
  appDataPath += 'Test';
}

export const APP_DATA_PATH = appDataPath;
export const PROFILE_PATH = `${appDataPath}${splitFlag}profiledata`;

// setting file path
export const SETTINGS_PATH = `${PROFILE_PATH}${splitFlag}settings.json`;

// Initialization settings file
// If the file exists, do nothing
const settingsDB = new FSDB(SETTINGS_PATH);

let DOCUMENTS_ROOT = settingsDB.data.documentsRoot || appDataPath;
let DOCUMENTS_PATH = `${DOCUMENTS_ROOT}${splitFlag}documents`;
let PROJECTS_PATH = `${DOCUMENTS_PATH}${splitFlag}projects`;
let TRASH_PATH = `${DOCUMENTS_PATH}${splitFlag}trash`;

export function setDocumentsPath(rootPath) {
  DOCUMENTS_ROOT = rootPath;
  DOCUMENTS_PATH = `${DOCUMENTS_ROOT}${splitFlag}documents`;
  PROJECTS_PATH = `${DOCUMENTS_PATH}${splitFlag}projects`;
  TRASH_PATH = `${DOCUMENTS_PATH}${splitFlag}trash`;
  const temp = Object.assign({}, settingsDB.data, {
    documentsRoot: rootPath,
  });
  settingsDB.update(temp);
}

export const DESKTOP_PATH = app.getPath('desktop');

export function initWorkSpace() {
  try {
    if (!fs.existsSync(APP_DATA_PATH)) {
      fs.mkdirSync(APP_DATA_PATH);
    }
    if (!fs.existsSync(PROFILE_PATH)) {
      fs.mkdirSync(PROFILE_PATH); // 异步创建
    }
    settingsDB.defaults(SETTINGS_TEMP);
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

export function getDocumentsPath() {
  return DOCUMENTS_PATH;
}

export function getProjectsPath() {
  return PROJECTS_PATH;
}

export function getTrashPath() {
  return TRASH_PATH;
}
