import {
  APP_LOUNCH,
  APP_ADJUST_MARKDOWN,
  APP_SWITCH_EDIT_MODE,
  APP_SET_TOKEN,
  FETCHING_ONEDRIVER_TOKEN,
  FETCHING_ONEDRIVER_TOKEN_FAILED,
  FETCHING_ONEDRIVER_TOKEN_SUCCESS,
  // ONEDRIVER_ALL_UPLOAD,
  // ONEDRIVER_ALL_UPLOAD_SUCCESS,
  // ONEDRIVER_ALL_UPLOAD_FAILED,
} from '../actions/app';
import appInfo from '../../../package.json';
import { checkDefaults, getAppSettings, setMarkdownSettings, setToken } from '../utils/db/app';

const assign = Object.assign;

export default function lounchApp(state = {
  status: 0, // 0: app 初始化 1: 初始化成功
  version: '',
  settings: {
    theme: 'light',
    editorMode: 'normal',
    markdownSettings: {
      editorWidth: 0.5,
    },
    defaultDriver: 'oneDriver',
  },
  first: false,
  oneDriverTokenStatus: 0, // 0 未请求 1 请求中 2 成功 3 失败
}, action) {
  switch (action.type) {
    case APP_LOUNCH: {
      const flag = checkDefaults();
      if (!flag) { // 判断是否进行过初始化
        state.first = true;
      }
      const settings = getAppSettings();
      if (typeof settings.defaultDriver === 'undefined') {
        settings.defaultDriver = 'oneDriver';
      }
      const app = {
        status: 1,
        version: appInfo.version,
        settings,
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
    case FETCHING_ONEDRIVER_TOKEN:
      return assign({}, state, {
        oneDriverTokenStatus: 1,
      });
    case FETCHING_ONEDRIVER_TOKEN_FAILED:
      return assign({}, state, {
        oneDriverTokenStatus: 3,
      });
    case FETCHING_ONEDRIVER_TOKEN_SUCCESS: {
      const { token, refreshToken, expiresDate } = action;
      setToken('oneDriver', token, refreshToken, expiresDate);
      return assign({}, state, {
        oneDriverTokenStatus: 2,
      });
    }
    default:
      return state;
  }
}
