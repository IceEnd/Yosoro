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
  const { files, current } = action;
  let services;
  if (current === 'github') {
    services = github;
  }
  try {
    const res = yield call(services.upload(files));
    yield put({
      type: UPLOAD_IMAGE_SUCCESS,
      res,
    });
    successNotification.show();
  } catch (ex) {
    console.warn(ex);
    yield put({
      type: UPLOAD_IMAGE_FAILED,
    });
    uploadNotification.show();
  }
}

function* upload() {
  yield takeEvery(UPLOAD_IMAGE, handleUpload);
}

export default [
  upload,
];
