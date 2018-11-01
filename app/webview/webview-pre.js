const ipcRenderer = require('electron').ipcRenderer;

let nodeRoot = null;

/**
 * 设置字体大小
 *
 * @param {Number} fontSize
 */
function setFontSize(fontSize) {
  if (fontSize) {
    document.getElementsByTagName('html')[0].style.fontSize = `${fontSize}px`;
  }
}

/**
 * @description 检测编辑模式
 * @param {String} editorMode 编辑模式
 */
function checkMode(editorMode) {
  if (editorMode === 'preview') {
    if (!nodeRoot.classList.contains('preview')) {
      nodeRoot.classList.add('preview');
    }
  } else if (editorMode !== 'preview') {
    if (nodeRoot.classList.contains('preview')) {
      nodeRoot.classList.remove('preview');
    }
  }
}

function setPlatform(platform) {
  if (!platform) return;
  const value = platform ? `os-${platform}` : '';
  const currentClass = document.documentElement.className;
  if (/\bos-\w+\b/.test(currentClass)) {
    document.documentElement.className = currentClass.replace(/\bos-\w+\b/, value);
  } else {
    document.documentElement.className = `${currentClass ? `${currentClass} ` : ''}${value}`;
  }
}

function setTheme(theme) {
  const value = theme ? `wv-${theme}` : 'wv-light';
  document.documentElement.className = document.documentElement.className.replace(/\bwv-\w*\b/, value);
  // if (nodeRoot) {
  //   nodeRoot.className = nodeRoot.className.replace(/\bwv-\w*\b/, value);
  // }
}

function handleInnerClick(event) {
  if (!event) {
    return;
  }
  const node = event.target;
  event.preventDefault();
  if (node.tagName && node.tagName.toLowerCase() === 'a' && node.href) {
    if (node.getAttribute('href') === '#') { // 回到顶部
      document.body.scrollTop = 0;
    } else if (node.hash && (node.getAttribute('href') === node.hash)) {
      const scrollTarget = event.view.document.getElementById(node.hash.substr(1, node.hash.length - 1).toLowerCase());
      if (scrollTarget) {
        scrollTarget.scrollIntoView();
      }
    } else {
      ipcRenderer.sendToHost('did-click-link', node.href);
    }
  }
}

document.addEventListener('click', handleInnerClick);

document.addEventListener('DOMContentLoaded', () => {
  ipcRenderer.sendToHost('wv-first-loaded');

  // 渲染预览页面
  ipcRenderer.on('wv-render-html', (event, args) => {
    let { html, editorMode } = args;
    const { theme, platform } = args;
    const { fontSize } = args;
    // 设置字体大小
    setFontSize(fontSize);
    html = html || '';
    editorMode = editorMode || 'normal';
    if (!nodeRoot) {
      nodeRoot = document.getElementById('root');
    }
    checkMode(editorMode);
    setPlatform(platform);
    setTheme(theme);
    nodeRoot.innerHTML = html;
  });

  ipcRenderer.on('wv-scroll', (event, radio) => {
    document.body.scrollTop = (nodeRoot.scrollHeight * radio) - document.body.clientHeight;
  });

  ipcRenderer.on('wv-change-fontsize', (event, fontSize) => {
    setFontSize(fontSize);
  });

  ipcRenderer.on('scroll-target', (event, data) => {
    const { text, depth } = data;
    const tagName = `h${depth}`;
    const headers = document.getElementsByTagName(tagName);
    let scrollTarget;
    const length = headers.length;
    for (let i = 0; i < length; i++) {
      if (headers[i].innerText === text) {
        scrollTarget = headers[i];
        break;
      }
    }
    if (scrollTarget) {
      scrollTarget.scrollIntoView();
    }
  });
});
