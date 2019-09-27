/**
 * Event Class
 */

import { ipcMain } from 'electron';

export default class Event {
  eventSet = new Set([]);

  constructor(ctx) {
    this.ctx = ctx;
    this.name = 'EVENT';
  }

  setListeners = () => null;

  listener(channel, cb) {
    ipcMain.on(`${this.name}:${channel}`, (...args) => cb(args));
  }

  removeAllListenter(event) {
    if (this.eventSet.has(event)) {
      ipcMain.removeAllListeners(event);
    }
  }

  clear() {
    for (const listener of this.eventSet) {
      ipcMain.removeAllListeners(`${this.name}:${listener}`);
    }
  }
}
