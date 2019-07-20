import {
  formatDate,
  compareVersion,
  checkSpecial,
  checkFileName,
  objectInject,
  throttle,
  debounce,
} from '../../app/views/utils/utils';

test('FormatDate new date', () => {
  const date = new Date();
  const resNormal = formatDate(date, 'normal');
  expect(/^\d{4}-\d{2}-\d{2} {2}\d{2}:\d{2}:\d{2}$/g.test(resNormal)).toBe(true);

  const resUpload = formatDate(date, 'upload');
  expect(/\d{14}/g.test(resUpload)).toBe(true);
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
  expect(checkFileName('“file”')).toBe(true);
  expect(checkFileName('file，')).toBe(true);
  expect(checkFileName('file,')).toBe(true);
  expect(checkFileName('‘file’')).toBe(true);
  expect(checkFileName('file/')).toBe(true);
});

test('objectInject', () => {
  let res = objectInject({}, ['a', 'b'], 2);
  expect(res.a.b).toBe(2);

  res = objectInject({ a: 0 }, ['a', 'b'], 2);
  expect(res.a.b).toBe(2);

  res = objectInject({ a: { c: 1 } }, ['a', 'b'], 2);
  expect(res.a.b).toBe(2);
  expect(res.a.c).toBe(1);

  res = objectInject({ a: { b: 1 } }, ['a', 'b'], 2);
  expect(res.a.b).toBe(2);
});

test('debounce: should be called after waiting for expected time', () => {
  let n = 0;
  const debouncedIncrement = debounce(() => n++, 50);
  debouncedIncrement();
  debouncedIncrement();
  setTimeout(() => debouncedIncrement(), 10);
  setTimeout(() => {
    debouncedIncrement();
    expect(n).toBe(1);
  }, 100);
});

test('debounce: should pass correct context and arguments for handler', () => {
  let n = 0;
  const debouncedIncrement = debounce(() => n++, 50);
  debouncedIncrement();
  setTimeout(() => debouncedIncrement(), 10);
  expect(n).toBe(0);
  setTimeout(() => {
    debouncedIncrement();
    expect(n).toBe(1);
  }, 100);
});

test('throttle', () => {
  let n = 0;
  const throttleIncrement = throttle(() => n++, 50);
  throttleIncrement();
  setTimeout(() => throttleIncrement(), 10);
  expect(n).toBe(0);
  setTimeout(() => {
    throttleIncrement();
    expect(n).toBe(1);
  }, 100);
});
