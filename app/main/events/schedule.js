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

  setListeners() {
    this.listener('start-release-schedule', () => {
      schedule.releaseSchedule();
    });

    this.listener('start-release-schedule', () => {
      schedule.cancelReleases();
    });
  }
}
