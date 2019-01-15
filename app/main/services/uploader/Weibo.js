import request from 'request-promise-native';
import { formatDate } from '../../../views/utils/utils';

const UPLOAD_URL = 'http://picupload.service.weibo.com/interface/pic_upload.php?mime=image%2Fjpeg&data=base64&url=0&markpos=1&logo=&nick=0&marks=1&app=miniblog';

const login = (username, password) => request({
  method: 'POST',
  url: 'https://passport.weibo.cn/sso/login',
  headers: {
    Referer: 'https://passport.weibo.cn/signin/login',
    Origin: 'https://passport.weibo.cn',
    contentType: 'application/x-www-form-urlencoded'
  },
  formData: {
    username,
    password,
  },
  json: true,
  resolveWithFullResponse: true,
});

const upload = async (files, config) => {
  const { username, password, quality, useCookie, cookie } = config;
  const { base64 } = files;
  // const uploadName = `${formatDate(new Date(), 'upload')}-${name}`;
  let res;
  try {
    if (!useCookie) {
      res = await login(username, password);
    }
    if (useCookie || res.body.retcode === 20000000) {
      if (res) { // login success
        const queue = [];
        for (const i in res.body.data.crossdomainlist) {
          queue.push(request.get(res.body.data.crossdomainlist[i]));
        }
        await Promise.all(queue);
      }

      const options = {
        method: 'POST',
        url: UPLOAD_URL,
        headers: {
          Referer: 'https://passport.weibo.cn/signin/login',
          Origin: 'https://passport.weibo.cn',
          contentType: 'application/x-www-form-urlencoded',
        },
        formData: {
          b64_data: base64.replace(/^data:image\/(png|jpe?g|svg|gif);base64,/ig, ''),
        },
      };

      if (useCookie) {
        options.headers = {
          Cookie: cookie,
        };
      }
      console.log(options);
      let result = await request(options);
      result = result.replace(/<.*?\/>/, '').replace(/<(\w+).*?>.*?<\/\1>/, '');

      const data = JSON.parse(result);
      // if (data.pics.pic_1.pid)
      console.log(result);
    }
  } catch (ex) {
    throw ex;
  }
};

export default {
  login,
  upload,
};
