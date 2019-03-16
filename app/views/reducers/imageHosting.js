import {
  UPLOAD_IMAGE,
  UPLOAD_IMAGE_FAILED,
  UPLOAD_IMAGE_SUCCESS,
  IMAGES_GET_LIST,
  IMAGES_DELETE,
} from 'Actions/imageHosting';
import { ipcRenderer } from 'electron';

import * as notifications from 'Components/share/notifications';

export default function imageHosting(state = {
  images: [],
}, action) {
  switch (action.type) {
    case IMAGES_GET_LIST: {
      state.images = action.payload;
      return state;
    }
    case UPLOAD_IMAGE:
      return state;
    case UPLOAD_IMAGE_FAILED: {
      notifications.uploadNotification.show();
      return state;
    }
    case UPLOAD_IMAGE_SUCCESS: {
      const data = action.data;
      notifications.successNotification.show();
      delete data.uuid;
      state.images.unshift(data);
      return state;
    }
    case IMAGES_DELETE: { // delete image
      const { id, index } = action;
      state.images.splice(index, 1);
      ipcRenderer.send('images-delete', id);
      return { ...state };
    }
    default:
      return state;
  }
}
