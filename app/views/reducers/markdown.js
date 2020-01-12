import { ipcRenderer } from 'electron';
import {
  READ_FILE,
  UPDATE_MARKDOWN_CONTENT,
  BEFORE_SWITCH_SAVE,
  CLEAR_MARKDOWN,
  UPDATE_CURRENT_MARKDOWN_TITLE,
  SAVE_CONTENT_TO_TRASH_FILE,
  MARKDOWN_UPLOADING,
  MARKDWON_UPLADING_SUCCESS,
  MARKDWON_UPLADING_FAILED,
  JUST_UPDATE_MARKDWON_HTML,
  REPLACE_UPLOAD_IMAGE_TEXT,
} from '../actions/markdown';
import { updateFileInfo } from '../utils/db/app';
import { eventMD } from '../events/eventDispatch';

const assign = Object.assign;

const initState = {
  parentsId: '',
  uuid: '',
  name: '',
  createDate: '',
  latestDate: '',
  content: '',
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
      return assign({}, info, {
        status: 1,
        start: -1,
        hasEdit: false,
        uploadStatus: 0,
      });
    }
    case JUST_UPDATE_MARKDWON_HTML: {
      const { content } = action;
      return assign({}, state, {
        content,
      });
    }
    case UPDATE_MARKDOWN_CONTENT: {
      let hasEdit = true;
      if (state.uuid !== action.uuid) {
        hasEdit = false;
      }
      return assign(state, {
        content: action.content,
        start: action.start,
        hasEdit,
      });
    }
    case BEFORE_SWITCH_SAVE: { // 切换笔记前保存当前笔记
      const { projectName, needUpdateCloudStatus } = action;
      const { content, name, status, uuid } = state;
      if (status === 0 || status === 2) { // 不用保存
        return state;
      }
      const data = ipcRenderer.sendSync('NOTES:save-content-to-file', {
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
      updateFileInfo(uuid, param);
      if (!data.success) {
        console.error('Save file failed.');
      }
      return assign({}, state);
    }
    case SAVE_CONTENT_TO_TRASH_FILE: { // 删除文件后将内容保存至草稿箱
      const { projectName } = action;
      const { content, name } = state;
      const data = ipcRenderer.sendSync('NOTES:save-content-to-trash-file', {
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
      const { target } = action;
      if (uuid === '' || uuid === '-1' || uuid !== target) { // 不更新
        return state;
      }
      return assign({}, state, {
        uploadStatus: 1,
      });
    }
    case MARKDWON_UPLADING_SUCCESS: {
      const { uuid } = state;
      state.hasEdit = false;
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
    case REPLACE_UPLOAD_IMAGE_TEXT: { // 替换上传后的图片文本
      const { data } = action;
      if (data) {
        const { name, url, uuid } = data;
        const reg = new RegExp(`!\\[Uploading\\s*${uuid}\\s*\\]\\s*\\(\\w*\\)`, 'ig');
        state.content = state.content.replace(reg, `![${name}](${url})`);
        setTimeout(() => {
          eventMD.emit('sync-value');
        }, 0);
        return assign({}, state);
      }
      return state;
    }
    default:
      return state;
  }
}

export default updateMarkdown;
