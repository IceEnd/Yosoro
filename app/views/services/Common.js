export default class Common {
  constructor() {
    this.apiGitHubRoot = 'https://api.github.com';
    this.githubRepoAddr = '/IceEnd/Yosoro';
  }

  xhr = (url, method, param) => new Promise((resolve, reject) => {
    let targetUrl = url;
    let body = null;
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
    }
    fetch(targetUrl, {
      method,
      body,
    })
      .then((response) => {
        if (response.status === 200 || response.status === 201) {
          return response.json();
        }
        throw new Error('Fetching Failed.');
      })
      .then(json => resolve(json))
      .catch(ex => reject(ex));
  });

  /**
   * @desc 获取github仓库release列表
   */
  getRelease = () => {
    const { apiGitHubRoot, githubRepoAddr } = this;
    const url = `${apiGitHubRoot}/repos/${githubRepoAddr}/release`;
    return this.xhr(url, 'GET');
  }
}

