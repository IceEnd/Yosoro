/**
 * @description shcedule events
 * @channel SCHEDULE:
 */

import Event from './event';
import schedule from '../schedule';

export default class Schedule extends Event {
  eventSet = new Set([
    'start-release-schedule',
    'start-release-schedule',
  ]);

  constructor(ctx) {
    super(ctx);
    this.name = 'SCHEDULE';
  }

  setListener() {
    const listener = this.listener;

    listener('start-release-schedule', () => {
      schedule.releaseSchedule();
    });

    listener('start-release-schedule', () => {
      schedule.cancelReleases();
    });
  }
}
