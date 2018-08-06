import {
  formatDate,
  compareVersion,
  checkSpecial,
} from '../../app/views/utils/utils';

test('FormatDate new date', () => {
  const date = new Date();
  const resNormal = formatDate(date, 'normal');
  expect(/^\d{4}-\d{2}-\d{2} {2}\d{2}:\d{2}:\d{2}$/g.test(resNormal)).toBe(true);

  const resUpload = formatDate(date, 'upload');
  expect(/^\d{4}-\d{2}-\d{2}\.\d{2}\.\d{2}\.\d{2}$/g.test(resUpload)).toBe(true);
});


test('compare version case', () => {
  let oldVersion = '1.0.9';
  let newVersion = '1.1.0';
  expect(compareVersion(oldVersion, newVersion)).toBe(true);

  oldVersion = '1.1.0-beta';
  newVersion = '1.1.0';
  expect(compareVersion(oldVersion, newVersion)).toBe(true);

  oldVersion = '1.0.9';
  newVersion = '1.1.0-beta';
  expect(compareVersion(oldVersion, newVersion)).toBe(true);

  oldVersion = '1.0.9';
  newVersion = '1.0.9';
  expect(compareVersion(oldVersion, newVersion)).toBe(false);
});

test('str checkSpecial', () => {
  expect(checkSpecial('/2333', false)).toBe(false);
  expect(checkSpecial('2333:', false)).toBe(false);
  expect(checkSpecial('2333：', false)).toBe(false);
  expect(checkSpecial('正常测试', false)).toBe(true);
});
