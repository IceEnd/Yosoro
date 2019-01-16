import Request from './Request';

const root = 'https://api.github.com';

const upload = async (files, config) => {
  const { branch, path, repo, token } = config;
  const { name, base64 } = files;
  const content = base64.replace(/^data:image\/(png|jpe?g|svg|gif);base64,/ig, '');
  const body = {
    message: 'Uploaded by Yosoro',
    content,
    branch,
    path: `${path}/${encodeURI(name)}`,
  };
  const url = `${root}/repos/${repo}/contents${encodeURI(path)}/${encodeURI(name)}`;

  try {
    const res = await Request({
      url,
      method: 'PUT',
      headers: {
        Authorization: `token ${token}`,
        'User-Agent': 'Yosoro',
      },
      body,
      json: true,
    });
    if (res.content) {
      return {
        name,
        url: res.content.download_url,
      };
    }
    throw new Error('Upload Fail');
  } catch (ex) {
    throw ex;
  }
};

export default {
  upload,
};
