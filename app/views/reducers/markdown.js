import marked from 'marked';
import { ipcRenderer } from 'electron';
import {
  READ_FILE,
  UPDATE_MARKDOWN_HTML,
  BEFORE_SWITCH_SAVE,
  CLEAR_MARKDOWN,
  UPDATE_CURRENT_MARKDOWN_TITLE,
  SAVE_CONTENT_TO_TRASH_FILE,
  MARKDOWN_UPLOADING,
  MARKDWON_UPLADING_SUCCESS,
  MARKDWON_UPLADING_FAILED,
  // READ_FILE_SUCCESS,
  // READ_FILE_FARILED,
} from '../actions/markdown';
import { updateNoteInfo } from '../utils/db/app';

const renderer = new marked.Renderer();

renderer.listitem = function (text) {
  let res = text;
  if (/^\s*\[[x ]\]\s*/.test(text)) {
    res = text.replace(/^\s*\[ \]\s*/, '<input class="task-list-item-checkbox" type="checkbox" disabled></input> ').replace(/^\s*\[x\]\s*/, '<input class="task-list-item-checkbox" checked disabled type="checkbox"></input> ');
    return `<li class="task-list-li">${res}</li>`;
  }
  return `<li>${text}</li>`;
};

marked.setOptions({
  renderer,
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: false,
  smartLists: true,
  smartypants: false,
  highlight: (code) => {
    const value = require('../utils/highlight.min.js').highlightAuto(code).value;
    return value;
  },
});

const assign = Object.assign;

const initState = {
  parentsId: '',
  uuid: '',
  // file: '',
  name: '',
  createDate: '',
  latestDate: '',
  content: '',
  html: '',
  status: 0, // 0 ：无 1：读取成功 2：读取失败
  start: -1,
  oneDriver: 0,
  hasEdit: false,
  uploadStatus: 0, // 0: 无 1：上传中 2：上传成功 3：上传失败
};

function updateMarkdown(state = initState, action) {
  switch (action.type) {
    case READ_FILE: {
      const info = action.param;
      const html = marked(info.content);
      info.html = html;
      // let uploadStatus = 0;
      // if (info.oneDriver === 2) {
      //   uploadStatus = 1;
      // }
      return assign({}, info, {
        status: 1,
        start: -1,
        hasEdit: false,
        uploadStatus: 0,
      });
    }
    case UPDATE_MARKDOWN_HTML: {
      const html = marked(action.content);
      return assign({}, state, {
        content: action.content,
        html,
        start: action.start,
        hasEdit: true,
      });
    }
    case BEFORE_SWITCH_SAVE: { // 切换笔记前保存当前笔记
      const { projectName, needUpdateCloudStatus } = action;
      const { content, name, status, uuid } = state;
      if (status === 0 || status === 2) { // 不用保存
        return state;
      }
      const data = ipcRenderer.sendSync('save-content-to-file', {
        content,
        projectName,
        fileName: name,
      });
      const date = new Date();
      state.latestDate = date;
      const param = {
        latestDate: date,
      };
      if (needUpdateCloudStatus) {
        param.oneDriver = 1;
      }
      updateNoteInfo(uuid, param);
      if (!data.success) {
        console.error('Save file failed.');
      }
      return assign({}, state);
    }
    case SAVE_CONTENT_TO_TRASH_FILE: { // 删除文件后将内容保存至草稿箱
      const { projectName } = action;
      const { content, name } = state;
      const data = ipcRenderer.sendSync('save-content-to-trash-file', {
        content,
        projectName,
        name,
      });
      if (!data.success) {
        console.error('Save file failed.');
      }
      return state;
    }
    case UPDATE_CURRENT_MARKDOWN_TITLE: {
      const { uuid, name } = action;
      if (state.uuid !== uuid) {
        return state;
      }
      return assign({}, state, {
        name,
      });
    }
    case CLEAR_MARKDOWN:
      return assign({}, initState);
    case MARKDOWN_UPLOADING: {
      const { uuid } = state;
      if (uuid === '' || uuid === '-1') { // 不更新
        return state;
      }
      return assign({}, state, {
        uploadStatus: 1,
      });
    }
    case MARKDWON_UPLADING_SUCCESS: {
      const { uuid } = state;
      if (uuid === '' || uuid === '-1') { // 不更新
        return state;
      }
      return assign({}, state, {
        uploadStatus: 2,
      });
    }
    case MARKDWON_UPLADING_FAILED: {
      const { uuid } = state;
      if (uuid === '' || uuid === '-1') { // 不更新
        return state;
      }
      return assign({}, state, {
        uploadStatus: 3,
      });
    }
    default:
      return state;
  }
}

export default updateMarkdown;
