// import lunr from 'lunr';
import { ipcRenderer } from 'electron';
import {
  GET_PROJECT_LIST,
  CREATE_PROJECT,
  CREATE_FILE,
  DELETE_PROJECT,
  RENAME_PROJECT,
  RENAME_NOTE,
  DELETE_NOTE,
  UPDATE_NOTE_DESCRIPTION,
  SEARCH_NOTES,
  CLEAR_SEARCH_NOTES,
  REMOVE_NOTE_PERMANENTLY,
  REMOVE_NOTEBOOK_PERMANENTLY,
  RESTORE_NOTE,
  RESTORE_NOTEBOOK,
  TRASH_CHOOSE_PROJECT,
  TRASH_BACK_ROOT,
  SAVE_NOTE_ON_KEYDOWN,
  UPLOAD_NOTE_ONEDRIVE,
  UPLOAD_NOTE_ONEDRIVE_SUCCESS,
  UPLOAD_NOTE_ONEDRIVE_FAILED,
  UPDATE_NOTE_UPLOAD_STATUS,
  SAVE_NOTE_FROM_DRIVE,
} from '../actions/projects';
import {
  getProjectList,
  createProject,
  createFile,
  deleteProject,
  renameProject,
  renameNote,
  deleteNote,
  updateNoteInfo,
  dbSearchNotes,
  dbRemoveNote,
  dbRemoveProject,
  dbRestoreNote,
  dbUpdateNote,
  dbUpdateNotebook,
  getNote,
} from '../utils/db/app';

const assign = Object.assign;

// const assign = Object.assign;

function projectReducer(state = {
  projects: [],
  trashProjects: [],
  hash: {},
  trashHash: {},
  trash: {
    projectUuid: '-1',
    projectName: '',
  },
  searchResult: [],
  searchStatus: 0, // 0：normal 1: search
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
      const { projects, trashProjects, hash, trashHash } = getProjectList();
      return assign({}, {
        projects,
        trashProjects,
        hash,
        trashHash,
        searchResult: [],
        searchStatus: 0, // 0：normal 1: search
        trash: {
          projectUuid: '-1',
          projectName: '',
        },
      });
    }
    case CREATE_PROJECT: { // 创建项目
      const { param: { name, createDate } } = action;
      const project = createProject(name, createDate);
      project.notes = [];
      state.hash[project.uuid] = state.projects.length;
      state.projects.push(project);
      return assign({}, state);
    }
    case CREATE_FILE: { // 创建笔记
      const { param, param: { parentsId } } = action;
      const file = createFile(param);
      const hash = state.hash;
      state.projects[hash[parentsId]].notes.unshift(file);
      return assign({}, state);
    }
    case DELETE_PROJECT: { // 删除项目
      const { uuid, onlyDelete } = action;
      deleteProject(uuid);
      const { hash, trashHash } = state;
      const project = state.projects[hash[uuid]];
      state.projects.splice(hash[uuid], 1);
      const newHash = {};
      const pl = state.projects.length;
      for (let i = 0; i < pl; i++) {
        newHash[state.projects[i].uuid] = i;
      }
      // delete hash[uuid];
      state.hash = newHash;
      if (onlyDelete) { // 仅仅删除
        return assign({}, state);
      }
      if (typeof trashHash[uuid] === 'undefined') {
        const { trashProjects } = state;
        let tIndex = 0;
        const tpLength = trashProjects.length;
        let overwrite = false;
        let targetProject;
        for (let i = 0; i < tpLength; i++) {
          if (trashProjects[i].name === project.name) {
            tIndex = i;
            targetProject = trashProjects[i];
            overwrite = true;
            break;
          }
        }
        if (overwrite) { // 去重: 覆盖， 合并
          dbRemoveProject({
            uuid: targetProject.uuid,
            status: 0,
          });
          const pNotes = project.notes;
          const tNotes = targetProject.notes;
          const pnLength = pNotes.length;
          const tnLength = tNotes.length;
          const newNotes = [...[], ...tNotes];
          for (let i = 0; i < pnLength; i++) {
            let targetIndex = 0;
            let targetOverwrite = false;
            for (let j = 0; j < tnLength; j++) {
              if (pNotes[i].name === tNotes[i].name) {
                targetIndex = j;
                targetOverwrite = true;
                break;
              }
            }
            if (targetOverwrite) { // 重写覆盖
              dbRemoveNote({ uuid: newNotes[targetIndex].uuid }); // 删除原来的"删除记录"
              newNotes[targetIndex] = assign({}, pNotes[i], {
                status: 0,
              });
            } else { // 插入
              newNotes.push(assign({}, pNotes[i], {
                status: 0,
              }));
            }
          }
          dbUpdateNote({
            parentsId: targetProject.uuid,
            status: 0,
          }, {
            parentsId: uuid,
          });
          const newTrashProject = assign({}, trashProjects[tIndex], {
            uuid: project.uuid,
            description: project.description,
            labels: project.labels,
          });
          newTrashProject.notes = newNotes;
          const trashHashIndex = trashHash[targetProject.uuid];
          delete trashHash[targetProject.uuid];
          trashHash[uuid] = trashHashIndex;
          state.trashHash = assign({}, trashHash);
          state.trashProjects[tIndex] = newTrashProject;
        } else {
          state.trashHash[uuid] = state.trashProjects.length;
          project.status = 0;
          state.trashProjects.push(project);
        }
      } else { // 考虑去重以及合并
        const ti = trashHash[uuid];
        const { name, description, labels } = project;
        const pNotes = project.notes;
        const tNotes = state.trashProjects[trashHash[uuid]].notes;
        const pnLength = pNotes.length;
        const tnLength = tNotes.length;
        const newNotes = [...[], ...tNotes];
        for (let i = 0; i < pnLength; i++) {
          let targetIndex = 0;
          let targetOverwrite = false;
          for (let j = 0; j < tnLength; j++) {
            if (pNotes[i].name === tNotes[i].name) {
              targetIndex = j;
              targetOverwrite = true;
              break;
            }
          }
          if (targetOverwrite) { // 重写覆盖
            dbRemoveNote({ uuid: newNotes[targetIndex].uuid }); // 删除原来的"删除记录"
            newNotes[targetIndex] = assign({}, pNotes[i], {
              status: 0,
            });
          } else { // 插入
            newNotes.push(assign({}, pNotes[i], {
              status: 0,
            }));
          }
        }
        state.trashProjects[ti] = assign({}, state.trashProjects[ti], {
          name,
          description,
          labels,
        });
        state.trashProjects[ti].notes = newNotes;
      }
      const newState = assign({}, state);
      return assign({}, newState);
    }
    case RENAME_PROJECT: { // 对项目进行重命名
      const { uuid, name } = action;
      renameProject(uuid, name);
      state.projects[state.hash[uuid]].name = name;
      if (typeof state.trashHash[uuid] !== 'undefined') {
        state.trashProjects[state.trashHash[uuid]].name = name;
      }
      return assign({}, state);
    }
    case RENAME_NOTE: { // 对笔记进行重命名
      const { uuid, name, parentsId } = action;
      renameNote(uuid, name);
      const notes = state.projects[state.hash[parentsId]].notes;
      state.projects[state.hash[parentsId]].notes = notes.map((item) => {
        if (item.uuid === uuid) {
          item.name = name;
        }
        return item;
      });
      return assign({}, state);
    }
    case DELETE_NOTE: {
      const { uuid, parentsId, noteName, projectName, onlyDelete } = action;
      deleteNote(uuid);
      const pi = state.hash[parentsId];
      const notes = [...[], ...state.projects[pi].notes];
      const oldNotes = [...[], ...notes];
      const nl = notes.length;
      let ni;
      let delNote;
      for (let i = 0; i < nl; i++) {
        if (notes[i].uuid === uuid) {
          ni = i;
          delNote = assign({}, notes[i], { status: 0 });
          break;
        }
      }
      notes.splice(ni, 1);
      state.projects[pi].notes = notes;
      if (onlyDelete) {
        return assign({}, state);
      }
      const project = assign({}, state.projects[state.hash[parentsId]]);
      if (typeof state.trashHash[parentsId] === 'undefined') { // 废纸篓中不存在对应项目
        const { trashProjects, trashHash } = state;
        let tIndex = 0;
        const tpLength = trashProjects.length;
        let overwrite = false;
        let targetProject;
        for (let i = 0; i < tpLength; i++) {
          if (trashProjects[i].name === projectName) {
            tIndex = i;
            targetProject = trashProjects[i];
            overwrite = true;
            break;
          }
        }
        if (overwrite) {
          dbRemoveProject({
            uuid: targetProject.uuid,
            status: 0,
          });
          dbUpdateNote({ // 更新trashproject 下所有笔记 parentsId
            parentsId: targetProject.uuid,
            status: 0,
          }, {
            parentsId,
          });
          const pNotes = oldNotes;
          const tNotes = targetProject.notes;
          const pnLength = pNotes.length;
          const tnLength = tNotes.length;
          const newNotes = [...[], ...tNotes];
          for (let i = 0; i < pnLength; i++) {
            let targetIndex = 0;
            let targetOverwrite = false;
            for (let j = 0; j < tnLength; j++) {
              if (pNotes[i].name === tNotes[i].name) {
                targetIndex = j;
                targetOverwrite = true;
                break;
              }
            }
            if (targetOverwrite) { // 重写覆盖
              dbRemoveNote({ uuid: newNotes[targetIndex].uuid }); // 删除原来的"删除记录"
              newNotes[targetIndex] = assign({}, pNotes[i], {
                status: 0,
              });
            } else { // 插入
              newNotes.push(assign({}, pNotes[i], {
                status: 0,
              }));
            }
          }
          const newTrashProject = assign({}, trashProjects[tIndex], {
            uuid: project.uuid,
            description: project.description,
            labels: project.labels,
          });
          newTrashProject.notes = newNotes;
          const trashHashIndex = trashHash[targetProject.uuid];
          delete trashHash[targetProject.uuid];
          trashHash[uuid] = trashHashIndex;
          state.trashHash = assign({}, trashHash);
          state.trashProjects[tIndex] = newTrashProject;
          state.trash.projectUuid = project.uuid;
          state.trash.projectUuid = targetProject.uuid;
        } else {
          project.notes = [];
          project.status = 0;
          const ti = state.trashProjects.length;
          state.trashHash[parentsId] = ti;
          state.trashProjects.push(project);
          state.trashProjects[ti].notes.push(delNote);
        }
      } else { // 废纸篓中已经存在对应项目
        const ti = state.trashHash[parentsId];
        const { name, description, labels } = project;
        state.trashProjects[ti] = assign({}, state.trashProjects[ti], {
          name,
          description,
          labels,
          status: 0,
        });
        const tNotes = state.trashProjects[ti].notes;
        const tnLength = tNotes.length;
        let overwrite = false;
        let index = 0;
        let removeUuid = '';
        for (let i = 0; i < tnLength; i++) {
          if (noteName === tNotes[i].name) {
            overwrite = true;
            index = i;
            removeUuid = tNotes[i].uuid;
            dbRemoveNote({
              uuid: removeUuid,
              status: 0,
            });
          }
        }
        if (overwrite) {
          tNotes[index] = assign({}, delNote);
          state.trashProjects[ti].notes = tNotes;
        } else {
          state.trashProjects[ti].notes.push(delNote);
        }
      }
      return assign({}, state);
    }
    case UPDATE_NOTE_DESCRIPTION: { // 更新笔记描述
      const { parentsId, uuid, desc } = action;
      const param = {
        description: desc,
      };
      updateNoteInfo(uuid, param);
      state.projects[state.hash[parentsId]].notes = state.projects[state.hash[parentsId]].notes.map((item) => {
        if (item.uuid === uuid) {
          item.description = desc;
        }
        return item;
      });
      return assign({}, state);
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
    case SAVE_NOTE_ON_KEYDOWN: {
      const { parentsId, uuid } = action;
      const note = getNote(uuid);
      let needUpdateCloudStatus = false;
      if (note && note.oneDriver !== 0) {
        needUpdateCloudStatus = true;
      }
      const date = (new Date()).toString();
      const notes = state.projects[state.hash[parentsId]].notes.map((item) => {
        if (item.uuid === uuid) {
          item.latestDate = date;
          if (needUpdateCloudStatus) {
            item.oneDriver = 1;
          }
        }
        return item;
      });
      state.projects[state.hash[parentsId]].notes = notes;
      const param = {
        latestDate: date,
      };
      if (needUpdateCloudStatus) {
        param.oneDriver = 1;
      }
      updateNoteInfo(uuid, param);
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
      ipcRenderer.sendSync('save-content-to-file', {
        content,
        projectName: folder,
        fileName: name,
      });
      return assign({}, state);
    }
    default:
      return state;
  }
}

export default projectReducer;
