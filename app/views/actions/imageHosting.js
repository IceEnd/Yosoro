const PRE = '[IMAGE]:';

export const UPLOAD_IMAGE = `${PRE}UPLOAD_IMGAE`;
export const UPLOAD_IMAGE_FAILED = `${PRE}UPLOAD_IMAGE_FAILED`;
export const UPLOAD_IMAGE_SUCCESS = `${PRE}UPLOAD_IMAGE_SUCCESS`;
export const IMAGES_GET_LIST = `${PRE}IMAGES_GET_LIST`;
export const IMAGES_DELETE = `${PRE}IMAGES_DELETE`;


export function uploadImage(config, files, uuid, from) {
  return {
    type: UPLOAD_IMAGE,
    imageHostingConfig: config,
    files,
    uuid,
    from,
  };
}

export function uploadImageSuccess(data) {
  return {
    type: UPLOAD_IMAGE_SUCCESS,
    data,
  };
}

export function uploadImageFailed() {
  return {
    type: UPLOAD_IMAGE_FAILED,
  };
}
