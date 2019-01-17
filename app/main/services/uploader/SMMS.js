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

// upload({
//   name: '20190117104657233s3.jpg',
//   base64: 'data:image/jpeg;base64,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',
// });

export default {
  upload,
};
