import {
  // put, call,
  takeEvery,
} from 'redux-saga/effects';
import GitHub from 'Services/GitHub';

import {
  UPLOAD_IMAGE,
  // UPLOAD_IMAGE_FAILED,
  // UPLOAD_IMAGE_SUCCESS,
} from 'Actions/imageHosting';

const github = new GitHub();

function* handleUpload(action) {
  const { files, current } = action;
  let services;
  if (current === 'github') {
    services = github;
  }
  yield services.upload(files);
}

function* upload() {
  yield takeEvery(UPLOAD_IMAGE, handleUpload);
}

export default [
  upload,
];
