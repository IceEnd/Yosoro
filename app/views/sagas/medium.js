import {
  put,
  call,
  takeEvery,
  takeLatest,
} from 'redux-saga/effects';
import Medium from 'Services/Medium';

import {
  CHANGE_MEDIUM_AUTH,
  AUTH_MEDIUM,
  AUTH_MEDIUM_SUCCESS,
  AUTH_MEDIUM_FAILED,
  POST_MEDIUM,
  POST_MEDIUM_SUCCESS,
  POST_MEDIUM_FAILED,
} from 'Actions/medium';

import Notification from 'Components/share/Notification';

const authMediumFailed = new Notification({
  title: 'Auth Medium failed',
  body: 'Please check the token',
  key: 'auth-medium-failed-notification',
});

const authMediumSuccess = new Notification({
  title: 'Auth Medium success',
  body: 'Authentication Medium success',
  key: 'auth-medium-success-notification',
});

const postMediumFailed = new Notification({
  title: 'Post Medium failed',
  body: 'Post Medium failed',
  key: 'post-medium-success-notification',
});

const postMediumSuccess = new Notification({
  title: 'Post Medium success',
  body: 'Post Medium success',
  key: 'post-medium-success-notification',
});

const mediumservices = new Medium();

function* handleAuth(action) {
  const { token, publishStatus } = action;
  try {
    const res = yield call(mediumservices.getUser, token);
    authMediumSuccess.show();
    const mediumUser = res.data;
    mediumUser.token = token;
    mediumUser.publishStatus = publishStatus;
    yield put({
      type: AUTH_MEDIUM_SUCCESS,
      medium: mediumUser,
    });
    yield put({
      type: CHANGE_MEDIUM_AUTH,
      name: 'medium',
      param: mediumUser,
    });
  } catch (ex) {
    console.warn(ex);
    authMediumFailed.show();
    yield put({
      type: AUTH_MEDIUM_FAILED,
    });
  }
}

function* auth() {
  yield takeEvery(AUTH_MEDIUM, handleAuth);
}

function* handlePost(action) {
  const { title, markdown } = action;
  try {
    const res = yield call(mediumservices.postMarkdown, title, markdown);
    postMediumSuccess.show();
    yield put({
      type: POST_MEDIUM_SUCCESS,
      res,
    });
  } catch (ex) {
    console.warn(ex);
    postMediumFailed.show();
    yield put({
      type: POST_MEDIUM_FAILED,
    });
  }
}

function* post() {
  yield takeLatest(POST_MEDIUM, handlePost);
}

export default [
  auth,
  post,
];
