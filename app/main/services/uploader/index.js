import github from './GitHub';
import weibo from './Weibo';

export default async function uploder(payload) {
  const { files, imageHostingConfig } = payload;
  const current = imageHostingConfig.default;
  if (current === 'github') {
    return github.upload(files, imageHostingConfig.github);
  }
  if (current === 'weibo') {
    return weibo.upload(files, imageHostingConfig.weibo);
  }
  throw new Error('Upload Failed.');
}
