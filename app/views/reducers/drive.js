import { message } from 'antd';
import {
  DRIVE_FETCHING_PROJECTS,
  DRIVE_FETCHING_PROJECRS_FAILED,
  DRIVE_FETCHING_PROJECRS_SUCCESS,
  DRIVE_FETCHING_NOTES,
  DRIVE_FETCHING_NOTES_SUCCESS,
  DRIVE_FETCHING_NOTES_FAILED,
  DRIVE_BACK_ROOT,
  DRIVE_DOWNLOAD_NOTE,
  DRIVE_DOWNLOAD_NOTE_SUCCESS,
  DRIVE_DOWNLOAD_NOTE_FAILED,
  DRIVE_DELETE_ITEM,
  DRIVE_DELETE_ITEM_SUCCESS,
  DRIVE_DELETE_ITEM_FAILED,
} from '../actions/drive';

const assign = Object.assign;

function updateDriver(state = {
  status: 0, // 0: fething 1: success 2:failed
  projects: [],
  notes: [],
  currentProjectName: '',
}, action) {
  switch (action.type) {
    case DRIVE_FETCHING_PROJECTS:
      return assign({}, state, {
        status: 0,
      });
    case DRIVE_FETCHING_PROJECRS_SUCCESS: {
      const { list } = action;
      state.projects = list;
      state.notes = [];
      state.status = 1;
      return assign({}, state);
    }
    case DRIVE_FETCHING_PROJECRS_FAILED: {
      message.error(action.error.message || 'Failed to fetch.');
      console.warn(action.error);
      return assign({}, state, {
        status: 2,
      });
    }
    case DRIVE_FETCHING_NOTES:
      return assign({}, state, {
        status: 0,
        currentProjectName: action.folder,
      });
    case DRIVE_FETCHING_NOTES_SUCCESS: {
      const { list } = action;
      state.notes = list;
      state.status = 1;
      return assign({}, state);
    }
    case DRIVE_FETCHING_NOTES_FAILED: {
      message.error(action.error.message || 'Failed to fetch.');
      console.warn(action.error);
      return assign({}, state, {
        status: 2,
      });
    }
    case DRIVE_BACK_ROOT:
      return assign({}, state, {
        currentProjectName: '',
        notes: [],
        state: 1,
      });
    case DRIVE_DOWNLOAD_NOTE:
      return assign({}, state, {
        status: 0,
      });
    case DRIVE_DOWNLOAD_NOTE_SUCCESS:
      return assign({}, state, {
        status: 1,
      });
    case DRIVE_DOWNLOAD_NOTE_FAILED: {
      message.error(action.error.message || 'Failed to Download.');
      console.warn(action.error);
      return assign({}, state, {
        status: 1,
      });
    }
    case DRIVE_DELETE_ITEM:
      return assign({}, state, {
        status: 0,
      });
    case DRIVE_DELETE_ITEM_SUCCESS: {
      const { deleteType, itemId, jsonItemId } = action;
      if (deleteType === 'note') {
        const notes = state.notes.filter(item => item.id !== itemId && item.id !== jsonItemId);
        state.notes = notes;
      } else if (deleteType === 'notebook') {
        const projects = state.projects.filter(item => item.id !== itemId);
        state.projects = projects;
      }
      state.status = 1;
      return assign({}, state);
    }
    case DRIVE_DELETE_ITEM_FAILED: {
      message.error('Delete Failed.');
      return assign({}, state, {
        status: 1,
      });
    }
    default:
      return state;
  }
}

export default updateDriver;
