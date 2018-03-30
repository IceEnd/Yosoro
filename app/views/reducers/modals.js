import { OPEN_MODAL, CLOSE_MODAL, OPEN_MODAL_EDIT } from '../actions/modals';

const assign = Object.assign;

function updateModalsStatus(state = {
  gitSetting: false,
  server: {},
}, action) {
  switch (action.type) {
    case OPEN_MODAL:
      return assign({}, state, action.modal);
    case OPEN_MODAL_EDIT: // 编辑机器信息
      return assign({}, state, {
        newServer: false,
        editServer: true,
        server: action.server,
      });
    case CLOSE_MODAL:
      return assign({}, state, action.modal);
    default:
      return state;
  }
}

export default updateModalsStatus;
