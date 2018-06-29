export default class OneDrive {
  constructor() {
    const root = 'https://graph.microsoft.com';
    this.V1 = `${root}/v1.0`;
    this.BETA = `${root}/beta`;
  }

  xhr = (url, method, token, param, responseType = 'json', isBeta = false) => {
    let rootPath = this.V1;
    if (isBeta) {
      rootPath = this.BETA;
    }
    return new Promise((resolve, reject) => {
      let targetUrl = `${rootPath}${url}`;
      let body = null;
      let headers = {
        Authorization: `bearer ${token}`,
      };
      if (/get/ig.test(method) && param) {
        let queryString = '';
        for (const key in param) {
          queryString += `&${key}=${param[key]}`;
        }
        queryString = queryString.replace(/^&/ig, '');
        queryString = encodeURIComponent(queryString);
        targetUrl += queryString;
      } else if (/post/ig.test(method)) {
        body = JSON.stringify(param);
      } else if (/put/ig.test(method)) {
        headers = {
          Authorization: `bearer ${token}`,
          'Content-Type': 'text/plain; charset=UTF-8',
        };
        body = param;
      }
      fetch(targetUrl, {
        headers,
        method,
        body,
      })
        .then((response) => {
          const { status } = response;
          if (status === 200 || status === 201) {
            if (responseType === 'json') {
              return response.json();
            }
            if (responseType === 'text') {
              return response.text();
            }
            if (responseType === 'image') {
              return response.blob();
            }
            return response;
          } else if (status === 204) {
            return {
              success: true,
            };
          }
          throw new Error('Fetching Failed.');
        })
        .then(json => resolve(json))
        .catch(ex => reject(ex));
    });
  }

  getTokenByCode = (code) => {
    const encodeSecret = encodeURIComponent('bcdfnjKNMK0$-!wHQO6656]');
    const body = `client_id=35730bb9-a23a-46f9-aebf-5c2b9d6fc06c&redirect_uri=http://localhost&client_secret=${encodeSecret}
    &code=${encodeURIComponent(code)}&grant_type=authorization_code`;
    return new Promise((resolve, reject) =>
      fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        method: 'POST',
        body,
      })
        .then((response) => {
          if (response.status === 200) {
            return response.json();
          }
          throw new Error('Auth Failed.');
        })
        .then(json => resolve(json))
        .catch(ex => reject(ex))
    );
  }

  refreshToken = (refreshToken) => {
    const encodeSecret = encodeURIComponent('bcdfnjKNMK0$-!wHQO6656]');
    const body = `client_id=35730bb9-a23a-46f9-aebf-5c2b9d6fc06c&redirect_uri=http://localhost&client_secret=${encodeSecret}
    &refresh_token=${encodeURIComponent(refreshToken)}&grant_type=refresh_token`;
    return new Promise((resolve, reject) =>
      fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        method: 'POST',
        body,
      })
        .then((response) => {
          if (response.status === 200) {
            return response.json();
          }
          throw new Error('Auth Failed.');
        })
        .then(json => resolve(json))
        .catch(ex => reject(ex))
    );
  }

  getAppRoot = token => this.xhr('/drive/special/approot', 'GET', token);

  // 列出应用文件夹子项
  getAppRootChildren = token => this.xhr('/drive/special/approot/children', 'GET', token);

  // 列出应用文件夹子项
  getProjects = token => this.xhr('/drive/special/approot/children', 'GET', token);

  // 列出文件夹下所有笔记
  getNotes = (token, folder) => this.xhr(`/drive/special/approot:/${folder}:/children`, 'GET', token);

  getNoteContent = (token, folder, name) => this.xhr(`/drive/special/approot:/${folder}/${name}:/content`, 'GET', token, null, 'text');

  uploadSingleFile = (token, url, filePath) => this.xhr(url, 'PUT', token, filePath);

  deleteItem = (token, url) => this.xhr(url, 'DELETE', token);

  // 获取用户头像
  getUserAvatar = token => this.xhr('/me/photo/$value', 'GET', token, null, 'image', true);
}
