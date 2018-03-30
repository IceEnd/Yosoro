import { takeLatest, call, put } from 'redux-saga/effects';
import { message } from 'antd';
import {
  DRIVER_FETCHING_PROJECTS,
  DRIVER_FETCHING_PROJECRS_FAILED,
  DRIVER_FETCHING_PROJECRS_SUCCESS,
  DRIVER_FETCHING_NOTES,
  DRIVER_FETCHING_NOTES_SUCCESS,
  DRIVER_FETCHING_NOTES_FAILED,
  DRIVER_DOWNLOAD_NOTE,
  DRIVER_DOWNLOAD_NOTE_SUCCESS,
  DRIVER_DOWNLOAD_NOTE_FAILED,
} from '../actions/driver';
import { SAVE_NOTE_FROM_DRIVER } from '../actions/projects';
import * as db from '../utils/db/app';
import OneDriver from '../services/OneDriver';

const oneDriver = new OneDriver();

function* getToken(cloudDriver, driverType) {
  const tokens = db.getTokens();
  const { [driverType]: { token, refreshToken, expiresDate } } = tokens;
  let currentToken = token;
  if (Date.parse(new Date()) > expiresDate) { // token过期刷新token
    const refreshData = yield call(cloudDriver.refreshToken, refreshToken);
    const newToken = refreshData.access_token;
    const newRefreshToken = refreshData.refresh_token;
    const newExpiresDate = Date.parse(new Date()) + (refreshData.expires_in * 1000);
    currentToken = newToken;
    db.setToken(driverType, newToken, newRefreshToken, newExpiresDate);
  }
  return currentToken;
}

function* fetchProject(action) {
  const { driverName } = action;
  let cloudDriver;
  let driverType;
  if (driverName === 'onedriver') {
    cloudDriver = oneDriver;
    driverType = 'oneDriver';
  }
  try {
    const token = yield call(getToken, cloudDriver, driverType);
    const data = yield call(cloudDriver.getProjects, token);
    const list = data.value;
    if (!list) {
      throw new Error('Read result failed');
    }
    yield put({
      type: DRIVER_FETCHING_PROJECRS_SUCCESS,
      list,
    });
  } catch (ex) {
    message.error('Fetching failed');
    console.warn(ex);
    yield put({
      type: DRIVER_FETCHING_PROJECRS_FAILED,
    });
  }
}

function* fetchProjectList() {
  yield takeLatest(DRIVER_FETCHING_PROJECTS, fetchProject);
}

function* fetchNotes(action) {
  const { folder, driverName } = action;
  let cloudDriver;
  let driverType;
  if (driverName === 'onedriver') {
    cloudDriver = oneDriver;
    driverType = 'oneDriver';
  }
  try {
    const token = yield call(getToken, cloudDriver, driverType);
    const data = yield call(cloudDriver.getNotes, token, folder);
    const list = data.value;
    if (!list) {
      throw new Error('Read result failed');
    }
    yield put({
      type: DRIVER_FETCHING_NOTES_SUCCESS,
      list,
    });
  } catch (ex) {
    message.error('Fetching failed');
    console.warn(ex);
    yield put({
      type: DRIVER_FETCHING_NOTES_FAILED,
    });
  }
}

function* fetchNotesList() {
  yield takeLatest(DRIVER_FETCHING_NOTES, fetchNotes);
}

function* downloadNote(action) {
  const { folder, name, driverName } = action;
  let cloudDriver;
  let driverType;
  if (driverName === 'onedriver') {
    cloudDriver = oneDriver;
    driverType = 'oneDriver';
  }
  const infoName = `${name.replace(/.md$/ig, '')}.json`;
  try {
    const token = yield call(getToken, cloudDriver, driverType);
    const contentPromise = cloudDriver.getNoteContent(token, folder, name);
    const infoPromise = cloudDriver.getNoteContent(token, folder, infoName);
    const data = yield Promise.all([contentPromise, infoPromise]);
    const content = data[0];
    const info = JSON.parse(data[1]);
    yield put({
      type: SAVE_NOTE_FROM_DRIVER,
      folder,
      name: name.replace(/.md$/ig, ''),
      content,
      info,
      driverType,
    });
    yield put({
      type: DRIVER_DOWNLOAD_NOTE_SUCCESS,
    });
  } catch (ex) {
    message.error('Download note failed');
    console.warn(ex);
    yield put({
      type: DRIVER_DOWNLOAD_NOTE_FAILED,
    });
  }
}

function* handleDownloadNote() {
  yield takeLatest(DRIVER_DOWNLOAD_NOTE, downloadNote);
}

export default [
  fetchProjectList,
  fetchNotesList,
  handleDownloadNote,
];
