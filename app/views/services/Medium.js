import { getAppMedium } from 'Utils/db/app';


export default class Medium {
  constructor() {
    this.root = 'https://api.medium.com/v1';
    this.key = 0;
  }

  static getMediumConfig() {
    const mediumAuthConfig = getAppMedium();
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

  getUser = token => new Promise((resolve) => {
    const header = {
      Authorization: `Bearer ${token}`,
    };
    fetch('https://api.medium.com/v1/me', {
      method: 'GET',
      headers: header,
    }).then((response) => {
      const { status } = response;
      if (status === 200 || status === 201) {
        return response.json();
      }
      throw new Error('Fetching Failed.');
    }).then(res => resolve(res));
  });

  post = async () => {
    const { id, token } = Medium.getMediumConfig();
    const body = {
      title: 'title ggg',
      contentFormat: 'markdown',
      content: 'markdown test',
      tags: ['football', 'sport', 'Liverpool'],
      publishStatus: 'draft',
    };
    const url = `users/${id}/posts`;
    return this.xhr(url, 'POST', token, body);
  }
}
