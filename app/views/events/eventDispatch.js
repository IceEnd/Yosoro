import { EventEmitter } from 'events';

export default function createEvent(name) {
  const e = new EventEmitter();
  e.BUS_NAME = name;
  return e;
}

export const eventMD = createEvent('markdown');

export const eventTOC = createEvent('toc');

export const eventFolder = createEvent('folder');
