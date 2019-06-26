import path from 'path';
import fs from 'fs';
import github from './GitHub';
import weibo from './Weibo';
import smms from './SMMS';
import { formatDate } from '../../../views/utils/utils';

function base64Encode(filePath) {
  const bitmap = fs.readFileSync(filePath);
  return new Buffer(bitmap).toString('base64');
}

function formatFile(files) {
  if (files.base64 && files.name) {
    return;
  }
  if (files.filePath) {
    files.name = `${formatDate(new Date(), 'upload')}-${path.basename(files.filePath)}`;
    files.base64 = base64Encode(files.filePath);
  }
  if (!files.name) {
    files.name = `${formatDate(new Date(), 'upload')}-image.png`;
  }
}

export default async function uploder(payload) {
  const { files, imageHostingConfig } = payload;
  const current = imageHostingConfig.default;
  formatFile(files);
  if (current === 'github') {
    return github.upload(files, imageHostingConfig.github, current);
  }
  if (current === 'weibo') {
    return weibo.upload(files, imageHostingConfig.weibo, current);
  }
  if (current === 'SM.MS') {
    return smms.upload(files, current);
  }
  throw new Error('Upload Failed.');
}
