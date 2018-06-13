const ipcRenderer = require('electron').ipcRenderer;

document.addEventListener('DOMContentLoaded', () => {
  ipcRenderer.sendToHost('wv-first-loaded');

  // 渲染预览页面
  ipcRenderer.on('wv-render-html', (event, html) => {
    const root = document.getElementById('root');
    root.innerHTML = html;
  });
});
