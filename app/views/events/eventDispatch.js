import { EventEmitter } from 'events';

export default function createEvent() {
  const e = new EventEmitter();
  return e;
}

export const eventMD = createEvent();

export const eventTOC = createEvent();
