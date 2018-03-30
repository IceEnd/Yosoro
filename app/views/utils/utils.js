// import { ipcRenderer } from 'electron';

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

// /**
//  * @description 异步读取文件内容
//  * @param {String} file - 文件路径
//  */
// export function getFileContent(file) {
//   return Promise((resolve, reject) => {
//     ipcRenderer.send()
//   });
// }
