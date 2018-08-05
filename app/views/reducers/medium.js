import {
  CHANGE_MEDIUM_AUTH,
  AUTH_MEDIUM,
  AUTH_MEDIUM_SUCCESS,
  AUTH_MEDIUM_FAILED,
  POST_MEDIUM,
  POST_MEDIUM_SUCCESS,
  POST_MEDIUM_FAILED,
} from 'Actions/medium';

import {
  getAppMediumConfig,
  updateMediumConfig,
} from 'Utils/db/app';
import { remote } from 'electron';

const { shell } = remote;

const initMediumAuth = getAppMediumConfig();
const assign = Object.assign;

function medium(state = initMediumAuth, action) {
  switch (action.type) {
    case CHANGE_MEDIUM_AUTH: {
      const { param } = action;
      updateMediumConfig(param);
      return assign({}, state, param);
    }
    case AUTH_MEDIUM:
      return state;
    case AUTH_MEDIUM_SUCCESS: {
      state.medium = action.medium;
      return assign({}, state);
    }
    case AUTH_MEDIUM_FAILED:
      return state;
    case POST_MEDIUM:
      return state;
    case POST_MEDIUM_SUCCESS: {
      shell.openExternal(action.postUrl);
      return assign({}, state);
    }
    case POST_MEDIUM_FAILED:
      return state;
    default:
      return state;
  }
}

export default medium;
