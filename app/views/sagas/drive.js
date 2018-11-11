import { takeLatest, call, put, all } from 'redux-saga/effects';
import { ipcRenderer } from 'electron';
import { message } from 'antd';
import {
  DRIVE_FETCHING_PROJECTS,
  DRIVE_FETCHING_PROJECRS_FAILED,
  DRIVE_FETCHING_PROJECRS_SUCCESS,
  DRIVE_FETCHING_NOTES,
  DRIVE_FETCHING_NOTES_SUCCESS,
  DRIVE_FETCHING_NOTES_FAILED,
  DRIVE_DOWNLOAD_NOTE,
  DRIVE_DOWNLOAD_NOTE_SUCCESS,
  DRIVE_DOWNLOAD_NOTE_FAILED,
  DRIVE_DELETE_ITEM,
  DRIVE_DELETE_ITEM_SUCCESS,
  DRIVE_DELETE_ITEM_FAILED,
} from '../actions/drive';
import {
  GET_USER_AVATAR,
  GET_USER_AVATAR_SUCCESS,
  GET_USER_AVATAR_FAILED,
} from '../actions/user';
import { SAVE_NOTE_FROM_DRIVE } from '../actions/projects';
import { JUST_UPDATE_MARKDWON_HTML } from '../actions/markdown';
import * as db from '../utils/db/app';
import OneDrive from '../services/OneDrive';
import { blobToBase64 } from '../utils/utils';

const oneDrive = new OneDrive();

function getDrive(driveName) {
  switch (driveName) {
    case 'onedriver':
      return {
        cloudDrive: oneDrive,
        driveType: 'oneDriver',
      };
    default:
      return {
        cloudDrive: oneDrive,
        driveType: 'oneDriver',
      };
  }
}

function* getToken(cloudDrive, driveType) {
  const tokens = db.getTokens();
  const { [driveType]: { token, refreshToken, expiresDate } } = tokens;
  let currentToken = token;
  if (Date.parse(new Date()) > expiresDate) { // token过期刷新token
    const refreshData = yield call(cloudDrive.refreshToken, refreshToken);
    const newToken = refreshData.access_token;
    const newRefreshToken = refreshData.refresh_token;
    const newExpiresDate = Date.parse(new Date()) + (refreshData.expires_in * 1000);
    currentToken = newToken;
    db.setToken(driveType, newToken, newRefreshToken, newExpiresDate);
  }
  return currentToken;
}

function* fetchProject(action) {
  const { driveName } = action;
  let cloudDrive;
  let driveType;
  if (driveName === 'onedriver') {
    cloudDrive = oneDrive;
    driveType = 'oneDriver';
  }
  try {
    const token = yield call(getToken, cloudDrive, driveType);
    const data = yield call(cloudDrive.getProjects, token);
    const list = data.value;
    if (!list) {
      throw new Error('Read result failed');
    }
    yield put({
      type: DRIVE_FETCHING_PROJECRS_SUCCESS,
      list,
    });
  } catch (ex) {
    message.error(ex.message || 'Failed to fetch.');
    console.warn(ex);
    yield put({
      type: DRIVE_FETCHING_PROJECRS_FAILED,
    });
  }
}

function* fetchProjectList() {
  yield takeLatest(DRIVE_FETCHING_PROJECTS, fetchProject);
}

function* fetchNotes(action) {
  const { folder, driveName } = action;
  let cloudDrive;
  let driveType;
  if (driveName === 'onedriver') {
    cloudDrive = oneDrive;
    driveType = 'oneDriver';
  }
  try {
    const token = yield call(getToken, cloudDrive, driveType);
    const data = yield call(cloudDrive.getNotes, token, folder);
    const list = data.value;
    if (!list) {
      throw new Error('Read result failed');
    }
    yield put({
      type: DRIVE_FETCHING_NOTES_SUCCESS,
      list,
    });
  } catch (ex) {
    message.error(ex.message || 'Failed to fetch.');
    console.warn(ex);
    yield put({
      type: DRIVE_FETCHING_NOTES_FAILED,
    });
  }
}

function* fetchNotesList() {
  yield takeLatest(DRIVE_FETCHING_NOTES, fetchNotes);
}

function* downloadNote(action) {
  const { folder, name, driveName, needUpdateEditor } = action;
  let cloudDrive;
  let driveType;
  if (driveName === 'onedriver') {
    cloudDrive = oneDrive;
    driveType = 'oneDriver';
  }
  const infoName = `${name.replace(/.md$/ig, '')}.json`;
  try {
    const token = yield call(getToken, cloudDrive, driveType);
    const contentPromise = call(cloudDrive.getNoteContent, token, folder, name);
    const infoPromise = call(cloudDrive.getNoteContent, token, folder, infoName);
    const data = yield all([contentPromise, infoPromise]);
    const content = data[0];
    const info = JSON.parse(data[1]);
    yield put({
      type: SAVE_NOTE_FROM_DRIVE,
      folder,
      name: name.replace(/.md$/ig, ''),
      content,
      info,
      driveType,
    });
    yield put({
      type: DRIVE_DOWNLOAD_NOTE_SUCCESS,
    });
    if (needUpdateEditor) { // 需要更新MarkDown编辑器
      yield put({
        type: JUST_UPDATE_MARKDWON_HTML,
        content,
      });
    }
  } catch (ex) {
    message.error(ex.message || 'Failed to Download.');
    console.warn(ex);
    yield put({
      type: DRIVE_DOWNLOAD_NOTE_FAILED,
    });
  }
}

function* handleDownloadNote() {
  yield takeLatest(DRIVE_DOWNLOAD_NOTE, downloadNote);
}


function* deleteItem(action) {
  const { itemId, parentReference, driveName, jsonItemId, deleteType } = action;
  const { cloudDrive, driveType } = getDrive(driveName);
  try {
    let url = '';
    let jsonUrl = '';
    if (parentReference && parentReference.driveId) {
      url = `/drives/${encodeURIComponent(parentReference.driveId)}/items/${encodeURIComponent(itemId)}`;
      if (deleteType === 'note') {
        jsonUrl = `/drives/${encodeURIComponent(parentReference.driveId)}/items/${encodeURIComponent(jsonItemId)}`;
      }
    } else {
      url = `/me/drive/items/${itemId}`;
      if (deleteType === 'note') {
        jsonUrl = `/me/drive/items/${encodeURIComponent(jsonItemId)}`;
      }
    }
    const token = yield call(getToken, cloudDrive, driveType);
    const deleteItemPromise = call(cloudDrive.deleteItem, token, url);
    const deleteJsonPromise = call(cloudDrive.deleteItem, token, jsonUrl);
    const queue = [deleteItemPromise];
    if (deleteType === 'note') {
      queue.push(deleteJsonPromise);
    }
    yield all(queue);
    yield put({
      type: DRIVE_DELETE_ITEM_SUCCESS,
      deleteType,
      itemId,
      jsonItemId,
    });
  } catch (ex) {
    message.error('delete failed');
    yield put({
      type: DRIVE_DELETE_ITEM_FAILED,
    });
  }
}

function* handleDeleteItem() {
  yield takeLatest(DRIVE_DELETE_ITEM, deleteItem);
}

// 获取用户头像
function* getUserAvatar(action) {
  const { driveName } = action;
  let cloudDrive;
  let driveType;
  if (driveName === 'oneDrive') {
    cloudDrive = oneDrive;
    driveType = 'oneDriver';
  }
  try {
    const token = yield call(getToken, cloudDrive, driveType);
    const data = yield call(cloudDrive.getUserAvatar, token);
    const base64 = yield call(blobToBase64, data);
    const avatar = ipcRenderer.sendSync('save-user-avatar', base64);
    yield put({
      type: GET_USER_AVATAR_SUCCESS,
      avatar: avatar.url,
    });
  } catch (ex) {
    console.warn(ex);
    yield put({
      type: GET_USER_AVATAR_FAILED,
    });
  }
}

function* handleGetUserAvatar() {
  yield takeLatest(GET_USER_AVATAR, getUserAvatar);
}

export default [
  fetchProjectList,
  fetchNotesList,
  handleDownloadNote,
  handleDeleteItem,
  handleGetUserAvatar,
];
