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
  getAppMediumAuth,
  updateMediumAuth,
} from 'Utils/db/app';

const initMediumAuth = getAppMediumAuth();
const assign = Object.assign;

function medium(state = initMediumAuth, action) {
  switch (action.type) {
    case CHANGE_MEDIUM_AUTH: {
      const { name, param } = action;
      state[name] = param;
      updateMediumAuth(name, param);
      return assign({}, state);
    }
    case AUTH_MEDIUM:
      return state;
    case AUTH_MEDIUM_SUCCESS: {
      state.medium.token = action.medium.token;
      state.medium.username = action.medium.username;
      state.medium.id = action.medium.id;
      state.medium.url = action.medium.url;
      state.medium.imageUrl = action.medium.imageUrl;
      return assign({}, state);
    }
    case AUTH_MEDIUM_FAILED:
      return state;
    case POST_MEDIUM:
      return state;
    case POST_MEDIUM_SUCCESS: {
      return assign({}, state);
    }
    case POST_MEDIUM_FAILED:
      return state;
    default:
      return state;
  }
}

export default medium;
