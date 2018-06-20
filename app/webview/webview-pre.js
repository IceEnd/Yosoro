const ipcRenderer = require('electron').ipcRenderer;

let nodeRoot = null;

let currentMode = '';

/**
 * @description 检测编辑模式
 * @param {String} editorMode 编辑模式
 */
function checkMode(editorMode) {
  if (currentMode !== editorMode && currentMode === 'preview') {
    nodeRoot.classList.remove('preview');
  } else if (currentMode !== editorMode && editorMode === 'preview') {
    nodeRoot.classList.add('preview');
  }
  currentMode = editorMode;
}

function handleInnerClick(event) {
  if (!event) {
    return;
  }
  const node = event.target;
  event.preventDefault();
  if (node.tagName && node.tagName.toLowerCase() === 'a' && node.href) {
    ipcRenderer.sendToHost('did-click-link', node.href);
  }
}

document.addEventListener('click', handleInnerClick);

document.addEventListener('DOMContentLoaded', () => {
  ipcRenderer.sendToHost('wv-first-loaded');

  // 渲染预览页面
  ipcRenderer.on('wv-render-html', (event, args) => {
    let { html, editorMode } = args;
    html = html || '';
    editorMode = editorMode || 'normal';
    if (!nodeRoot) {
      nodeRoot = document.getElementById('root');
    }
    if (currentMode === '') {
      currentMode = editorMode;
    }
    checkMode(editorMode);
    nodeRoot.innerHTML = html;
  });

  ipcRenderer.on('wv-scroll', (event, radio) => {
    document.body.scrollTop = nodeRoot.offsetHeight * radio;
  });
});
