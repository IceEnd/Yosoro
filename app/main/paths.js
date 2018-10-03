import { app } from 'electron';
import fs from 'fs';
import FSDB from './utils/FSDB';
// import { initConfig } from './utils/config';

const dataPath = app.getPath('appData');

const SETTINGS_TEMP = {};

let appDataPath = `${dataPath}/Yosoro`;
if (process.env.NODE_ENV === 'development') {
  appDataPath += 'Test';
}

export const APP_DATA_PATH = appDataPath;
export const PROFILE_PATH = `${appDataPath}/profiledata`;

// setting file path
export const SETTINGS_PATH = `${PROFILE_PATH}/settings.json`;

// Initialization settings file
// If the file exists, do nothing
const settingsDB = new FSDB(SETTINGS_PATH);
settingsDB.defaults(SETTINGS_TEMP);

let DOCUMENTS_PATH = settingsDB.data.DOCUMENTS_PATH || `${appDataPath}/documents`;
let PROJECTS_PATH = `${DOCUMENTS_PATH}/projects`;
let TRASH_PATH = `${DOCUMENTS_PATH}/trash`;

export function setDocumentsPath(documentsPath) {
  DOCUMENTS_PATH = `${documentsPath}/Yosoro/documents`;
  PROJECTS_PATH = `${DOCUMENTS_PATH}/projects`;
  TRASH_PATH = `${DOCUMENTS_PATH}/trash`;
}

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

export function getDocumentsPath() {
  return DOCUMENTS_PATH;
}

export function getProjectsPath() {
  return PROJECTS_PATH;
}

export function getTrashPath() {
  return TRASH_PATH;
}
