// import lunr from 'lunr';
import { ipcRenderer } from 'electron';
import { message } from 'antd';
import {
  GET_PROJECT_LIST,
  GET_PROJECT_LIST_SUCCESS,
  GET_PROJECT_LIST_FAIL,
  CREATE_PROJECT,
  CREATE_FILE,
  DELETE_PROJECT,
  RENAME_PROJECT,
  RENAME_FILE,
  DELETE_FILE,
  UPDATE_FILE_DESCRIPTION,
  SEARCH_NOTES,
  CLEAR_SEARCH_NOTES,
  REMOVE_NOTE_PERMANENTLY,
  REMOVE_NOTEBOOK_PERMANENTLY,
  RESTORE_NOTE,
  RESTORE_NOTEBOOK,
  TRASH_CHOOSE_PROJECT,
  TRASH_BACK_ROOT,
  SAVE_FILE_ON_KEYDOWN,
  UPLOAD_NOTE_ONEDRIVE,
  UPLOAD_NOTE_ONEDRIVE_SUCCESS,
  UPLOAD_NOTE_ONEDRIVE_FAILED,
  UPDATE_NOTE_UPLOAD_STATUS,
  SAVE_NOTE_FROM_DRIVE,
  TOGGLE_FOLDER_EXPANEDED_KEYS,
  SWITCH_PROJECT,
  SWITCH_FILE,
  CLEAR_NOTE,
  CLEAR_NOTE_WORKSCAPE,
  UPDATE_NOTE_PROJECTNAME,
  UPDATE_NOTE_FILENAME,
} from '../actions/projects';
import {
  // getProjectList,
  updateProjects,
  createProject,
  createFile,
  deleteProject,
  renameProject,
  renameFile,
  deleteNote,
  updateFileInfo,
  dbSearchNotes,
  dbRemoveNote,
  dbRemoveProject,
  dbRestoreNote,
  dbUpdateNote,
  dbUpdateNotebook,
  getNote,
} from '../utils/db/app';
import { getFolderByPos } from '../utils/utils';

const assign = Object.assign;

function projectReducer(state = {
  status: 0, // 0: request 1: success 2: failed
  projects: [],
  trashProjects: [],
  notes: [],
  hash: {}, // del
  trashHash: {}, // del
  trash: {
    projectUuid: '-1',
    projectName: '',
  },
  searchResult: [],
  searchStatus: 0, // 0：normal 1: search
  expandedKeys: ['root'],
  projectUuid: '-1',
  fileUuid: '-1',
  pos: '',
}, action) {
  switch (action.type) {
    case TRASH_CHOOSE_PROJECT: {
      const { uuid, name } = action;
      state.trash = {
        projectName: name,
        projectUuid: uuid,
      };
      return assign({}, state);
    }
    case TRASH_BACK_ROOT: {
      state.trash = {
        projectUuid: '-1',
        projectName: '',
      };
      return assign({}, state);
    }
    case GET_PROJECT_LIST: {
      state.status = 0;
      return state;
      // const { projects, trashProjects, hash, trashHash } = getProjectList();
      // return assign({}, {
      //   projects,
      //   trashProjects,
      //   hash,
      //   trashHash,
      //   searchResult: [],
      //   searchStatus: 0, // 0：normal 1: search
      //   trash: {
      //     projectUuid: '-1',
      //     projectName: '',
      //   },
      // });
    }
    case GET_PROJECT_LIST_SUCCESS: {
      const { projects, trashProjects, hash, trashHash, notes } = action.payload;
      return assign({}, state, {
        status: 1,
        projects,
        trashProjects,
        hash,
        trashHash,
        notes,
        // searchResult: [],
        // searchStatus: 0, // 0：normal 1: search
        // trash: {
        //   projectUuid: '-1',
        //   projectName: '',
        // },
      });
    }
    case GET_PROJECT_LIST_FAIL: {
      state.status = 2;
      return state;
    }
    case CREATE_PROJECT: {
      const { pos, uuid, name } = action;
      // get path
      const { projects, expandedKeys } = state;
      const { head, path } = getFolderByPos(projects, pos);
      const res = ipcRenderer.sendSync('NOTES:create-project', `${path}/${name}`);
      if (res.success) {
        const newFolder = createProject(name);
        if (uuid === 'root') {
          head.push(newFolder);
        } else {
          if (!head.children) {
            head.children = [];
          }
          head.children.push(newFolder);
        }
        updateProjects(projects);
        // expand node
        const set = new Set(expandedKeys);
        set.add(uuid);
        state.expandedKeys = Array.from(set);
        return assign({}, state);
      }
      const error = res.error;
      if (error.errno === -17) { // 文件夹存在
        message.error('folder is exists.');
      } else {
        message.error('Create folder failed.');
      }
      return state;
    }
    case RENAME_PROJECT: { // 对项目进行重命名
      const { uuid, name, pos } = action;
      const { head, path } = getFolderByPos(state.projects, pos);
      if (head.uuid !== uuid) {
        return state;
      }
      const res = ipcRenderer.sendSync('NOTES:rename-project', {
        oldName: path,
        newName: path.replace(new RegExp(`${head.name}$`), name),
      });
      if (res.success) {
        head.name = name;
        updateProjects(state.projects);
        return assign({}, state);
      }
      message.error('Rename failed.');
      return state;
    }
    case DELETE_PROJECT: {
      /**
       * 删除文件夹方案：
       * 1. 将整个文件夹移动到trash目录下，并用uuid进行命名（方便恢复）
       * 2. 将当前uuid状态设置为垃圾状态
       *
       * 永久删除直接删除uuid命名的文件夹，并清理数据
       */
      const { uuid, pos } = action;
      const { head, path } = getFolderByPos(state.projects, pos);
      const res = ipcRenderer.sendSync('NOTES:move-project-to-trash', {
        uuid,
        folder: path,
      });
      if (res.success) {
        head.status = -1;
        updateProjects(state.projects);
        if (state.projectUuid === uuid) {
          state.projectUuid = '-1';
          state.fileUuid = '-1';
        }
        return assign({}, state);
      }
      message.error('Delete Failed.');
      return state;
    }
    case TOGGLE_FOLDER_EXPANEDED_KEYS: {
      const { expandedKeys, flag } = action;
      if (Array.isArray(expandedKeys)) {
        state.expandedKeys = expandedKeys;
      } else if (typeof expandedKeys === 'string') {
        const set = new Set(state.expandedKeys);
        if (flag === 'remove') {
          set.remove(expandedKeys);
        } else {
          set.add(expandedKeys);
        }
        state.expandedKeys = Array.from(set);
      }
      return assign({}, state);
    }
    case CREATE_FILE: { // 创建笔记
      const { param } = action;
      const file = createFile(param);
      state.notes.unshift(file);
      return assign({}, state);
    }
    case RENAME_FILE: { // 对笔记进行重命名
      const { uuid, name } = action;
      renameFile(uuid, name);
      const target = state.notes.find(item => item.uuid === uuid);
      target.name = name;
      state.notes = [...state.notes];
      return state;
    }
    case DELETE_FILE: {
      const { uuid } = action;
      deleteNote(uuid);
      const res = state.notes.filter(item => item.uuid === uuid);
      if (res.length > 0) {
        res[0].status = 0;
      }
      state.notes = [...state.notes];
      return assign({}, state);
    }
    case UPDATE_FILE_DESCRIPTION: { // 更新笔记描述
      const { uuid, desc } = action;
      const param = {
        description: desc,
      };
      updateFileInfo(uuid, param);
      const target = state.notes.find(item => item.uuid === uuid);
      target.description = desc;
      target.customDesc = true;
      state.notes = [...state.notes];
      return state;
    }
    case SEARCH_NOTES: {
      const { keyword } = action;
      const searchResult = dbSearchNotes(keyword);
      state.searchResult = searchResult;
      state.searchStatus = 1;
      return assign({}, state);
    }
    case CLEAR_SEARCH_NOTES: {
      state.searchResult = [];
      state.searchStatus = 0;
      return assign({}, state);
    }
    case REMOVE_NOTE_PERMANENTLY: { // 永久删除笔记
      const { parentsUuid, uuid } = action;
      const { trashHash } = state;
      dbRemoveNote({
        uuid,
        status: 0,
        parentsId: parentsUuid,
      });
      const notes = state.trashProjects[trashHash[parentsUuid]].notes.filter(item => item.uuid !== uuid);
      state.trashProjects[trashHash[parentsUuid]].notes = notes;
      return assign({}, state);
    }
    case REMOVE_NOTEBOOK_PERMANENTLY: { // 永久删除笔记本
      const { uuid } = action;
      const { trashHash } = state;
      dbRemoveNote({
        parentsId: uuid,
        status: 0,
      });
      dbRemoveProject({
        uuid,
        status: 0,
      });
      const arr = state.trashProjects;
      const length = arr.length;
      let index = 0;
      for (let i = 0; i < length; i++) {
        if (arr[i].uuid === uuid) {
          index = i;
          break;
        }
      }
      arr.splice(index, 1);
      state.trashProjects = arr;
      delete trashHash[uuid];
      state.trashHash = trashHash;
      return assign({}, state);
    }
    case RESTORE_NOTE: { // 还原笔记
      const { parentsId, uuid } = action;
      const { hash, trashHash } = state;
      const targetTrashProject = assign({}, state.trashProjects[trashHash[parentsId]]);
      const tNotes = [...[], ...targetTrashProject.notes];
      const tnLength = tNotes.length;
      let tnIndex = 0;
      let targetNote;
      for (let i = 0; i < tnLength; i++) {
        if (uuid === tNotes[i].uuid) {
          tnIndex = i;
          targetNote = assign({}, tNotes[i], {
            status: 1,
          });
          break;
        }
      }
      tNotes.splice(tnIndex, 1);
      if (typeof hash[parentsId] === 'undefined') { // 不存在对应项目
        const { projects } = state;
        let pOverwrite = false;
        const pLength = projects.length;
        let targetProject;
        for (let i = 0; i < pLength; i++) {
          if (targetTrashProject.name === projects[i].name) {
            pOverwrite = true;
            targetProject = projects[i];
            break;
          }
        }
        if (pOverwrite) { // 重写废纸篓项目
          const trashIndex = trashHash[parentsId];
          state.trashProjects[trashHash[parentsId]] = assign({}, state.trashProjects[trashHash[parentsId]], {
            uuid: targetProject.uuid,
            description: targetProject.description,
            createDate: targetProject.createDate,
            labels: targetProject.labels,
          });
          dbRemoveProject({
            uuid: parentsId,
            status: 0,
          });
          state.trashProjects[trashHash[parentsId]].notes = tNotes; // 更新笔记列表
          delete trashHash[parentsId];
          trashHash[targetProject.uuid] = trashIndex; // 更新 trashHash
          state.trashHash = trashHash;
          state.trash.projectUuid = targetProject.uuid;
          const tpNotes = targetProject.notes;
          const tpnLength = tpNotes.length;
          let tpnIndex;
          let tpnOverwrite = false;
          for (let i = 0; i < tpnLength; i++) {
            if (tpNotes[i].name === targetNote.name) {
              tpnOverwrite = true;
              tpnIndex = i;
              break;
            }
          }
          if (tpnOverwrite) { // 覆盖笔记
            const oldContent = assign({}, targetNote);
            dbRemoveNote({
              uuid: targetNote.uuid,
              status: 0,
            });
            oldContent.uuid = tpNotes[tpnIndex].uuid;
            tpNotes[tpnIndex] = assign({}, oldContent);
          } else { // 插入笔记
            // dbRestoreNote(uuid);
            dbUpdateNote({
              uuid,
              status: 0,
            }, {
              parentsId: targetProject.uuid,
              status: 1,
            });
            tpNotes.push(targetNote);
          }
          dbUpdateNote({ // 更新废纸篓笔记列表 parentsId
            parentsId,
            status: 0,
          }, {
            parentsId: targetProject.uuid,
          });
          state.projects[hash[targetProject.uuid]].notes = tpNotes;
        } else { // 导出项目文件夹 和指定笔记
          state.trashProjects[trashHash[parentsId]].notes = tNotes;
          const newProject = assign({}, targetTrashProject, {
            status: 1,
          });
          newProject.notes = [targetNote];
          state.hash[newProject.uuid] = state.projects.length;
          state.projects.push(newProject);
          dbUpdateNotebook({
            uuid: parentsId,
            status: 0,
          }, {
            status: 1,
          });
          dbRestoreNote(uuid);
        }
      } else {
        state.trashProjects[trashHash[parentsId]].notes = tNotes;
        const pNotes = state.projects[hash[parentsId]].notes;
        const pnLength = pNotes.length;
        let pnIndex;
        let overwrite = false;
        for (let i = 0; i < pnLength; i++) {
          if (pNotes[i].name === targetNote.name) {
            overwrite = true;
            pnIndex = i;
            break;
          }
        }
        if (overwrite) {
          const oldContent = assign({}, targetNote);
          dbRemoveNote({
            uuid: targetNote.uuid,
            status: 0,
          });
          oldContent.uuid = pNotes[pnIndex].uuid;
          pNotes[pnIndex] = assign({}, oldContent);
        } else {
          dbRestoreNote(uuid);
          pNotes.push(targetNote);
        }
        state.projects[hash[parentsId]].notes = pNotes;
      }
      return assign({}, state);
    }
    case RESTORE_NOTEBOOK: { // 还原笔记本
      const { uuid } = action;
      const { hash, trashHash } = state;
      const targetTrashProject = assign({}, state.trashProjects[trashHash[uuid]]);
      if (typeof hash[uuid] === 'undefined') {
        const projects = state.projects;
        let targetProject;
        const pLength = projects.length;
        let tragetProjectIndex;
        let pOverwrite = false;
        for (let i = 0; i < pLength; i++) {
          if (projects[i].name === targetTrashProject.name) {
            pOverwrite = true;
            targetProject = projects[i];
            tragetProjectIndex = i;
            break;
          }
        }
        if (pOverwrite) { // 需要对项目进行重写，对笔记进行合并
          const pInfo = {
            description: targetTrashProject.description,
            labels: targetTrashProject.labels,
          };
          const newProject = assign({}, targetProject, pInfo);
          const tNotes = targetTrashProject.notes;
          const pNotes = targetProject.notes;
          const tnLength = tNotes.length;
          const pnLength = pNotes.length;
          const newNotes = [...[], ...pNotes];
          dbUpdateNotebook({
            uuid: targetProject.uuid,
          }, pInfo);
          // 删除旧的项目信息
          dbRemoveProject({
            uuid: targetTrashProject.uuid,
            status: 0,
          });
          const targetTrashIndex = trashHash[uuid];
          state.trashProjects.splice(targetTrashIndex, 1);
          delete trashHash[uuid];
          state.trashHash = trashHash;
          for (let i = 0; i < tnLength; i++) {
            let nOverwrite = false;
            let targetNoteIndex;
            for (let j = 0; j < pnLength; j++) {
              if (tNotes[i].uuid === pNotes[j].uuid || tNotes[i].name === pNotes[j].name) {
                nOverwrite = true;
                targetNoteIndex = j;
                break;
              }
            }
            if (nOverwrite) { // cover 未删除笔记
              const info = {
                description: tNotes[i].description,
                labels: tNotes[i].labels,
                status: 1,
              };
              newNotes[targetNoteIndex] = assign({}, newNotes[targetNoteIndex], info);
              // 删除原来的笔记记录
              dbRemoveNote({
                uuid: tNotes[i].uuid,
              });
            } else { // 插入笔记
              newNotes.push(assign({}, tNotes[i], {
                status: 1,
              }));
              // 更新note所属项目
              dbUpdateNote({
                uuid: tNotes[i].uuid,
                status: 0,
              }, {
                status: 1,
                parentsId: targetProject.uuid,
              });
            }
          }
          newProject.notes = newNotes;
          state.projects[tragetProjectIndex] = newProject;
        } else {
          // 完全回复笔记本
          state.hash[uuid] = state.projects.length;
          targetTrashProject.notes = targetTrashProject.notes.map((note) => {
            note.status = 1;
            return note;
          });
          targetTrashProject.status = 1;
          state.projects.push(targetTrashProject);
          const targetTrashIndex = trashHash[uuid];
          state.trashProjects.splice(targetTrashIndex, 1);
          delete trashHash[uuid];
          state.trashHash = trashHash;
          dbUpdateNotebook({
            uuid,
            status: 0,
          }, {
            status: 1,
          });
          dbUpdateNote({
            parentsId: uuid,
            status: 0,
          }, {
            status: 1,
          });
        }
      } else {
        const tNotes = targetTrashProject.notes;
        const pNotes = state.projects[hash[uuid]].notes;
        const tnLength = tNotes.length;
        const pnLength = pNotes.length;
        const newNotes = [...[], ...pNotes];
        for (let i = 0; i < tnLength; i++) {
          let nOverwrite = false;
          let targetNoteIndex;
          for (let j = 0; j < pnLength; j++) {
            if (tNotes[i].uuid === pNotes[j].uuid || tNotes[i].name === pNotes[j].name) {
              nOverwrite = true;
              targetNoteIndex = j;
              break;
            }
          }
          if (nOverwrite) { // cover 未删除笔记
            const info = {
              description: tNotes[i].description,
              labels: tNotes[i].labels,
              status: 1,
            };
            newNotes[targetNoteIndex] = assign({}, newNotes[targetNoteIndex], info);
            // 删除原来的笔记记录
            dbRemoveNote({
              uuid: tNotes[i].uuid,
            });
          } else { // 插入笔记
            newNotes.push(assign({}, tNotes[i], {
              status: 1,
            }));
            dbRestoreNote(tNotes[i].uuid);
          }
        }
        state.projects[hash[uuid]].notes = newNotes;
        const targetTrashIndex = trashHash[uuid];
        state.trashProjects.splice(targetTrashIndex, 1);
        delete trashHash[uuid];
        state.trashHash = trashHash;
      }
      return assign({}, state);
    }
    case SAVE_FILE_ON_KEYDOWN: {
      const { uuid, content, desc } = action;
      const { notes, projects, pos } = state;
      const target = notes.find(item => item.uuid === uuid);
      let needUpdateCloudStatus = false;
      if (target && target.oneDriver !== 0) {
        needUpdateCloudStatus = true;
      }
      const date = (new Date()).valueOf();
      target.latestDate = date;
      if (needUpdateCloudStatus) {
        target.oneDriver = 1;
      }
      if (!target.customDesc) {
        target.description = desc;
      }
      state.notes = [...state.notes];
      updateFileInfo(uuid, target);
      const head = getFolderByPos(projects, pos);
      ipcRenderer.send('NOTES:auto-save-content-to-file', {
        file: `${head.path}/${target.name}.md`,
        content,
      });
      return assign({}, state);
    }
    case UPLOAD_NOTE_ONEDRIVE: {
      const { param: { uuid, projectUuid } } = action;
      const notes = state.projects[state.hash[projectUuid]].notes.map((note) => {
        if (note.uuid === uuid) {
          note.oneDriver = 2;
        }
        return note;
      });
      state.projects[state.hash[projectUuid]].notes = notes;
      dbUpdateNote({ uuid }, { oneDriver: 2 });
      return assign({}, state);
    }
    case UPLOAD_NOTE_ONEDRIVE_SUCCESS: { // 单个笔记上传成功
      const { param: { uuid, projectUuid } } = action;
      const notes = state.projects[state.hash[projectUuid]].notes.map((note) => {
        if (note.uuid === uuid) {
          note.oneDriver = 3;
        }
        return note;
      });
      state.projects[state.hash[projectUuid]].notes = notes;
      dbUpdateNote({ uuid }, { oneDriver: 3 });
      return assign({}, state);
    }
    case UPLOAD_NOTE_ONEDRIVE_FAILED: {
      const { param: { uuid, projectUuid } } = action;
      const notes = state.projects[state.hash[projectUuid]].notes.map((note) => {
        if (note.uuid === uuid) {
          note.oneDriver = 4;
        }
        return note;
      });
      state.projects[state.hash[projectUuid]].notes = notes;
      dbUpdateNote({ uuid }, { oneDriver: 4 });
      return assign({}, state);
    }
    case UPDATE_NOTE_UPLOAD_STATUS: {
      const { uuid, parentsId, status } = action;
      const notes = state.projects[state.hash[parentsId]].notes.map((note) => {
        if (note.uuid === uuid) {
          note.oneDriver = status;
        }
        return note;
      });
      state.projects[state.hash[parentsId]].notes = notes;
      return assign({}, state);
    }
    case SAVE_NOTE_FROM_DRIVE: { // 保存从云端下载的笔记
      const { folder, name, content, info, driveType } = action;
      const { projects } = state;
      let needCreateProject = true;
      let targetProject;
      let targetProjectIndex = 0;
      const pLength = projects.length;
      for (let i = 0; i < pLength; i++) {
        if (projects[i].name === folder) {
          needCreateProject = false;
          targetProjectIndex = i;
          targetProject = assign({}, projects[i]);
          break;
        }
      }
      if (needCreateProject) { // 需要创建项目 和 笔记
        const createDate = (new Date()).toString();
        const newProject = createProject(folder, createDate);
        const fileInfo = {
          name,
          parentsId: newProject.uuid,
          labels: info.labels,
          description: info.description,
          createDate,
          [driveType]: 3,
        };
        const file = createFile(fileInfo);
        newProject.notes = [file];
        state.hash[newProject.uuid] = state.projects.length;
        state.projects.push(newProject);
      } else { // 不需要新建项目
        let createNote = true;
        let targetNote = null;
        let targetNoteIndex = 0;
        const notes = [...[], ...targetProject.notes];
        const nLength = notes.length;
        for (let i = 0; i < nLength; i++) {
          if (notes[i].name === name) {
            createNote = false;
            targetNoteIndex = i;
            targetNote = assign({}, notes[i]);
            break;
          }
        }
        if (createNote) { // 需要创建笔记
          const createDate = (new Date()).toString();
          const fileInfo = {
            name,
            parentsId: targetProject.uuid,
            labels: info.labels,
            description: info.description,
            createDate,
            [driveType]: 3,
          };
          const file = createFile(fileInfo);
          targetProject.notes.unshift(file);
          state.projects[targetProjectIndex] = targetProject;
        } else { // 不需要创建笔记
          const newNote = assign({}, targetNote, info, { [driveType]: 3 });
          state.projects[targetProjectIndex].notes[targetNoteIndex] = newNote;
        }
      }
      ipcRenderer.sendSync('NOTES:save-content-to-file', {
        content,
        projectName: folder,
        fileName: name,
      });
      return assign({}, state);
    }
    case SWITCH_PROJECT: {
      const { uuid, pos } = action;
      return assign({}, state, {
        projectUuid: uuid,
        pos,
      });
    }
    case SWITCH_FILE:
      return assign({}, state, {
        fileUuid: action.uuid,
      });
    case CLEAR_NOTE:
      return assign({}, state, {
        fileUuid: '-1',
      });
    case CLEAR_NOTE_WORKSCAPE:
      return assign({}, {
        projectUuid: '-1',
        fileUuid: '-1',
        pos: '',
      });
    case UPDATE_NOTE_PROJECTNAME: {
      const { name } = action;
      return assign({}, state, {
        projectName: name,
      });
    }
    case UPDATE_NOTE_FILENAME: {
      const { name } = action;
      return assign({}, state, {
        fileName: name,
      });
    }
    default:
      return state;
  }
}

export default projectReducer;
