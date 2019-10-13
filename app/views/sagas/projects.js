import { put, call, takeLatest, all } from 'redux-saga/effects';
import { ipcRenderer } from 'electron';
import { message } from 'antd';
import {
  UPLOAD_NOTE_ONEDRIVE,
  UPLOAD_NOTE_ONEDRIVE_SUCCESS,
  UPLOAD_NOTE_ONEDRIVE_FAILED,
  GET_PROJECT_LIST,
  GET_PROJECT_LIST_SUCCESS,
  // GET_PROJECT_LIST_FAIL,
} from 'Actions/projects';
import {
  MARKDWON_UPLADING_SUCCESS,
  MARKDWON_UPLADING_FAILED,
} from 'Actions/markdown';
import * as db from 'Utils/db/app';
// import { sendIPC } from 'Utils/complex';
import OneDrive from '../services/OneDrive';

const oneDrive = new OneDrive();

function* oneDriveUpload(action) {
  const { param, toolbar } = action;
  const { uuid, name, projectName, projectUuid } = param;
  let content;
  let labels;
  let description;
  try {
    // yield put({ type: MARKDOWN_UPLOADING });
    if (typeof param.content === 'undefined') {
      const data = ipcRenderer.sendSync('NOTES:read-file', {
        projectName,
        fileName: name,
      });
      if (data.success) {
        content = data.data;
      } else {
        throw new Error('Read file content failed');
      }
    } else {
      content = param.content;
    }
    if (typeof param.labels === 'undefined' || typeof param.description === 'undefined') {
      const note = db.getNote(uuid);
      if (note) {
        labels = note.labels;
        description = note.description;
      } else {
        throw new Error('Can not find note in localStorage.');
      }
    } else {
      labels = param.labels;
      description = param.description;
    }
    const tokens = db.getTokens();
    const { oneDriver: { token, refreshToken, expiresDate } } = tokens;
    let currentToken = token;
    if (Date.parse(new Date()) > expiresDate) { // token过期刷新token
      const refreshData = yield call(oneDrive.refreshToken, refreshToken);
      const newToken = refreshData.access_token;
      const newRefreshToken = refreshData.refresh_token;
      const newExpiresDate = Date.parse(new Date()) + (refreshData.expires_in * 1000);
      currentToken = newToken;
      db.setToken('oneDrive', newToken, newRefreshToken, newExpiresDate);
    }
    // 上传文件
    yield call(oneDrive.uploadSingleFile, currentToken, `/drive/special/approot:/${projectName}/${name}.md:/content`, content);
    // 上传文件信息
    yield call(oneDrive.uploadSingleFile, currentToken, `/drive/special/approot:/${projectName}/${name}.json:/content`, JSON.stringify({
      description,
      labels,
    }));
    yield put({
      type: UPLOAD_NOTE_ONEDRIVE_SUCCESS,
      param: {
        uuid,
        projectUuid,
      },
    });
    if (toolbar) {
      yield put({
        type: MARKDWON_UPLADING_SUCCESS,
      });
    }
  } catch (ex) {
    message.error('Upload failed.');
    console.error(ex);
    yield put({
      type: UPLOAD_NOTE_ONEDRIVE_FAILED,
      param: {
        uuid,
        projectUuid,
      },
      error: ex,
    });
    if (toolbar) {
      yield put({
        type: MARKDWON_UPLADING_FAILED,
      });
    }
  }
}

function* getProject() {
  if (db.checkProjects()) {
    // get data from localStorage
    const payload = db.getProjectList();
    yield put({
      type: GET_PROJECT_LIST_SUCCESS,
      payload,
    });
    return;
  }
}

export default function* saga() {
  yield all([
    takeLatest(UPLOAD_NOTE_ONEDRIVE, oneDriveUpload),
    takeLatest(GET_PROJECT_LIST, getProject),
  ]);
}
