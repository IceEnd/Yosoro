const TOKEN = '[PROJECTS]';

export const GET_PROJECT_LIST = `${TOKEN}:GET_PROJECT_LIST`;
export const GET_PROJECT_LIST_SUCCESS = `${TOKEN}:GET_PROJECT_LIST_SUCCESS`;
export const GET_PROJECT_LIST_FAIL = `${TOKEN}:GET_PROJECT_LIST_FAIL`;
export const CREATE_PROJECT = `${TOKEN}:CREATE_PROJECT`;
export const CREATE_FILE = `${TOKEN}:CREATE_FILE`;
export const DELETE_PROJECT = `${TOKEN}:DELETE_PROJECT`;
export const RENAME_PROJECT = `${TOKEN}:RENAME_PROJECT`;
export const RENAME_FILE = `${TOKEN}:RENAME_FILE`;
export const DELETE_FILE = `${TOKEN}:DELETE_FILE`;
export const UPDATE_FILE_DESCRIPTION = `${TOKEN}:UPDATE_NODE_DESCRIPTION`;
export const SEARCH_NOTES = `${TOKEN}:SEARCH_NOTES`;
export const CLEAR_SEARCH_NOTES = `${TOKEN}:CLEAR_SEARCH_NOTES`;
export const REMOVE_NOTE_PERMANENTLY = `${TOKEN}:${TOKEN}:REMOVE_NOTE_PERMANENTLY`;
export const REMOVE_NOTEBOOK_PERMANENTLY = `${TOKEN}:REMOVE_NOTEBOOK_PERMANENTLY`;
export const RESTORE_NOTE = `${TOKEN}:RESTORE_NOTE`;
export const RESTORE_NOTEBOOK = `${TOKEN}:RESTORE_NOTEBOOK`;
export const TRASH_CHOOSE_PROJECT = `${TOKEN}:TRASH_CHOOSE_PROJECT`;
export const TRASH_BACK_ROOT = `${TOKEN}:TRASH_BACK_ROOT`;
export const SAVE_FILE_ON_KEYDOWN = `${TOKEN}:SAVE_FILE_ON_KEYDOWN`;
export const UPLOAD_NOTE_ONEDRIVE = `${TOKEN}:UPLOAD_NOTE_ONEDRIVE`;
export const UPLOAD_NOTE_ONEDRIVE_SUCCESS = `${TOKEN}:UPLOAD_NOTE_ONEDRIVE_SUCCESS`;
export const UPLOAD_NOTE_ONEDRIVE_FAILED = `${TOKEN}:UPLOAD_NOTE_ONEDRIVE_FAILED`;
export const UPDATE_NOTE_UPLOAD_STATUS = `${TOKEN}:UPDATE_NOTE_UPLOAD_STATUS`;
export const SAVE_NOTE_FROM_DRIVE = `${TOKEN}:SAVE_NOTE_FROM_DRIVE`;
export const TOGGLE_FOLDER_EXPANEDED_KEYS = `${TOKEN}:TOGGLE_FOLDER_EXPANEDED_KEYS`;
export const SWITCH_PROJECT = `${TOKEN}:SWITCH_PROJECT`;
export const SWITCH_FILE = `${TOKEN}:SWITCH_NOTE`;
export const CLEAR_NOTE = `${TOKEN}:CLEAR_NOTE`;
export const CLEAR_NOTE_WORKSCAPE = `${TOKEN}:CLEAR_NOTE_WORKSCAPE`;
export const UPDATE_NOTE_PROJECTNAME = `${TOKEN}:UPDATE_NOTE_PROJECTNAME`;
export const UPDATE_NOTE_FILENAME = `${TOKEN}:UPDATE_NOTE_FILENAME`;

export function getProjectList() {
  return {
    type: GET_PROJECT_LIST,
  };
}

// 新建笔记项目
export function createProject(uuid, pos, name) {
  return {
    type: CREATE_PROJECT,
    uuid,
    pos,
    name,
  };
}

// 新建笔记文档
export function createFile(param) {
  return {
    type: CREATE_FILE,
    param,
  };
}

export function deleteProject(uuid, pos, permanently = false) {
  return {
    type: DELETE_PROJECT,
    uuid,
    pos,
    permanently,
  };
}

/**
 * @description 重命名项目
 *
 * @export
 * @param {String} uuid 项目uuid
 * @param {String} name 新名称
 */
export function renameProject(uuid, pos, name) {
  return {
    type: RENAME_PROJECT,
    uuid,
    pos,
    name,
  };
}

/**
 * @description rename file
 *
 * @export
 * @param {String} uuid uuid
 * @param {String} name new name
 */
export function renameFile(uuid, name) {
  return {
    type: RENAME_FILE,
    uuid,
    name,
  };
}

export function deleteFile(uuid, onlyDelete = false) {
  return {
    type: DELETE_FILE,
    uuid,
    onlyDelete,
  };
}

export function updateFileDesc(uuid, desc) {
  return {
    type: UPDATE_FILE_DESCRIPTION,
    uuid,
    desc,
  };
}

export function searchNotes(keyword) {
  return {
    type: SEARCH_NOTES,
    keyword,
  };
}

export function clearSearchNotes() {
  return {
    type: CLEAR_SEARCH_NOTES,
  };
}

/**
 * @description 永久删除笔记
 * @param {String} parentsUuid 项目uuid
 * @param {String} uuid 笔记uuid
 */
export function permantRemoveNote(parentsUuid, uuid) {
  return {
    type: REMOVE_NOTE_PERMANENTLY,
    parentsUuid,
    uuid,
  };
}

/**
 * @description 永久删除笔记本
 * @param {String} uuid 项目uuid
 */
export function permantRemoveNotebook(uuid) {
  return {
    type: REMOVE_NOTEBOOK_PERMANENTLY,
    uuid,
  };
}

export function restoreNote(parentsId, uuid) {
  return {
    type: RESTORE_NOTE,
    parentsId,
    uuid,
  };
}

export function restoreNotebook(uuid) {
  return {
    type: RESTORE_NOTEBOOK,
    uuid,
  };
}

export function chooseTrashProject(uuid, name) {
  return {
    type: TRASH_CHOOSE_PROJECT,
    uuid,
    name,
  };
}

export function trashBack() {
  return {
    type: TRASH_BACK_ROOT,
  };
}

export function saveFile(uuid, content, desc) {
  return {
    type: SAVE_FILE_ON_KEYDOWN,
    uuid,
    content,
    desc,
  };
}

export function updateNoteUploadStatus(parentsId, uuid, status) {
  return {
    type: UPDATE_NOTE_UPLOAD_STATUS,
    parentsId,
    uuid,
    status,
  };
}

export function toggleExpanededKeys(expandedKeys, flag = 'add') {
  return {
    type: TOGGLE_FOLDER_EXPANEDED_KEYS,
    expandedKeys,
    flag,
  };
}

export function switchProject(uuid, pos) {
  return {
    type: SWITCH_PROJECT,
    uuid,
    pos,
  };
}

export function switchFile(uuid) {
  return {
    type: SWITCH_FILE,
    uuid,
  };
}

export function clearNote() {
  return {
    type: CLEAR_NOTE,
  };
}

export function clearWorkspace() {
  return {
    type: CLEAR_NOTE_WORKSCAPE,
  };
}

export function updateNoteProjectName(name) {
  return {
    type: UPDATE_NOTE_PROJECTNAME,
    name,
  };
}

export function updateNoteFileName(name) {
  return {
    type: UPDATE_NOTE_FILENAME,
    name,
  };
}
