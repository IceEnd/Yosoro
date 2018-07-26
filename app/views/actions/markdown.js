export const READ_FILE = 'READING_FILE';

export function readFile(param) {
  return {
    type: READ_FILE,
    param,
  };
}

export const UPDATE_MARKDOWN_HTML = 'UPDATE_MARKDOWN_HTML';

export function updateMarkdownHtml(content, uuid, start) {
  return {
    type: UPDATE_MARKDOWN_HTML,
    content,
    uuid,
    start,
  };
}

export const BEFORE_SWITCH_SAVE = 'BEFORE_SWITCH_SAVE';

// 切换文件前对当前笔记进行保存
export function beforeSwitchSave(projectName, needUpdateCloudStatus) {
  return {
    type: BEFORE_SWITCH_SAVE,
    projectName,
    needUpdateCloudStatus,
  };
}

// 异步自动保存文件内容
export const AUTO_SAVE_CONTENT_TO_FILE = 'AUTO_SAVE_CONTENT_TO_FILE';

export const SAVE_CONTENT_TO_TRASH_FILE = 'SAVE_CONTENT_TO_TRASH_FILE';

export function saveContentToTrashFile(projectName) {
  return {
    type: SAVE_CONTENT_TO_TRASH_FILE,
    projectName,
  };
}

export const CLEAR_MARKDOWN = 'CLEAR_MARKDOWN';

// 清空markown内容
export function clearMarkdown() {
  return {
    type: CLEAR_MARKDOWN,
  };
}

export const UPDATE_CURRENT_MARKDOWN_TITLE = 'UPDATE_MARKDOWN_TITLE_CURRENT';

/**
 * @description 更新当前markdown标题
 *
 * @export
 * @param {any} uuid 文件uuid
 * @param {any} name 文件标题
 */
export function updateCurrentTitle(uuid, name) {
  return {
    type: UPDATE_CURRENT_MARKDOWN_TITLE,
    uuid,
    name,
  };
}

export const MARKDOWN_UPLOADING = 'MARKDOWN_UPLOADING';
export const MARKDWON_UPLADING_SUCCESS = 'MARKDWON_UPLADING_SUCCESS';
export const MARKDWON_UPLADING_FAILED = 'MARKDWON_UPLADING_FAILED';
export const JUST_UPDATE_MARKDWON_HTML = 'JUST_UPDATE_MARKDWON_HTML';
export const REPLACE_UPLOAD_IMAGE_TEXT = 'REPLACE_UPLOAD_IMAGE_TEXT';
