import { put, call, takeLatest } from 'redux-saga/effects';
import { message } from 'antd';
// import { ipcRenderer } from 'electron';
import {
  FETCHING_ONEDRIVER_TOKEN,
  FETCHING_ONEDRIVER_TOKEN_FAILED,
  FETCHING_ONEDRIVER_TOKEN_SUCCESS,
  FETCHING_GITHUB_RELEASES,
  FETCHING_GITHUB_RELEASES_FAILED,
  FETCHING_GITHUB_RELEASES_SUCCESS,
} from '../actions/app';

import OneDriver from '../services/OneDriver';
import CommonServices from '../services/CommonServices';

const oneDriver = new OneDriver();
const commonServices = new CommonServices();

function* oneDriverToken(action) {
  const { code } = action;
  try {
    const data = yield call(oneDriver.getTokenByCode, code);
    const token = data.access_token;
    const refreshToken = data.refresh_token;
    const expiresDate = Date.parse(new Date()) + (data.expires_in * 1000);
    yield put({ type: FETCHING_ONEDRIVER_TOKEN_SUCCESS, token, refreshToken, expiresDate });
  } catch (ex) {
    message.error('Auth failed');
    yield put({ type: FETCHING_ONEDRIVER_TOKEN_FAILED, error: ex });
  }
}

function* fetchingOneDriverToken() {
  yield takeLatest(FETCHING_ONEDRIVER_TOKEN, oneDriverToken);
}

function* handleReleaseFetch() {
  try {
    const latestVersion = yield call(commonServices.getLatestVersion);
    yield put({ type: FETCHING_GITHUB_RELEASES_SUCCESS, latestVersion });
  } catch (ex) {
    yield put({ type: FETCHING_GITHUB_RELEASES_FAILED, error: ex });
  }
}

function* getReleases() {
  yield takeLatest(FETCHING_GITHUB_RELEASES, handleReleaseFetch);
}

export default [
  fetchingOneDriverToken,
  getReleases,
];
