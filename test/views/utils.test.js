import fs from 'fs';
import path from 'path';
import {
  formatDate,
  compareVersion,
  checkSpecial,
  markedToHtml,
  checkFileName,
  markedTOC,
  objectInject,
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

test('markdown to html: Header', () => {
  const html = markedToHtml('# h1');
  const target = /<h1 id="h1">h1<\/h1>/ig;
  expect(target.test(html)).toBe(true);
});

test('markdwon to html: TODO LIST', () => {
  let html = markedToHtml('- [ ] a');
  let target = /<ul>\s*<li class="task-list-li"><input class="task-list-item-checkbox" disabled type="checkbox" \/> a<\/li>\s*<\/ul>/ig;
  expect(target.test(html)).toBe(true);

  html = markedToHtml('- [x] a');
  target = /<ul>\s*<li class="task-list-li"><input class="task-list-item-checkbox" checked disabled type="checkbox" \/> a<\/li>\s*<\/ul>/ig;
  expect(target.test(html)).toBe(true);
});

test('markdwon to html: Code', () => {
  const html = markedToHtml('```js\r\nconsole.log(\'2333\');\r\n```');
  const target = /<pre>\s*<code class="language-js"><span class="hljs-built_in">console<\/span>.log\(<span class="hljs-string">'2333'<\/span>\);\s*<\/code><\/pre>/ig;
  expect(target.test(html)).toBe(true);
});

test('marked TOC', () => {
  const str = fs.readFileSync(path.resolve(__dirname, '../../README.md'), {
    encoding: 'utf8',
  });
  const headers = markedTOC(str);
  const length = headers.length;
  expect(length > 0).toBe(true);
  let flag = true;
  for (let i = 0; i < length; i++) {
    if (headers[i].type !== 'heading') {
      flag = false;
      break;
    }
  }
  expect(flag).toBe(true);
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
