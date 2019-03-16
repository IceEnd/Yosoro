import { app } from 'electron';
import fs from 'fs';
import FSDB from './utils/FSDB';
import Database from './utils/Database';

export const splitFlag = process.platform === 'win32' ? '\\' : '/';

const dataPath = app.getPath('appData');

const SETTINGS_TEMP = {};

const appDataPath = `${dataPath}${splitFlag}Yosoro`;

export const APP_DATA_PATH = appDataPath;
export const PROFILE_PATH = `${appDataPath}${splitFlag}profiledata`;

// setting file path
export const SETTINGS_PATH = `${PROFILE_PATH}${splitFlag}settings.json`;

// Initialization settings file
// If the file exists, do nothing
const settingsDB = new FSDB(SETTINGS_PATH);

try {
  if (!fs.existsSync(APP_DATA_PATH)) {
    fs.mkdirSync(APP_DATA_PATH);
  }
  if (!fs.existsSync(PROFILE_PATH)) {
    fs.mkdirSync(PROFILE_PATH);
  }
  settingsDB.defaults(SETTINGS_TEMP);
} catch (ex) {
  console.error(ex);
}

function getGlobalPath(rootPath) {
  const DOCUMENTS_ROOT = rootPath || appDataPath;
  const DBS_PATH = `${DOCUMENTS_ROOT}${splitFlag}yodbs`;
  const DOCUMENTS_PATH = `${DOCUMENTS_ROOT}${splitFlag}documents`;
  const PROJECTS_PATH = `${DOCUMENTS_PATH}${splitFlag}projects`;
  const TRASH_PATH = `${DOCUMENTS_PATH}${splitFlag}trash`;
  const IMAGES_DB_PATH = `${DBS_PATH}${splitFlag}IMAGES_DB.ysrdb`;

  return {
    DOCUMENTS_ROOT,
    DBS_PATH,
    DOCUMENTS_PATH,
    PROJECTS_PATH,
    TRASH_PATH,
    IMAGES_DB_PATH,
  };
}

function initRunTime() {
  const paths = getGlobalPath(settingsDB.data.documentsRoot);
  global.RUNTIME = {
    imageDB: new Database({
      filename: paths.IMAGES_DB_PATH,
      autoload: true,
    }),
    paths,
  };
}

export function setDocumentsPath(rootPath) {
  const temp = Object.assign({}, settingsDB.data, {
    documentsRoot: rootPath,
  });
  settingsDB.update(temp);

  const paths = getGlobalPath(rootPath);

  global.RUNTIME.paths = paths;

  global.RUNTIME.imageDB = new Database({
    filename: paths.IMAGES_DB_PATH,
    autoload: true,
  });
}

export const DESKTOP_PATH = app.getPath('desktop');

export function initWorkSpace() {
  initRunTime();
  try {
    if (!fs.existsSync(global.RUNTIME.paths.DOCUMENTS_PATH)) {
      fs.mkdirSync(global.RUNTIME.paths.DOCUMENTS_PATH);
    }
    if (!fs.existsSync(global.RUNTIME.paths.PROJECTS_PATH)) {
      fs.mkdirSync(global.RUNTIME.paths.PROJECTS_PATH);
    }
    if (!fs.existsSync(global.RUNTIME.paths.TRASH_PATH)) {
      fs.mkdirSync(global.RUNTIME.paths.TRASH_PATH);
    }
  } catch (ex) {
    console.warn(ex);
  }
}

export function getDocumentsPath() {
  return global.RUNTIME.paths.DOCUMENTS_PATH;
}

export function getProjectsPath() {
  return global.RUNTIME.paths.PROJECTS_PATH;
}

export function getTrashPath() {
  return global.RUNTIME.paths.TRASH_PATH;
}
