import { app, BrowserWindow, ipcMain } from 'electron';
import fs from 'fs';
import { splitFlag } from '../paths';

const TIME_OUT = 5000; // 5s 过期
let generatorSeed = 0;
let pdfSeed = 0;

const tempPath = app.getPath('temp');

function printPDF(win, file, tempFile, resolve) {
  win.webContents.printToPDF({
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
    pdfSeed++;
    resolve('done');
  });
}

// 导出为PDF
export function exportPDF(filePath, content) {
  const tempFile = `${tempPath}${splitFlag}yosoro_pdf_${pdfSeed}.html`;
  fs.writeFileSync(tempFile, content); // 写入临时html文件
  let windowToPDF = new BrowserWindow({
    show: false,
    webPreferences: {
      nodeIntegration: false,
    },
  });
  windowToPDF.loadURL(`file://${tempFile}`);
  return new Promise((resolve) => {
    let timer = setTimeout(() => {
      console.warn('waiting time over');
      printPDF(windowToPDF, filePath, tempFile, resolve);
    }, 10000);
    windowToPDF.webContents.once('did-finish-load', () => {
      clearTimeout(timer);
      timer = null;
      printPDF(windowToPDF, filePath, tempFile, resolve);
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

export function generateHtml(content) {
  let timer = null;
  const webContents = BrowserWindow.getAllWindows()[0].webContents;
  return new Promise((resolve, reject) => {
    webContents.send('generate-html', {
      seed: generatorSeed,
      content,
    });
    ipcMain.once(`return-generate-html-${generatorSeed}`, (event, payload) => {
      clearTimeout(timer);
      timer = null;
      if (payload.success) {
        resolve(payload.html);
      } else {
        reject(payload.msg);
      }
    });
    // 设置过期回调
    timer = setTimeout(() => {
      reject('time out.');
    }, TIME_OUT);
    generatorSeed++;
  });
}

function formatNumber(number) {
  if (number < 10) {
    return `0${number}`;
  }
  return `${number}`;
}


export function formatDate(date, type = 'normal') {
  const newDate = new Date(date);
  const year = newDate.getFullYear();
  const month = formatNumber(newDate.getMonth() + 1);
  const day = formatNumber(newDate.getDate());
  const hour = formatNumber(newDate.getHours());
  const minutes = formatNumber(newDate.getMinutes());
  const seconds = formatNumber(newDate.getSeconds());
  if (type === 'normal') {
    return `${year}-${month}-${day}  ${hour}:${minutes}:${seconds}`;
  }
  return `${year}${month}${day}${hour}${minutes}${seconds}`;
}
