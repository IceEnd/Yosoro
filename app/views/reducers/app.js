import { remote } from 'electron';
import {
  APP_LOUNCH,
  APP_ADJUST_MARKDOWN,
  APP_SWITCH_EDIT_MODE,
  APP_SET_TOKEN,
  FETCHING_ONEDRIVE_TOKEN,
  FETCHING_ONEDRIVE_TOKEN_FAILED,
  FETCHING_ONEDRIVE_TOKEN_SUCCESS,
  FETCHING_GITHUB_RELEASES,
  FETCHING_GITHUB_RELEASES_FAILED,
  FETCHING_GITHUB_RELEASES_SUCCESS,
  CLOSE_UPDATE_NOTIFICATION,
  CHANGE_IMAGE_HOSTING,
  CHANGE_MEDIUM_CONFIG,
} from 'Actions/app';
import {
  checkDefaults,
  getAppSettings,
  setMarkdownSettings,
  setToken,
  getAppImageHosting,
  updateImageHosting,
  getAppMediumConfig,
  updateMediumConfig,
} from 'Utils/db/app';
import appInfo from '../../../package.json';
import { compareVersion } from '../utils/utils';

const assign = Object.assign;

const first = checkDefaults();

const initMediumConfig = getAppMediumConfig();
const initImageHosting = getAppImageHosting();
const initSettings = getAppSettings();
if (typeof initSettings.defaultDrive === 'undefined') {
  initSettings.defaultDrive = 'oneDrive';
}
if (initSettings.defaultDrive === 'oneDriver') {
  initSettings.defaultDrive = 'oneDrive';
}

export default function lounchApp(state = {
  status: 0, // 0: app 初始化 1: 初始化成功
  version: appInfo.version,
  latestVersion: '',
  versionFetchStatus: 0, // 0: 请求中 1: 请求成功 2: 请求失败
  showUpdate: false,
  allowShowUpdate: true,
  settings: initSettings,
  imageHostingConfig: initImageHosting,
  mediumConfig: initMediumConfig,
  first,
  oneDriveTokenStatus: 0, // 0 未请求 1 请求中 2 成功 3 失败
  platform: '',
}, action) {
  switch (action.type) {
    case APP_LOUNCH: {
      const platform = remote.getGlobal('process').platform;
      const app = {
        status: 1,
        platform,
      };
      return assign({}, state, app);
    }
    case APP_SWITCH_EDIT_MODE: {
      const { currentMode } = action;
      let mode = 'normal';
      switch (currentMode) {
        case 'normal':
          mode = 'edit';
          break;
        case 'edit':
          mode = 'preview';
          break;
        case 'preview':
          mode = 'immersion';
          break;
        case 'immersion':
          mode = 'normal';
          break;
        default:
          mode = 'normal';
          break;
      }
      const settings = state.settings;
      settings.editorMode = mode;
      // updateAppSettings(settings);
      const newState = assign({}, state, {
        settings,
      });
      return newState;
    }
    case APP_ADJUST_MARKDOWN: {
      const { param } = action;
      const settings = setMarkdownSettings(param);
      return assign({}, state, {
        settings,
      });
    }
    case APP_SET_TOKEN: {
      const { name, token } = action;
      setToken(name, token);
      return assign({}, state);
    }
    case FETCHING_ONEDRIVE_TOKEN:
      return assign({}, state, {
        oneDriveTokenStatus: 1,
      });
    case FETCHING_ONEDRIVE_TOKEN_FAILED:
      return assign({}, state, {
        oneDriveTokenStatus: 3,
      });
    case FETCHING_ONEDRIVE_TOKEN_SUCCESS: {
      const { token, refreshToken, expiresDate } = action;
      setToken('oneDriver', token, refreshToken, expiresDate);
      return assign({}, state, {
        oneDriveTokenStatus: 2,
      });
    }
    case FETCHING_GITHUB_RELEASES:
      return assign({}, state, {
        versionFetchStatus: 0,
        showUpdate: false,
      });
    case FETCHING_GITHUB_RELEASES_SUCCESS: {
      const { latestVersion } = action;
      const { allowShowUpdate, version } = state;
      const needUpdate = compareVersion(version, latestVersion);
      if (allowShowUpdate && needUpdate) {
        state.showUpdate = true;
      }
      return assign({}, state, {
        latestVersion,
        versionFetchStatus: 1,
      });
    }
    case FETCHING_GITHUB_RELEASES_FAILED:
      return assign({}, state, {
        versionFetchStatus: 2,
        showUpdate: false,
      });
    case CLOSE_UPDATE_NOTIFICATION:
      return assign({}, state, {
        allowShowUpdate: false,
      });
    case CHANGE_IMAGE_HOSTING: {
      const { name, param } = action;
      state.imageHostingConfig[name] = param;
      updateImageHosting(name, param);
      return assign({}, state);
    }
    case CHANGE_MEDIUM_CONFIG: {
      const { name, param } = action;
      state.mediumConfig[name] = param;
      updateMediumConfig(name, param);
      return assign({}, state, param);
    }
    default:
      return state;
  }
}
