import request from 'request-promise-native';
import pkg from '../../../../package.json';

const Request = request.defaults({
  jar: request.jar(),
  'User-Agent': `Yosoro/${pkg.version}`,
});

export default Request;
