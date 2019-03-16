import {
  SWITCH_PROJECT,
  SWITCH_FILE,
  CLEAR_NOTE,
  CLEAR_NOTE_WORKSCAPE,
  UPDATE_NOTE_PROJECTNAME,
  UPDATE_NOTE_FILENAME,
} from '../actions/note';

const assign = Object.assign;

export default function updateNote(state = {
  projectUuid: '-1',
  projectName: '',
  fileUuid: '-1',
  fileName: '',
}, action) {
  switch (action.type) {
    case SWITCH_PROJECT: {
      const { uuid, name } = action;
      return assign({}, state, {
        projectUuid: uuid,
        projectName: name,
      });
    }
    case SWITCH_FILE:
      return assign({}, state, {
        fileUuid: action.uuid,
        fileName: action.fileName,
      });
    case CLEAR_NOTE:
      return assign({}, state, {
        fileUuid: '-1',
        fileName: '',
      });
    case CLEAR_NOTE_WORKSCAPE:
      return assign({}, {
        projectUuid: '-1',
        projectName: '',
        fileUuid: '-1',
        fileName: '',
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
