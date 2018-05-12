export const SWITCH_PROJECT = 'SWITCH_PROJECT';

export function switchProject(uuid, name) {
  return {
    type: SWITCH_PROJECT,
    uuid,
    name,
  };
}


export const SWITCH_FILE = 'SWITCH_NOTE';

export function switchFile(uuid, fileName) {
  return {
    type: SWITCH_FILE,
    uuid,
    fileName,
  };
}

export const CLEAR_NOTE = 'CLEAR_NOTE';

export function clearNote() {
  return {
    type: CLEAR_NOTE,
  };
}

export const CLEAR_NOTE_WORKSCAPE = 'CLEAR_NOTE_WORKSCAPE';

export function clearWorkspace() {
  return {
    type: CLEAR_NOTE_WORKSCAPE,
  };
}

export const UPDATE_NOTE_PROJECTNAME = 'UPDATE_NOTE_PROJECTNAME';

export function updateNoteProjectName(name) {
  return {
    type: UPDATE_NOTE_PROJECTNAME,
    name,
  };
}
