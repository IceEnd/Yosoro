import { BrowserWindow } from 'electron';
import schedule from 'node-schedule';

export class Schedule {
  constructor() {
    this.releaseJob = null;
  }

  releaseSchedule() {
    if (this.releaseJob) {
      return false;
    }
    // 每隔1小时检查更新
    this.releaseJob = schedule.scheduleJob('0 * * * *', () => {
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
