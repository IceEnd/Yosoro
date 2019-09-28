/**
 * @Channel IMAGES:
*/
import Event from './event';
import uploder from '../services/uploader/index';

export default class Common extends Event {
  eventSet = new Set([
    'pic-upload',
    'pic-upload-sync',
    'get-images-list',
    'images-delete',
  ]);

  constructor(ctx) {
    super(ctx);
    this.name = 'IMAGES';
  }

  setListeners() {
    this.listener('pic-upload', async (event, paylod) => {
      try {
        const res = await uploder(paylod);
        const doc = await global.RUNTIME.imageDB.insert(res);
        const { uuid, from } = paylod;
        event.sender.send('pic-upload', {
          code: 0,
          data: { ...doc, uuid, from },
        });
      } catch (ex) {
        console.warn(ex);
        event.sender.send('pic-upload', {
          code: -1,
          data: ex,
        });
      }
    });

    this.listener('pic-upload-sync', async (event, paylod) => {
      const seed = paylod.seed;
      try {
        const res = await uploder(paylod);
        const doc = await global.RUNTIME.imageDB.insert(res);
        event.sender.send(`pic-upload-sync-cb-${seed}`, {
          code: 0,
          data: doc,
        });
      } catch (ex) {
        console.warn(ex);
        event.sender.send(`pic-upload-sync-cb-${seed}`, {
          code: -1,
          data: ex,
        });
      }
    });

    this.listener('get-images-list', async (event) => {
      const list = await global.RUNTIME.imageDB.findAll({}, { date: -1 });
      event.sender.send('get-images-list', list);
    });

    this.listener('images-delete', (event, payload) => {
      global.RUNTIME.imageDB.remove({ _id: payload });
    });
  }
}
