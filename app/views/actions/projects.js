export const GET_PROJECT_LIST = 'GET_PROJECT_LIST';

export function getProjectList() {
  return {
    type: GET_PROJECT_LIST,
  };
}

export const CREATE_PROJECT = 'CREATE_PROJECT';

// 新建笔记项目
export function createProject(param) {
  return {
    type: CREATE_PROJECT,
    param,
  };
}

export const CREATE_FILE = 'CREATE_FILE';

// 新建笔记文档
export function createFile(param) {
  return {
    type: CREATE_FILE,
    param,
  };
}

export const DELETE_PROJECT = 'DELETE_PROJECT';

export function deleteProject(uuid) {
  return {
    type: DELETE_PROJECT,
    uuid,
  };
}


export const RENAME_PROJECT = 'RENAME_PROJECT';

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

export const RENAME_NOTE = 'RENAME_NOTE';

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

export const DELETE_NOTE = 'DELETE_NOTE';

export function deletNote(uuid, parentsId, name, projectName) {
  return {
    type: DELETE_NOTE,
    uuid,
    parentsId,
    noteName: name,
    projectName,
  };
}

export const UPDATE_NOTE_DESCRIPTION = 'UPDATE_NODE_DESCRIPTION';

export function updateNoteDesc(uuid, desc, parentsId) {
  return {
    type: UPDATE_NOTE_DESCRIPTION,
    uuid,
    desc,
    parentsId,
  };
}

export const SEARCH_NOTES = 'SEARCH_NOTES';

export function searchNotes(keyword) {
  return {
    type: SEARCH_NOTES,
    keyword,
  };
}

export const CLEAR_SEARCH_NOTES = 'CLEAR_SEARCH_NOTES';

export function clearSearchNotes() {
  return {
    type: CLEAR_SEARCH_NOTES,
  };
}

export const REMOVE_NOTE_PERMANENTLY = 'REMOVE_NOTE_PERMANENTLY';

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

export const REMOVE_NOTEBOOK_PERMANENTLY = 'REMOVE_NOTEBOOK_PERMANENTLY';

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

export const RESTORE_NOTE = 'RESTORE_NOTE';

export function restoreNote(parentsId, uuid) {
  return {
    type: RESTORE_NOTE,
    parentsId,
    uuid,
  };
}

export const RESTORE_NOTEBOOK = 'RESTORE_NOTEBOOK';

export function restoreNotebook(uuid) {
  return {
    type: RESTORE_NOTEBOOK,
    uuid,
  };
}

export const TRASH_CHOOSE_PROJECT = 'TRASH_CHOOSE_PROJECT';

export function chooseTrashProject(uuid, name) {
  return {
    type: TRASH_CHOOSE_PROJECT,
    uuid,
    name,
  };
}

export const TRASH_BACK_ROOT = 'TRASH_BACK_ROOT';

export function trashBack() {
  return {
    type: TRASH_BACK_ROOT,
  };
}

export const SAVE_NOTE_ON_KEYDOWN = 'SAVE_NOTE_ON_KEYDOWN';

export function saveNote(parentsId, uuid) {
  return {
    type: SAVE_NOTE_ON_KEYDOWN,
    parentsId,
    uuid,
  };
}

export const UPLOAD_NOTE_ONEDRIVE = 'UPLOAD_NOTE_ONEDRIVE';
export const UPLOAD_NOTE_ONEDRIVE_SUCCESS = 'UPLOAD_NOTE_ONEDRIVE_SUCCESS';
export const UPLOAD_NOTE_ONEDRIVE_FAILED = 'UPLOAD_NOTE_ONEDRIVE_FAILED';

export const UPDATE_NOTE_UPLOAD_STATUS = 'UPDATE_NOTE_UPLOAD_STATUS';
export function updateNoteUploadStatus(parentsId, uuid, status) {
  return {
    type: UPDATE_NOTE_UPLOAD_STATUS,
    parentsId,
    uuid,
    status,
  };
}

export const SAVE_NOTE_FROM_DRIVE = 'SAVE_NOTE_FROM_DRIVE';
