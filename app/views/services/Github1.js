/**
 * Github 图床类
 */
import { getAppImageHosting } from 'Utils/db/app';
import { blobToBase64, formatDate } from 'Utils/utils';

export default class GitHub {
  constructor() {
    this.root = 'https://api.github.com';
    this.key = 0;
  }

  static getGithubConfig() {
    const imageHostingConfig = getAppImageHosting();
    const githubConfig = imageHostingConfig.github;
    return githubConfig;
  }

  xhr(url, method, token, param) {
    const targetUrl = `${this.root}${url}`;
    let body = null;
    if (param) {
      body = JSON.stringify(param);
    }
    return new Promise((resolve, reject) => {
      const headers = {
        Authorization: `token ${token}`,
        'User-Agent': 'Yosoro',
      };
      fetch(targetUrl, {
        headers,
        method,
        body,
        json: true,
      })
        .then((response) => {
          const { status } = response;
          if (status === 200 || status === 201) {
            return response.json();
          }
          throw new Error('Fetching Failed.');
        })
        .then(res => resolve(res))
        .catch(ex => reject(ex));
    });
  }

  upload = async (files) => {
    const { branch, path, repo, token } = GitHub.getGithubConfig();
    const { name } = files;
    const base64 = await blobToBase64(files);
    const content = base64.replace(/^data:image\/(png|jpe?g|svg|gif);base64,/ig, '');
    const uploadName = `${formatDate(new Date(), 'upload')}-${name}`;
    const body = {
      message: 'Uploaded by Yosoro',
      content,
      branch,
      path: `${path}/${encodeURI(uploadName)}`,
    };
    const url = `/repos/${repo}/contents${encodeURI(path)}/${encodeURI(uploadName)}`;
    return this.xhr(url, 'PUT', token, body);
  }
}
