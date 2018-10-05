import fs from 'fs';

export default class FSDB {
  constructor(filePath) {
    this.filePath = filePath;
    this.data = {};
  }

  defaults(data) {
    const { filePath } = this;
    try {
      if (!fs.existsSync(filePath)) {
        this.data = data;
        this.write(data);
      } else {
        this.read();
      }
    } catch (ex) {
      console.warn(ex);
    }
  }

  update(data) {
    this.data = data;
    this.write(data);
  }

  write(data) {
    const { filePath } = this;
    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), {
        encoding: 'utf8',
      });
    } catch (ex) {
      console.warn(ex);
    }
  }

  read() {
    const { filePath } = this;
    try {
      const content = fs.readFileSync(filePath, {
        encoding: 'utf8',
      });
      this.data = JSON.parse(content);
    } catch (ex) {
      console.warn(ex);
    }
  }
}
