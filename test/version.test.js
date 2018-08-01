import pkg from '../package.json';
import pkgInfo from '../app/main/package.json';

test('check version', () => {
  expect(pkg.version === pkgInfo.version).toBe(true);
});
