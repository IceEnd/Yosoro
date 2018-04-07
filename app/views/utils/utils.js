// import { ipcRenderer } from 'electron';
import marked from 'marked';

const renderer = new marked.Renderer();

renderer.listitem = function (text) {
  let res = text;
  if (/^\s*\[[x ]\]\s*/.test(text)) {
    res = text.replace(/^\s*\[ \]\s*/, '<input class="task-list-item-checkbox" type="checkbox" disabled></input> ').replace(/^\s*\[x\]\s*/, '<input class="task-list-item-checkbox" checked disabled type="checkbox"></input> ');
    return `<li class="task-list-li">${res}</li>`;
  }
  return `<li>${text}</li>`;
};

marked.setOptions({
  renderer,
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: false,
  smartLists: true,
  smartypants: false,
  highlight: (code) => {
    const value = require('./highlight.min.js').highlightAuto(code).value;
    return value;
  },
});

function formatNumber(number) {
  if (number < 10) {
    return `0${number}`;
  }
  return number;
}


export function formatDate(date) {
  const newDate = new Date(date);
  const year = newDate.getFullYear();
  const month = formatNumber(newDate.getMonth() + 1);
  const day = formatNumber(newDate.getDate());
  const hour = formatNumber(newDate.getHours());
  const minutes = formatNumber(newDate.getMinutes());
  const seconds = formatNumber(newDate.getSeconds());
  return `${year}-${month}-${day}  ${hour}:${minutes}:${seconds}`;
}

/**
 * @param 将组件state存放至localStroge中
 * @param {String} componentName - 组件displayName
 * @param {Object} state - 组件state
 */
export function pushStateToStorage(componentName, state) {
  // const data = JSON.stringify(state);
  window.localStorage.setItem(componentName, JSON.stringify(state));
}

/**
 * @description 从localStorage中读取组件state与初始state合并
 * @param {String} componentName - 组件displayName
 * @param {Object} initState - 组件初始state
 */
export function mergeStateFromStorage(componentName, initState) {
  const str = window.localStorage.getItem(componentName);
  let obj;
  if (str) {
    obj = JSON.parse(str);
  } else {
    obj = {};
  }
  return Object.assign({}, initState, obj);
}

function formatVersion(string) {
  const version = string.replace(/\.|v|-beta/ig, '');
  return parseInt(version, 10);
}

/**
 * @desc 比较本地版本号与线上最新版本号
 * @param {String} localVersion 本地版本
 * @param {String} latestVersion 线上版本
 *
 * @return {Boolean} flag 是否需要更新
 */
export function compareVersion(localVersion, latestVersion) {
  if (localVersion === latestVersion) { // 不需要更新
    return false;
  }
  let localBeta = false;
  let latestBeta = false;
  if (/-beta/ig.test(localVersion)) {
    localBeta = true;
  }
  if (/-beta/ig.test(latestVersion)) {
    latestBeta = true;
  }
  const localFormatVersion = formatVersion(localVersion);
  const latestFormatVersion = formatVersion(latestVersion);
  if (localFormatVersion === latestFormatVersion && localBeta && !latestBeta) { // 本地是测试版本
    return true;
  }
  if (localFormatVersion === latestFormatVersion && !localBeta && latestBeta) { // 线上是测试版本
    return false;
  }
  if (localFormatVersion >= latestFormatVersion) {
    return false;
  }
  if (localFormatVersion < latestFormatVersion) {
    return true;
  }
  return false;
}

export function markedToHtml(string) {
  return marked(string);
}
