import queryString from 'querystring';
import request from 'request-promise-native';
import nodeUrl from 'url';
import electron from 'electron';

const objectAssign = Object.assign;
const BrowserWindow = electron.BrowserWindow || electron.remote.BrowserWindow;

const generateRandomString = function (length) {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
};


export default class Oauth2 {
  constructor(config, windowParams) {
    this.config = config;
    this.windowParams = windowParams;
  }

  getAuthorizationCode(options) {
    const opts = options || {};

    const config = this.config;
    if (!config.redirectUri) {
      this.config.redirectUri = 'urn:ietf:wg:oauth:2.0:oob';
    }

    const urlParams = {
      response_type: 'code',
      redirect_uri: config.redirectUri,
      client_id: config.clientId,
      state: generateRandomString(16),
    };

    if (options.scope) {
      urlParams.scope = opts.scope;
    }

    if (options.accessType) {
      urlParams.access_type = opts.accessType;
    }

    const url = `${config.authorizationUrl}?${queryString.stringify(urlParams)}`;
    // const url ="localhost"

    return new Promise((resolve, reject) => {
      const authWindow = new BrowserWindow(this.windowParams || { 'use-content-size': true });

      authWindow.loadURL(url);
      authWindow.show();

      authWindow.on('closed', () => {
        reject(new Error('window was closed by user'));
      });

      function onCallback(cUrl) {
        const urlParts = nodeUrl.parse(cUrl, true);
        const query = urlParts.query;
        const code = query.code;
        const error = query.error;
        if (typeof error !== 'undefined') {
          reject(error);
          authWindow.removeAllListeners('closed');
          setImmediate(() => {
            authWindow.close();
          });
        } else if (code) {
          resolve(code);
          authWindow.removeAllListeners('closed');
          setImmediate(() => {
            try {
              authWindow.close();
            } catch (ex) {
              console.warn(ex);
            }
          });
        }
      }

      authWindow.webContents.on('did-navigate', (event, currentUrl) => {
        onCallback(currentUrl);
      });

      authWindow.webContents.on('did-get-redirect-request', (event, oldUrl, newUrl) => {
        onCallback(newUrl);
      });
    });
  }

  tokenRequest(data) {
    const header = {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    };

    if (this.config.useBasicAuthorizationHeader) {
      header.Authorization = `Basic ${new Buffer(`${this.config.clientId}:{this.config.clientSecret}`).toString('base64')}`;
    } else {
      objectAssign(data, {
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
      });
    }

    return request({
      url: this.config.tokenUrl,
      headers: header,
      body: queryString.stringify(data),
      json: true,
    });
  }

  getAccessToken(opts) {
    const config = this.config;
    return this.getAuthorizationCode(opts)
      .then((authorizationCode) => {
        let tokenRequestData = {
          code: authorizationCode,
          grant_type: 'authorization_code',
          redirect_uri: config.redirectUri,
        };
        tokenRequestData = Object.assign(tokenRequestData, opts.additionalTokenRequestData);
        return this.tokenRequest(tokenRequestData);
      });
  }

  refreshToken(refreshToken) {
    return this.tokenRequest({
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
      redirect_uri: this.config.redirectUri,
    });
  }
}
