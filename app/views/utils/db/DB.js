export default class DB {
  constructor() {
    this.getValue = null;
    this.getName = null;
    this.findIndex = null;
    this.findFlag = false;
    this.findValue = null;
    this.searchValue = null;
    this.searchFlag = false;
  }

  // 判断是否包含项目
  has = (name) => {
    this.getValue = window.localStorage.getItem(name);
    return this;
  }

  // 设置项目
  set = (name, data) => {
    window.localStorage.setItem(name, JSON.stringify(data));
  }

  /**
   * @description 获取仓库
   * @param {String} name 仓库名称
   */
  get = (name) => {
    const value = JSON.parse(window.localStorage.getItem(name));
    this.getValue = value;
    this.getName = name;
    return this;
  }

  // 查找，只遍历一层
  find = (param) => {
    const arr = this.getValue;
    this.findFlag = true;
    this.findIndex = [];
    const items = arr.filter((item, index) => {
      let flag = false;
      for (const key in param) {
        if (item[key] === param[key]) {
          flag = true;
        } else {
          flag = false;
          break;
        }
      }
      if (flag) {
        this.findIndex.push(index);
      }
      return flag;
    });
    this.findValue = items;
    return this;
  }

  // 查找匹配
  search = (regList, reg) => {
    const arr = this.getValue;
    this.searchFlag = true;
    const items = arr.filter((item) => {
      let flag = false;
      const length = regList.length;
      for (let i = 0; i < length; i++) {
        if (reg.test(item[regList[i]]) && item.status === 1) {
          flag = true;
          break;
        }
      }
      return flag;
    });
    this.searchValue = items;
    return this;
  }

  // 更新记录
  assign = (param) => {
    const length = this.findIndex.length;
    for (let i = 0; i < length; i++) {
      const item = Object.assign({}, this.findValue[i], param);
      this.getValue[this.findIndex[i]] = item;
    }
    return this;
  }

  // 删除记录
  remove = (param) => {
    const arr = this.getValue;
    const newArr = arr.filter((item) => {
      let flag = true;
      for (const key in param) {
        if (item[key] === param[key]) {
          flag = true;
        } else {
          flag = false;
          break;
        }
      }
      return !flag;
    });
    this.getValue = newArr;
    return this;
  }

  // 删除记录
  del = () => {
    this.getValue.splice(this.index, 1);
    return this;
  }

  // 向数组之前插入
  push = (item) => {
    this.getValue.push(item);
    return this;
  }

  clear = () => {
    this.getName = null;
    this.getValue = null;
    this.findValue = null;
    this.findFlag = false;
    this.findIndex = null;
    this.searchValue = null;
    this.searchFlag = false;
  }

  // 写入值
  write = () => {
    this.set(this.getName, this.getValue);
    this.clear();
  }

  value = () => {
    let value;
    if (this.findFlag) {
      value = this.findValue;
    } else {
      value = this.getValue;
    }
    if (this.searchFlag) {
      value = this.searchValue;
    }
    this.clear();
    return value;
  }
}
