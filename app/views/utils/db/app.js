import uuidv4 from 'uuid/v4';
import DB from './DB';

const db = new DB();

const SETTINGS = 'yosoroSettings';
const PROJECTS = 'yosoroProjects';
const FILES = 'yosoroFiles';
const OAUTHTOKEN = 'yosoroOAuthToken';
const IMAGE_HOSTING = 'yosoroImageHosting';
const MEDIUM_CONFIG = 'yosoroMediumConfig';

/**
 * @description 设置默认配置
 */
export function setDefaults() {
  db.set(SETTINGS, {
    theme: 'light',
    editorMode: 'normal',
    markdownSettings: {
      editorWidth: 0.5,
    },
    defaultDriver: 'oneDrive',
    editor: {
      fontSize: 14,
      previewFontSize: 16,
      cursorPosition: false, // 是否根据光标定位
    },
  });
  db.set(OAUTHTOKEN, {
    oneDrive: '',
  });
  db.set(PROJECTS, []);
  db.set(FILES, []);
}

/**
 * @description 检查本地信息是否初始化
 */
export function checkDefaults() {
  const projects = db.has(PROJECTS).value();
  const settings = db.has(SETTINGS).value();
  const notes = db.has(FILES).value();
  const oauth = db.has(OAUTHTOKEN).value();
  const imageHosting = db.has(IMAGE_HOSTING).value();
  const mediumConfig = db.has(MEDIUM_CONFIG).value();
  if (!projects) {
    db.set(PROJECTS, []);
  }
  if (!notes) {
    db.set(FILES, []);
  }
  if (!oauth) {
    db.set(OAUTHTOKEN, {
      oneDriver: {
        token: '',
        refreshToken: '',
        expiresDate: 0,
      },
    });
  }
  if (!settings) {
    db.set(SETTINGS, {
      theme: 'light',
      editorMode: 'normal',
      markdownSettings: {
        editorWidth: 0.5,
      },
      defaultDrive: 'oneDrive',
    });
  }
  if (!imageHosting) {
    db.set(IMAGE_HOSTING, {
      default: 'github',
      github: {
        repo: '',
        branch: '',
        token: '',
        path: '',
        domain: '',
      },
    });
  }
  if (!mediumConfig) {
    db.set(MEDIUM_CONFIG, {
      medium: {
        id: '',
        username: '',
        token: '',
        url: '',
        imageUrl: '',
        publishStatus: 'draft',
      },
    });
  }
  return projects && settings && notes && oauth && imageHosting;
}

/**
 * @description 读取app settings
 */
export function getAppSettings() {
  const settings = db.get(SETTINGS).value();
  return settings;
}

export function getAppImageHosting() {
  return db.get(IMAGE_HOSTING).value();
}

/**
 * 获取Medium配置
 * @export
 */
export function getAppMediumConfig() {
  return db.get(MEDIUM_CONFIG).value();
}

/**
 * 更新Medium配置
 * @export
 * @param {Object} param 详细配置
 */
export function updateMediumConfig(name, param) {
  const config = db.get(MEDIUM_CONFIG).value();
  config[name] = param;
  db.set(MEDIUM_CONFIG, config);
}

/**
 * 更新图床配置
 *
 * @export
 * @param {String} name 图床名称
 * @param {Object} param 详细配置
 */
export function updateImageHosting(name, param) {
  const config = db.get(IMAGE_HOSTING).value();
  config[name] = param;
  db.set(IMAGE_HOSTING, config);
}

/**
 * @description 更新App Settings
 * @param {Object} settings 设置
 */
export function updateAppSettings(settings) {
  db.set(SETTINGS, settings);
}

/**
 * @description
 */
export function getUploadData() {
  const notes = db.get(FILES)
    .find({ status: 1 })
    .value() || [];
  const projects = db.get(PROJECTS)
    .find({ status: 1 })
    .value() || [];
  return {
    projects,
    notes,
  };
}

/**
 * @description 读取项目信息
 */
export function getProjectList() {
  const notes = db.get(FILES).value() || [];
  const data = db.get(PROJECTS).value() || [];
  const trashProjects = [];
  const projects = [];
  const dLength = data.length;
  const nLength = notes.length;
  const hash = {};
  const trashHash = {};
  for (let i = 0; i < dLength; i++) { // 利用hash存储
    data[i].notes = [];
    if (data[i].status === 1) {
      hash[data[i].uuid] = projects.length;
      projects.push(data[i]);
    } else {
      trashHash[data[i].uuid] = trashProjects.length;
      trashProjects.push(data[i]);
    }
  }
  for (let i = 0; i < nLength; i++) {
    const { parentsId } = notes[i];
    if (notes[i].status === 1) {
      projects[hash[parentsId]].notes.unshift(notes[i]);
    } else {
      if (typeof trashHash[parentsId] === 'undefined') {
        trashHash[parentsId] = trashProjects.length;
        const p = Object.assign({}, projects[hash[parentsId]]);
        p.notes = [];
        trashProjects.push(p);
      }
      trashProjects[trashHash[parentsId]].notes.unshift(notes[i]);
    }
  }
  return {
    projects,
    trashProjects,
    hash,
    trashHash,
  };
}

/**
 * @description 读取笔记列表
 */
export function getFilesList() {
  return db.get(FILES).value() || [];
}

/**
 * @description 新建项目
 * @param {String} name - 项目名称
 * @param {Date} createDate - 创建时间
 */
export function createProject(name, createDate) {
  const uuid = uuidv4();
  const project = {
    uuid,
    name,
    createDate,
    description: '',
    labels: [],
    status: 1, // 有效
  };
  db.get(PROJECTS)
    .push(project)
    .write();
  return project;
}

/**
 * @description 新建笔记文件
 * @param {Object} param
 * @param {String} param.name - 文件名称
 * @param {String} param.file - 文件路径
 * @param {Date} param.createDate - 创建时间
 * @param {String} param.parentsId - 所属项目uuid
 */
export function createFile(param) {
  const uuid = uuidv4();
  const { name, createDate, parentsId } = param;
  let labels = [];
  let description = '';
  let oneDriver = 0;
  if (typeof param.labels !== 'undefined') {
    labels = param.labels;
  }
  if (typeof param.description !== 'undefined') {
    description = param.description;
  }
  if (typeof param.oneDriver !== 'undefined') {
    oneDriver = param.oneDriver;
  }
  const note = {
    uuid,
    name,
    createDate,
    latestDate: createDate,
    parentsId,
    labels,
    description,
    status: 1, // 有效
    oneDriver, // 0: 未上传过 1: 有修改但未上传 2: 上传中 3：已经上传 4: 上传失败
  };
  db.get(FILES)
    .push(note)
    .write();
  return note;
}

export function setMarkdownSettings(param) {
  const settings = db.get(SETTINGS).value();
  const newSettings = Object.assign({}, settings, {
    markdownSettings: param,
  });
  db.set(SETTINGS, newSettings);
  return newSettings;
}

/**
 * @description 删除项目
 *
 * @export
 * @param {any} uuid - 项目uuid
 */
export function deleteProject(uuid) {
  db.get(PROJECTS)
    .find({ uuid })
    .assign({ status: 0 })
    .write();
  db.get(FILES)
    .find({ parentsId: uuid })
    .assign({ status: 0 })
    .write();
}

/**
 * @description 项目重命名更新localStorage
 *
 * @export
 * @param {any} uuid 项目uuid
 * @param {any} name 项目新名称
 */
export function renameProject(uuid, name) {
  db.get(PROJECTS)
    .find({ uuid })
    .assign({
      name,
    })
    .write();
}

/**
 * @description 笔记重命名更新localStorage
 *
 * @export
 * @param {any} uuid 项目uuid
 * @param {any} name 项目新名称
 */
export function renameNote(uuid, name) {
  db.get(FILES)
    .find({ uuid })
    .assign({
      name,
    })
    .write();
}


/**
 * @description 删除笔记
 * @param {String} uuid 笔记uuid
 */
export function deleteNote(uuid) {
  db.get(FILES)
    .find({ uuid })
    .assign({ status: 0 })
    .write();
}

/**
 * @description 更新笔记信息
 * @export
 * @param {String} uuid 笔记uuid
 * @param {Object} param 信息
 */
export function updateNoteInfo(uuid, param) {
  db.get(FILES)
    .find({ uuid })
    .assign(param)
    .write();
}

/**
 * @description 查找文档
 * @export
 * @param {String} keyword 关键字
 */
export function dbSearchNotes(keyword) {
  const reg = new RegExp(keyword, 'ig');
  const regList = ['name', 'description'];
  const notes = db.get(FILES).search(regList, reg).value() || [];
  const data = db.get(PROJECTS).find({ status: 1 }).value() || [];
  const dLength = data.length;
  const nLength = notes.length;
  const hash = {};
  const resHash = {};
  const result = [];
  for (let i = 0; i < dLength; i++) {
    hash[data[i].uuid] = i;
  }
  for (let i = 0; i < nLength; i++) {
    const item = notes[i];
    const parentsId = item.parentsId;
    if (!resHash[parentsId]) { // 不存在project
      resHash[parentsId] = result.length;
      const project = data[hash[parentsId]];
      project.notes = [];
      result.push(data[hash[parentsId]]);
    }
    result[resHash[parentsId]].notes.push(item);
  }
  return result;
}

/**
 * @description 永久删除笔记
 * @param {Object} param 匹配删除的笔记
 */
export function dbRemoveNote(param) {
  db.get(FILES)
    .remove(param)
    .write();
}

/**
 * @description 还原被删除笔记
 * @param {String} uuid 笔记uuid
 */
export function dbRestoreNote(uuid) {
  db.get(FILES)
    .find({
      uuid,
      status: 0,
    })
    .assign({
      status: 1,
    })
    .write();
}

/**
 * @description 永久删除笔记本
 * @export
 * @param {any} param 匹配删除的笔记本
 */
export function dbRemoveProject(param) {
  db.get(PROJECTS)
    .remove(param)
    .write();
}

export function dbUpdateNote(param, info) {
  db.get(FILES)
    .find(param)
    .assign(info)
    .write();
}

export function dbUpdateNotebook(param, info) {
  db.get(PROJECTS)
    .find(param)
    .assign(info)
    .write();
}

export function dbUpdateProject(param, info) {
  db.get(PROJECTS)
    .find(param)
    .assign(info)
    .write();
}

export function getTokens() {
  const tokens = db.get(OAUTHTOKEN)
    .value();
  return tokens;
}

export function setTokens(param) {
  db.set(OAUTHTOKEN, param);
}

export function setToken(name, token, refreshToken, expiresDate) {
  const tokens = Object.assign({}, db.get(OAUTHTOKEN).value(), {
    [name]: {
      token,
      refreshToken,
      expiresDate,
    },
  });
  db.set(OAUTHTOKEN, tokens);
}

export function getNote(uuid) {
  const notes = db.get(FILES)
    .find({ uuid })
    .value() || [];
  if (notes.length === 0) {
    return null;
  }
  return notes[0];
}

/**
 * 设置编辑器
 *
 * @param {String} target 目标
 * @param {Number} value
 */
export function updateEditorSettings(target, value) {
  const settings = db.get(SETTINGS).value();
  if (settings.editor) {
    settings.editor[target] = value;
  } else {
    settings.editor = {
      [target]: value,
    };
  }
  db.set(SETTINGS, settings);
}
