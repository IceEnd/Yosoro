import { takeLatest, call, put } from 'redux-saga/effects';
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
import { SAVE_NOTE_FROM_DRIVE } from '../actions/projects';
import * as db from '../utils/db/app';
import OneDrive from '../services/OneDrive';

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
    message.error('Fetching failed');
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
    message.error('Fetching failed');
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
  const { folder, name, driveName } = action;
  let cloudDrive;
  let driveType;
  if (driveName === 'onedriver') {
    cloudDrive = oneDrive;
    driveType = 'oneDriver';
  }
  const infoName = `${name.replace(/.md$/ig, '')}.json`;
  try {
    const token = yield call(getToken, cloudDrive, driveType);
    const contentPromise = cloudDrive.getNoteContent(token, folder, name);
    const infoPromise = cloudDrive.getNoteContent(token, folder, infoName);
    const data = yield Promise.all([contentPromise, infoPromise]);
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
  } catch (ex) {
    message.error('Download note failed');
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
  const { itemId, parentReference, driveName } = action;
  const { cloudDrive, driveType } = getDrive(driveName);
  try {
    let url = '';
    if (parentReference && parentReference.driveId) {
      url = `/drives/${encodeURIComponent(parentReference.driveId)}/items/${encodeURIComponent(itemId)}`;
    } else {
      url = `/me/drive/items/${itemId}`;
    }
    const token = yield call(getToken, cloudDrive, driveType);
    yield call(cloudDrive.deleteItem, token, url);
    debugger;
    yield put({
      type: DRIVE_DELETE_ITEM_SUCCESS,
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

export default [
  fetchProjectList,
  fetchNotesList,
  handleDownloadNote,
  handleDeleteItem,
];
