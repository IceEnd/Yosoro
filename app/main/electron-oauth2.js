import queryString from 'querystring';
import fetch from 'node-fetch';
import nodeUrl from 'url';
import electron from 'electron';

const objectAssign = Object.assign;
const BrowserWindow = electron.BrowserWindow || electron.remote.BrowserWindow;

var generateRandomString = function (length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
};

module.exports = function (config, windowParams) {
  function getAuthorizationCode(opts) {
    opts = opts || {};

    if (!config.redirectUri) {
      config.redirectUri = 'urn:ietf:wg:oauth:2.0:oob';
    }

    var urlParams = {
      response_type: 'code',
      redirect_uri: config.redirectUri,
      client_id: config.clientId,
      state: generateRandomString(16)
    };

    if (opts.scope) {
      urlParams.scope = opts.scope;
    }

    if (opts.accessType) {
      urlParams.access_type = opts.accessType;
    }

    var url = config.authorizationUrl + '?' + queryString.stringify(urlParams);

    return new Promise(function (resolve, reject) {
      const authWindow = new BrowserWindow(windowParams || {'use-content-size': true});

      authWindow.loadURL(url);
      authWindow.show();

      authWindow.on('closed', () => {
        reject(new Error('window was closed by user'));
      });

      function onCallback(url) {
        var url_parts = nodeUrl.parse(url, true);
        var query = url_parts.query;
        var code = query.code;
        var error = query.error;

        if (error !== undefined) {
          reject(error);
          authWindow.removeAllListeners('closed');
          setImmediate(function () {
            authWindow.close();
          });
        } else if (code) {
          resolve(code);
          authWindow.removeAllListeners('closed');
          setImmediate(function () {
            try {
              authWindow.close();
            } catch (ex) {
              console.warn(ex);
            }
          });
        }
      }

      authWindow.webContents.on('will-navigate', (event, url) => {
        onCallback(url);
      });

      authWindow.webContents.on('did-get-redirect-request', (event, oldUrl, newUrl) => {
        onCallback(newUrl);
      });
    });
  }

  function tokenRequest(data) {
    const header = {
      'Accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded'
    };

    if (config.useBasicAuthorizationHeader) {
      header.Authorization = 'Basic ' + new Buffer(config.clientId + ':' + config.clientSecret).toString('base64');
    } else {
      objectAssign(data, {
        client_id: config.clientId,
        client_secret: config.clientSecret
      });
    }

    return fetch(config.tokenUrl, {
      method: 'POST',
      headers: header,
      body: queryString.stringify(data)
    }).then(res => {
      return res.json();
    });
  }

  function getAccessToken(opts) {
    return getAuthorizationCode(opts)
      .then(authorizationCode => {
        var tokenRequestData = {
          code: authorizationCode,
          grant_type: 'authorization_code',
          redirect_uri: config.redirectUri
        };
        tokenRequestData = Object.assign(tokenRequestData, opts.additionalTokenRequestData);
        return tokenRequest(tokenRequestData);
      });
  }

  function refreshToken(refreshToken) {
    return tokenRequest({
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
      redirect_uri: config.redirectUri
    });
  }

  return {
    getAuthorizationCode: getAuthorizationCode,
    getAccessToken: getAccessToken,
    refreshToken: refreshToken
  };
};
