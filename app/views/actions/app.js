export const GET_APP_INFO = 'APP_GET_INFO';
export const APP_LOAD_FIRST = 'APP_LOAD_FIRST';
export const APP_LOUNCH_DEFAULT = 'APP_LOUNCH_DEFAULT';
export const APP_LOUNCH = 'APP_LOUNCH';

export function appLounch() {
  return {
    type: APP_LOUNCH,
  };
}

export function appLoadFirst() {
  return {
    type: APP_LOAD_FIRST,
  };
}

export function appLounchDefault() {
  return {
    type: APP_LOUNCH_DEFAULT,
  };
}

export function appLounched() {
  return {
    type: APP_LOUNCH,
  };
}

export const APP_ADJUST_MARKDOWN = 'APP_ADJUST_MARKDOWN';

export function appMarkdownAdjust(param) {
  return {
    type: APP_ADJUST_MARKDOWN,
    param,
  };
}

export const APP_SWITCH_EDIT_MODE = 'APP_SWITCH_EDIT_MODE';

export function appSwitchEditMode(mode, fromApp = false) {
  return {
    type: APP_SWITCH_EDIT_MODE,
    mode,
    fromApp,
  };
}

export const APP_SET_TOKEN = 'APP_SET_TOKEN';

export function setToken(name, token) {
  return {
    type: APP_SET_TOKEN,
    name,
    token,
  };
}

export const FETCHING_ONEDRIVE_TOKEN = 'FETCHING_ONEDRIVE_TOKEN';
export const FETCHING_ONEDRIVE_TOKEN_FAILED = 'FETCHING_ONEDRIVE_TOKEN_FAILED';
export const FETCHING_ONEDRIVE_TOKEN_SUCCESS = 'FETCHING_ONEDRIVE_TOKEN_SUCCESS';

export const ONEDRIVE_ALL_UPLOAD = 'ONEDRIVE_ALL_UPLOAD';
export const ONEDRIVE_ALL_UPLOAD_SUCCESS = 'ONEDRIVE_ALL_UPLOAD_SUCCESS';
export const ONEDRIVE_ALL_UPLOAD_FAILED = 'ONEDRIVE_ALL_UPLOAD_FAILED';

export const FETCHING_GITHUB_RELEASES = 'FETCHING_GITHUB_RELEASES';
export const FETCHING_GITHUB_RELEASES_FAILED = 'FETCHING_GITHUB_RELEASES_FAILED';
export const FETCHING_GITHUB_RELEASES_SUCCESS = 'FETCHING_GITHUB_RELEASES_SUCCESS';
export const CLOSE_UPDATE_NOTIFICATION = 'CLOSE_UPDATE_NOTIFICATION';

export const CHANGE_IMAGE_HOSTING = 'CHANGE_IMAGE_HOSTING';

export const CHANGE_MEDIUM_CONFIG = 'CHANGE_MEDIUM_CONFIG';

export const CHANGE_EDITOR_SETTINGS = 'CHANGE_EDITOR_SETTINGS';
