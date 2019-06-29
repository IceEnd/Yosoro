import Request from './Request';

const UPLOAD_URL = 'http://picupload.service.weibo.com/interface/pic_upload.php?mime=image%2Fjpeg&data=base64&url=0&markpos=1&logo=&nick=0&marks=1&app=miniblog';

const login = (username, password) => Request({
  method: 'POST',
  url: 'https://passport.weibo.cn/sso/login',
  headers: {
    Referer: 'https://passport.weibo.cn/signin/login',
    Origin: 'https://passport.weibo.cn',
    contentType: 'application/x-www-form-urlencoded',
  },
  formData: {
    username,
    password,
  },
  json: true,
  resolveWithFullResponse: true,
});

const upload = async (files, config, current) => {
  const { username, password, quality, useCookie, cookie } = config;
  const { base64, name } = files;
  let res;
  try {
    if (!useCookie) {
      res = await login(username, password);
    }
    if (useCookie || res.body.retcode === 20000000) {
      if (res) { // login success
        const queue = [];
        for (const i in res.body.data.crossdomainlist) {
          queue.push(
            Request.get(res.body.data.crossdomainlist[i])
              .then(() => {
                Promise.resolve(true);
              })
              .catch(() => {
                // do nothing
                Promise.resolve(false);
              })
          );
        }
        await Promise.all(queue);
      }

      const options = {
        formData: {
          b64_data: base64.replace(/^data:image\/(png|jpe?g|svg|gif);base64,/ig, ''),
        },
      };

      if (useCookie) {
        options.headers = {
          Cookie: cookie,
        };
      }

      const date = Date.parse(new Date());

      let result = await Request.post(UPLOAD_URL, options);
      result = result.replace(/<.*?\/>/, '').replace(/<(\w+).*?>.*?<\/\1>/, '');

      const data = JSON.parse(result);
      if (data.data.pics.pic_1.pid === undefined) {
        throw new Error('Login Failed');
      }
      let extname = 'jpg';
      const match = /\.(gif|svg|png|jpg|jpeg)$/g.exec(name);
      if (match) {
        extname = match[1].toLowerCase();
      }
      extname = extname === 'gif' ? 'gif' : 'jpg';
      const url = `https://ws1.sinaimg.cn/${quality}/${data.data.pics.pic_1.pid}.${extname}`;
      return {
        name,
        url,
        platform: current,
        date,
      };
    }
  } catch (ex) {
    throw ex;
  }
};

export default {
  login,
  upload,
};
