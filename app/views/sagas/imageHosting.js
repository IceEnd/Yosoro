import {
  // put, call,
  takeEvery,
} from 'redux-saga/effects';
import GitHub from 'Services/Github';

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
  try {
    const res = yield services.upload(files);
    console.log(res);
  } catch (ex) {
    console.warn(ex);
  }
}

function* upload() {
  yield takeEvery(UPLOAD_IMAGE, handleUpload);
}

export default [
  upload,
];
