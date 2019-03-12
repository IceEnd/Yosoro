import {
  put,
  call,
  takeEvery,
} from 'redux-saga/effects';
import { ipcRenderer } from 'electron';
import { blobToBase64, formatDate } from 'Utils/utils';

import {
  UPLOAD_IMAGE,
  UPLOAD_IMAGE_FAILED,
} from 'Actions/imageHosting';

function* handleUpload(action) {
  const { files, imageHostingConfig, from, uuid } = action;
  try {
    const base64 = yield call(blobToBase64, files);
    const name = `${formatDate(new Date(), 'upload')}-${files.name}`;
    ipcRenderer.send('pic-upload', {
      uuid,
      from,
      imageHostingConfig,
      files: {
        name,
        base64,
      },
    });
  } catch (ex) {
    console.warn(ex);
    yield put({
      type: UPLOAD_IMAGE_FAILED,
    });
  }
}

function* upload() {
  yield takeEvery(UPLOAD_IMAGE, handleUpload);
}

export default [
  upload,
];
