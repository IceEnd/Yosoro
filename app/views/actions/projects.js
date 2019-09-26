export const GET_PROJECT_LIST = 'GET_PROJECT_LIST';
export const GET_PROJECT_LIST_SUCCESS = 'GET_PROJECT_LIST_SUCCESS';
export const GET_PROJECT_LIST_FAIL = 'GET_PROJECT_LIST_FAIL';
export const CREATE_PROJECT = 'CREATE_PROJECT';
export const CREATE_FILE = 'CREATE_FILE';
export const DELETE_PROJECT = 'DELETE_PROJECT';
export const RENAME_PROJECT = 'RENAME_PROJECT';
export const RENAME_NOTE = 'RENAME_NOTE';
export const DELETE_NOTE = 'DELETE_NOTE';
export const UPDATE_NOTE_DESCRIPTION = 'UPDATE_NODE_DESCRIPTION';
export const SEARCH_NOTES = 'SEARCH_NOTES';
export const CLEAR_SEARCH_NOTES = 'CLEAR_SEARCH_NOTES';
export const REMOVE_NOTE_PERMANENTLY = 'REMOVE_NOTE_PERMANENTLY';
export const REMOVE_NOTEBOOK_PERMANENTLY = 'REMOVE_NOTEBOOK_PERMANENTLY';
export const RESTORE_NOTE = 'RESTORE_NOTE';
export const RESTORE_NOTEBOOK = 'RESTORE_NOTEBOOK';
export const TRASH_CHOOSE_PROJECT = 'TRASH_CHOOSE_PROJECT';
export const TRASH_BACK_ROOT = 'TRASH_BACK_ROOT';
export const SAVE_NOTE_ON_KEYDOWN = 'SAVE_NOTE_ON_KEYDOWN';
export const UPLOAD_NOTE_ONEDRIVE = 'UPLOAD_NOTE_ONEDRIVE';
export const UPLOAD_NOTE_ONEDRIVE_SUCCESS = 'UPLOAD_NOTE_ONEDRIVE_SUCCESS';
export const UPLOAD_NOTE_ONEDRIVE_FAILED = 'UPLOAD_NOTE_ONEDRIVE_FAILED';
export const UPDATE_NOTE_UPLOAD_STATUS = 'UPDATE_NOTE_UPLOAD_STATUS';
export const SAVE_NOTE_FROM_DRIVE = 'SAVE_NOTE_FROM_DRIVE';

export function getProjectList() {
  return {
    type: GET_PROJECT_LIST,
  };
}

// 新建笔记项目
export function createProject(param) {
  return {
    type: CREATE_PROJECT,
    param,
  };
}

// 新建笔记文档
export function createFile(param) {
  return {
    type: CREATE_FILE,
    param,
  };
}

export function deleteProject(uuid, onlyDelete) {
  return {
    type: DELETE_PROJECT,
    uuid,
    onlyDelete,
  };
}

/**
 * @description 重命名项目
 *
 * @export
 * @param {String} uuid 项目uuid
 * @param {String} name 新名称
 */
export function renameProject(uuid, name) {
  return {
    type: RENAME_PROJECT,
    uuid,
    name,
  };
}

/**
 * @description 重命名笔记
 *
 * @export
 * @param {String} uuid 项目uuid
 * @param {String} name 新名称
 * @param {String} parentsId 项目uuid
 */
export function renameNote(uuid, name, parentsId) {
  return {
    type: RENAME_NOTE,
    uuid,
    name,
    parentsId,
  };
}

export function deletNote(uuid, parentsId, name, projectName, onlyDelete = false) {
  return {
    type: DELETE_NOTE,
    uuid,
    parentsId,
    noteName: name,
    projectName,
    onlyDelete,
  };
}

export function updateNoteDesc(uuid, desc, parentsId) {
  return {
    type: UPDATE_NOTE_DESCRIPTION,
    uuid,
    desc,
    parentsId,
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

export function saveNote(parentsId, uuid) {
  return {
    type: SAVE_NOTE_ON_KEYDOWN,
    parentsId,
    uuid,
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
