import { getAppMediumConfig } from 'Utils/db/app';


export default class Medium {
  constructor() {
    this.root = 'https://api.medium.com/v1';
  }

  static getMediumConfig() {
    const mediumAuthConfig = getAppMediumConfig();
    const mediumConfig = mediumAuthConfig.medium;
    return mediumConfig;
  }

  xhr(url, method, token, param) {
    const targetUrl = `${this.root}${url}`;
    let body = null;
    if (param) {
      body = JSON.stringify(param);
    }
    return new Promise((resolve, reject) => {
      const headers = {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
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

  getUser = token => this.xhr('/me', 'GET', token);

  postMarkdown = async (title, markdown) => {
    const { id, token, publishStatus } = Medium.getMediumConfig();
    const body = {
      title,
      contentFormat: 'markdown',
      content: markdown,
      tags: ['Yosoro'], // todo up to 5 tags
      publishStatus,
    };
    const url = `/users/${id}/posts`;
    return this.xhr(url, 'POST', token, body);
  }
}
