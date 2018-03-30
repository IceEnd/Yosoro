export const OPEN_MODAL = 'OPEN_MODAL';

export function openModal() {
  return {
    type: OPEN_MODAL,
    modal: {
      newServer: true,
      editServer: false,
      server: {},
    },
  };
}

export const OPEN_MODAL_EDIT = 'OPEN_MODAL_EDIT';
export function editModal(server) {
  return {
    type: OPEN_MODAL_EDIT,
    server,
  };
}

export const CLOSE_MODAL = 'CLOSE_MODAL';

export function closeModal() {
  return {
    type: CLOSE_MODAL,
    modal: {
      newServer: false,
      editServer: false,
      server: {},
    },
  };
}
