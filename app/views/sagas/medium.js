import {
  put,
  call,
  takeEvery,
  takeLatest,
  all,
} from 'redux-saga/effects';
import Medium from 'Services/Medium';

import {
  CHANGE_MEDIUM_CONFIG,
} from 'Actions/app';

import {
  AUTH_MEDIUM,
  AUTH_MEDIUM_SUCCESS,
  AUTH_MEDIUM_FAILED,
  POST_MEDIUM,
  POST_MEDIUM_SUCCESS,
  POST_MEDIUM_FAILED,
  SIGN_OUT_MEDIUM,
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
  body: 'Please check your medium config',
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
      type: CHANGE_MEDIUM_CONFIG,
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

function* handlePost(action) {
  const { title, markdown } = action;
  try {
    const res = yield call(mediumservices.postMarkdown, title, markdown);
    postMediumSuccess.show();
    const postData = res.data;
    yield put({
      type: POST_MEDIUM_SUCCESS,
      postUrl: postData.url,
    });
  } catch (ex) {
    console.warn(ex);
    postMediumFailed.show();
    yield put({
      type: POST_MEDIUM_FAILED,
    });
  }
}

function* handleSignOut() {
  const mediumUser = {
    id: '',
    username: '',
    token: '',
    url: '',
    imageUrl: '',
    publishStatus: 'draft',
  };
  yield put({
    type: CHANGE_MEDIUM_CONFIG,
    name: 'medium',
    param: mediumUser,
  });
}

export default function* () {
  yield all([
    takeLatest(SIGN_OUT_MEDIUM, handleSignOut),
    takeLatest(POST_MEDIUM, handlePost),
    takeEvery(AUTH_MEDIUM, handleAuth),
  ]);
}
