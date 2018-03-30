import { put, call, takeLatest } from 'redux-saga/effects';
import { message } from 'antd';
// import { ipcRenderer } from 'electron';
import {
  FETCHING_ONEDRIVER_TOKEN,
  FETCHING_ONEDRIVER_TOKEN_FAILED,
  FETCHING_ONEDRIVER_TOKEN_SUCCESS,
} from '../actions/app';

import OneDriver from '../services/OneDriver';

const oneDriver = new OneDriver();

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

export default [
  fetchingOneDriverToken,
];
