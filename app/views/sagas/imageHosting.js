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
  UPLOAD_IMAGE_SUCCESS,
} from 'Actions/imageHosting';

import {
  REPLACE_UPLOAD_IMAGE_TEXT,
} from 'Actions/markdown';
import Notification from 'Components/share/Notification';

const uploadNotification = new Notification({
  title: 'Image upload failed',
  body: 'Please check the network or configuration',
  key: 'editor-upload-notification',
});

const successNotification = new Notification({
  title: 'Image upload success',
  body: 'Image has been upladed by Yosoro',
  key: 'upload-image-success-notification',
});

function* handleUpload(action) {
  const { files, imageHostingConfig, from, uuid } = action;
  try {
    const base64 = yield call(blobToBase64, files);
    const name = `${formatDate(new Date(), 'upload')}-${files.name}`;
    const res = ipcRenderer.sendSync('pic-upload', {
      imageHostingConfig,
      files: {
        name,
        base64,
      },
    });
    if (res.code !== 0) {
      throw res.data;
    }
    const data = res.data;
    successNotification.show();
    if (from === 'editor') {
      yield put({
        type: REPLACE_UPLOAD_IMAGE_TEXT,
        data,
        uuid,
      });
    }
    yield put({
      type: UPLOAD_IMAGE_SUCCESS,
      data,
      uuid,
    });
  } catch (ex) {
    console.warn(ex);
    uploadNotification.show();
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
