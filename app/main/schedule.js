import { BrowserWindow } from 'electron';
import schedule from 'node-schedule';

export class Schedule {
  constructor() {
    this.releaseJob = null;
    this.releaseSeed = 0;
  }

  releaseSchedule() {
    if (this.releaseSeed >= 1) {
      return false;
    }
    this.releaseSeed += 1;
    // 每隔1小时检查更新
    const minutes = (new Date()).getMinutes();
    this.releaseJob = schedule.scheduleJob(`${minutes} * * * *`, () => {
      try {
        BrowserWindow.getAllWindows()[0].webContents.send('fetch-releases');
      } catch (ex) {
        console.warn(ex);
      }
    });
  }

  cancelReleases() {
    if (this.releaseJob) {
      this.releaseJob.cancel();
      this.releaseJob = null;
    }
  }
}

export default new Schedule();
