import { remote } from 'electron';
import { notification } from 'antd';

const NavtiveNotification = remote.Notification;

export default class Notification {
  constructor(param) {
    const { title, body, key } = param;
    this.isSupported = NavtiveNotification.isSupported();
    if (this.isSupported) {
      this.native = new NavtiveNotification({
        title,
        body,
      });
    }
    this.title = title;
    this.body = body;
    this.key = key;
  }

  show() {
    if (this.isSupported && this.native) {
      this.native.show();
    } else {
      notification.open({
        message: this.title,
        description: this.body,
        key: this.key,
        duration: 3,
      });
    }
  }
}
