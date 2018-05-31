import { BrowserWindow, app } from 'electron';
import fs from 'fs';
import { markedToHtml } from '../views/utils/utils';


// const style = '<html><head></head><body><div class="preview-body">';

export function getContent(file) {
  let content = fs.readFileSync(file, {
    encoding: 'utf8',
  });
  content = markedToHtml(content);
  return `<html><head><style>
  .preview-body{width:100%;overflow-x:hidden;box-sizing:border-box;padding:.5rem}.preview-body *{box-sizing:border-box;word-break:break-all;word-wrap:break-word}.preview-body :first-child{margin-top:0!important}.preview-body ol,.preview-body ul{padding-left:.5rem}.preview-body ul li{position:relative;list-style-type:disc;list-style-position:inside;padding-left:.2em}.preview-body p{margin-top:0;margin-bottom:1rem}.preview-body ol li{list-style-type:decimal;list-style-position:inside}.preview-body .task-list-li{list-style-type:none;padding-left:.2rem}.preview-body .task-list-li:before{display:none}.preview-body img{max-width:100%;height:auto}.preview-body h1,.preview-body h2,.preview-body h3,.preview-body h4,.preview-body h5,.preview-body h6{border-bottom:1px solid #eaecef;margin-top:1.8rem;margin-bottom:1.2rem}.preview-body a{color:#0366d6;text-decoration:none}.preview-body hr{border:0;border-top:3px solid #eaecef;margin-bottom:1rem}.preview-body table{display:block;width:100%;overflow:auto;margin-bottom:1rem;border-collapse:collapse;border-spacing:0}.preview-body table tr{display:table-row;vertical-align:inherit;border-color:inherit;background-color:#fff;border-top:1px solid #c6cbd1}.preview-body table tr:nth-child(2n){background-color:#f6f8fa}.preview-body td,.preview-body th{display:table-cell;vertical-align:inherit}.preview-body thead{display:table-header-group;vertical-align:middle;border-color:inherit}.preview-body thead th{padding:.4rem .8rem;border:1px solid #dfe2e5}.preview-body tbody{display:table-row-group;vertical-align:middle;border-color:inherit}.preview-body tbody td{padding:.4rem .8rem;border:1px solid #dfe2e5}.preview-body code{padding:.2em .4em;margin:0;font-size:85%;background-color:rgba(27,31,35,.05);border-radius:.2rem}.preview-body blockquote{padding:0 1em;color:#6a737d;padding:.3em 1em;background-color:#ebebeb;border-left:.25em solid #dfe2e5}.preview-body blockquote>:last-child{margin-bottom:0}.preview-body blockquote>:first-child{margin-top:0}.preview-body pre{padding:1rem;overflow:auto;font-size:85%;line-height:1.45;background-color:rgba(27,31,35,.05);border-radius:.2rem}.preview-body pre code{padding:0;background-color:transparent}.preview-body .task-list-item-checkbox{margin-right:.3rem;vertical-align:middle;margin-bottom:.25em}.light .hljs{display:block;overflow-x:auto;padding:.5em;background:#f0fff0}.light .hljs,.light .hljs-subst{color:#444}.light .hljs-comment{color:#888}.light .hljs-attribute,.light .hljs-doctag,.light .hljs-keyword,.light .hljs-meta-keyword,.light .hljs-name,.light .hljs-selector-tag{font-weight:700}.light .hljs-deletion,.light .hljs-number,.light .hljs-quote,.light .hljs-selector-class,.light .hljs-selector-id,.light .hljs-string,.light .hljs-template-tag,.light .hljs-type{color:#800}.light .hljs-section,.light .hljs-title{color:#800;font-weight:700}.light .hljs-link,.light .hljs-regexp,.light .hljs-selector-attr,.light .hljs-selector-pseudo,.light .hljs-symbol,.light .hljs-template-variable,.light .hljs-variable{color:#bc6060}.light .hljs-literal{color:#78a960}.light .hljs-addition,.light .hljs-built_in,.light .hljs-bullet,.light .hljs-code{color:#397300}.light .hljs-meta{color:#1f7199}.light .hljs-meta-string{color:#4d99bf}.light .hljs-emphasis{font-style:italic}.light .hljs-strong{font-weight:700}
    </style></head><body><div class="preview-body">${content}</div></body></html>`;
}

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
    this.initPDFQueue();
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
      let file = `${exportPath}/${name}.pdf`;
      if (!isBook) {
        file = exportPath;
      }
      const filePath = `${folderPath}/${note}`;
      const content = getContent(filePath);
      const tempFile = `${tempPath}/yosoro_pdf_${seed}.html`;
      fs.writeFileSync(tempFile, content); // 写入临时html文件
      let windowToPDF = new BrowserWindow({ show: false });
      windowToPDF.loadURL(`file://${tempFile}`);
      setTimeout(() => {
        windowToPDF.webContents.printToPDF({
          pageSize: 'A4',
          printBackground: true,
        }, (err, pdfData) => {
          windowToPDF.destroy(); // 销毁window
          windowToPDF = null;
          if (err) {
            throw err;
          }
          fs.writeFileSync(file, pdfData);
          if (fs.existsSync(tempFile)) {
            fs.unlinkSync(tempFile);
          }
          resolve('done');
        });
      }, 1000);
    });
  }

  start() {
    return Promise.all(this.queue);
  }
}
