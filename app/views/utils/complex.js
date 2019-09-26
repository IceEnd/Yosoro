import { ipcRenderer } from 'electron';
import ExportHtml from './muya/lib/utils/exportHtml';

const TIME_OUT = 3000;
let ipcSeed = 0;

// muya generatorHtml
export async function generateHtml(payload) {
  const { seed, content } = payload;
  const back = `return-generate-html-${seed}`;
  try {
    const eh = new ExportHtml(content, null);
    const html = await eh.generate();
    ipcRenderer.send(back, {
      success: true,
      html,
    });
  } catch (ex) {
    ipcRenderer.send(back, {
      success: false,
      msg: ex.toString(),
    });
  }
}

/**
 * ipc
 * @param {String} channel channel name
 * @param {*} data
 * @param {Obejct} options
 */
export function sendIPC(channel, data, options = {}) {
  const returnChannel = `${channel}-return-${ipcSeed++}`;
  const timeOut = options.timeOut || TIME_OUT;
  return new Promise((resolve, reject) => {
    let timer = setTimeout(() => {
      reject('time out.');
    }, timeOut);
    ipcRenderer.once(returnChannel, (...args) => {
      clearTimeout(timer);
      timer = null;
      resolve(args);
    });
    ipcRenderer.send(channel, data);
  });
}
