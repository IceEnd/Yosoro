import Notification from './Notification';

export const uploadNotification = new Notification({
  title: 'Image upload failed',
  body: 'Please check the network or configuration',
  key: 'editor-upload-notification',
});

export const successNotification = new Notification({
  title: 'Image upload success',
  body: 'Image has been upladed by Yosoro',
  key: 'upload-image-success-notification',
});

export const invaildNotification = new Notification({
  title: 'Only support uploading images',
  body: 'Support upload jpg, jpeg, png, svg, webp',
  key: 'editor-invaild-notification',
});

export const sigleNotification = new Notification({
  title: 'Image upload failed',
  body: 'Uploading multiple files is not supported',
  key: 'editor-single-file-notification',
});

export const authMediumFailed = new Notification({
  title: 'Auth Medium failed',
  body: 'Please check the token',
  key: 'auth-medium-failed-notification',
});

export const authMediumSuccess = new Notification({
  title: 'Auth Medium success',
  body: 'Authentication Medium success',
  key: 'auth-medium-success-notification',
});

export const postMediumFailed = new Notification({
  title: 'Post Medium failed',
  body: 'Please check your medium config',
  key: 'post-medium-success-notification',
});

export const postMediumSuccess = new Notification({
  title: 'Post Medium success',
  body: 'Post Medium success',
  key: 'post-medium-success-notification',
});
