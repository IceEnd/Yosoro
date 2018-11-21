import { BrowserWindow, app } from 'electron';
import fs from 'fs';
import path from 'path';
import { splitFlag } from './paths';
import { markedToHtml } from '../views/utils/utils';

export default class PDF {
  /**
   * Creates an instance of PDF.
   * @param {Array} notes 笔记数组
   * @param {String} folderPath 所在目录
   * @param {String} exportPath 导出目录
   * @memberof PDF
   */
  constructor(notes, folderPath, exportPath, isBook = true) {
    this.notes = notes;
    this.folderPath = folderPath;
    this.queue = [];
    this.tempPath = app.getPath('temp');
    this.exportPath = exportPath;
    this.isBook = isBook;
    this.getHtmlTemplate();
    this.initPDFQueue();
  }

  static printPDF(win, file, tempFile, resolve) {
    win.webContents.printToPDF({
      pageSize: 'A4',
      printBackground: true,
    }, (err, pdfData) => {
      win.removeAllListeners('did-finish-load');
      win.removeAllListeners('did-fail-load');
      win.close(); // 销毁window
      if (err) {
        throw err;
      }
      fs.writeFileSync(file, pdfData);
      if (fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile);
      }
      resolve('done');
    });
  }

  getHtml(file) {
    let content = fs.readFileSync(file, {
      encoding: 'utf8',
    });
    content = markedToHtml(content);
    return this.htmlTemplate
      .replace(/(<div\s+id="?root"?\s+class="?[\w-_]+"?\s*>)\s*(<\/div>)/, `$1${content}$2`);
  }

  getHtmlTemplate() {
    let temp = fs.readFileSync(path.resolve(__dirname, './webview/webview.html'), {
      encoding: 'utf8',
    });
    temp = temp
      .replace(/<style\s+data-for="?preview"?>(.|\r|\n)*<\/style>/, '');
    if (app.isPackaged) {
      // change link href
      temp = temp.replace('../css/webview/webview.css', path.resolve(__dirname, './css/webview/webview.css'));
    }
    this.htmlTemplate = temp;
  }

  // 初始化PDF生成队列
  initPDFQueue() {
    this.seed = 0;
    this.queue = [];
    for (const note of this.notes) {
      const promise = this.setPromise(note, this.seed);
      this.queue.push(promise);
      this.seed++;
    }
    return this.queue;
  }

  setPromise(note, seed) {
    const { folderPath, tempPath, exportPath, isBook } = this;
    return new Promise((resolve) => {
      const name = note.replace(/.md$/ig, '');
      let file = `${exportPath}${splitFlag}${name}.pdf`;
      if (!isBook) {
        file = exportPath;
      }
      const filePath = `${folderPath}/${note}`;
      const content = this.getHtml(filePath);
      const tempFile = `${tempPath}${splitFlag}yosoro_pdf_${seed}.html`;
      fs.writeFileSync(tempFile, content); // 写入临时html文件
      let windowToPDF = new BrowserWindow({
        show: false,
        webPreferences: {
          nodeIntegration: false,
        },
      });
      windowToPDF.loadURL(`file://${tempFile}`);
      let timer = setTimeout(() => {
        console.warn('waiting time over');
        PDF.printPDF(windowToPDF, file, tempFile, resolve);
      }, 10000);
      windowToPDF.webContents.once('did-finish-load', () => {
        clearTimeout(timer);
        timer = null;
        PDF.printPDF(windowToPDF, file, tempFile, resolve);
      });
      windowToPDF.webContents.once('did-fail-load', () => {
        clearTimeout(timer);
        timer = null;
        windowToPDF.removeAllListeners('did-finish-load');
        windowToPDF.removeAllListeners('did-fail-load');
        windowToPDF.destroy();
        windowToPDF = null;
        resolve('fail');
      });
    });
  }

  start() {
    return Promise.all(this.queue);
  }
}
