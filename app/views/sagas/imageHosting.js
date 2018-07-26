import {
  put,
  call,
  takeEvery,
} from 'redux-saga/effects';
import GitHub from 'Services/GitHub';

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

const github = new GitHub();

function* handleUpload(action) {
  const { files, current, from, uuid } = action;
  let services;
  if (current === 'github') {
    services = github;
  }
  try {
    const res = yield call(services.upload, files);
    successNotification.show();
    if (from === 'editor') {
      yield put({
        type: REPLACE_UPLOAD_IMAGE_TEXT,
        res,
        uuid,
      });
    }
    yield put({
      type: UPLOAD_IMAGE_SUCCESS,
      res,
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
