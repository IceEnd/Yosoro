import {
  UPLOAD_IMAGE,
  UPLOAD_IMAGE_FAILED,
  UPLOAD_IMAGE_SUCCESS,
} from 'Actions/imageHosting';

const assign = Object.assign;

export default function imageHosting(state = {
  uploadQueue: new Set(),
}, action) {
  switch (action.type) {
    case UPLOAD_IMAGE: {
      const { uuid } = action;
      if (state.uploadQueue.has(uuid)) {
        return state;
      }
      state.uploadQueue.add(uuid);
      return assign({}, state);
    }
    case UPLOAD_IMAGE_FAILED:
    case UPLOAD_IMAGE_SUCCESS:
    default:
      return state;
  }
}
