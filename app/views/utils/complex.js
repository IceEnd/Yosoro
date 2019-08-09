import { ipcRenderer } from 'electron';
import ExportHtml from './muya/lib/utils/exportHtml';

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

export default {
  generateHtml,
};
