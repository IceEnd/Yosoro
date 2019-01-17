import Request from './Request';

const url = 'https://sm.ms/api/upload';

const upload = async (files) => {
  const { name, base64 } = files;
  try {
    const content = Buffer.from(base64.replace(/^data:image\/(png|jpe?g|svg|gif);base64,/ig, ''), 'base64');
    const result = await Request({
      method: 'POST',
      url,
      headers: {
        contentType: 'multipart/form-data',
        'User-Agent': 'Yosoro',
      },
      formData: {
        smfile: {
          value: content,
          options: {
            filename: name,
          },
        },
        ssl: 'true',
      },
    });
    const body = JSON.parse(result);
    if (body.code === 'success') {
      return {
        name,
        url: body.data.url,
      };
    }
    throw new Error('Upload Failed');
  } catch (ex) {
    throw ex;
  }
};

export default {
  upload,
};
