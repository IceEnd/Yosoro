import {
  DRIVER_FETCHING_PROJECTS,
  DRIVER_FETCHING_PROJECRS_FAILED,
  DRIVER_FETCHING_PROJECRS_SUCCESS,
  DRIVER_FETCHING_NOTES,
  DRIVER_FETCHING_NOTES_SUCCESS,
  DRIVER_FETCHING_NOTES_FAILED,
  DRIVER_BACK_ROOT,
  DRIVER_DOWNLOAD_NOTE,
  DRIVER_DOWNLOAD_NOTE_SUCCESS,
  DRIVER_DOWNLOAD_NOTE_FAILED,
} from '../actions/driver';

const assign = Object.assign;

function updateDriver(state = {
  status: 0, // 0: fething 1: success 2:failed
  projects: [],
  notes: [],
  currentProjectName: '',
}, action) {
  switch (action.type) {
    case DRIVER_FETCHING_PROJECTS:
      return assign({}, state, {
        status: 0,
      });
    case DRIVER_FETCHING_PROJECRS_SUCCESS: {
      const { list } = action;
      state.projects = list;
      state.notes = [];
      state.status = 1;
      return assign({}, state);
    }
    case DRIVER_FETCHING_PROJECRS_FAILED:
      return assign({}, state, {
        status: 2,
      });
    case DRIVER_FETCHING_NOTES:
      return assign({}, state, {
        status: 0,
        currentProjectName: action.folder,
      });
    case DRIVER_FETCHING_NOTES_SUCCESS: {
      const { list } = action;
      state.notes = list;
      state.status = 1;
      return assign({}, state);
    }
    case DRIVER_FETCHING_NOTES_FAILED:
      return assign({}, state, {
        status: 2,
      });
    case DRIVER_BACK_ROOT:
      return assign({}, state, {
        currentProjectName: '',
        notes: [],
        state: 1,
      });
    case DRIVER_DOWNLOAD_NOTE:
      return assign({}, state, {
        status: 0,
      });
    case DRIVER_DOWNLOAD_NOTE_SUCCESS:
    case DRIVER_DOWNLOAD_NOTE_FAILED:
      return assign({}, state, {
        status: 1,
      });
    default:
      return state;
  }
}

export default updateDriver;
