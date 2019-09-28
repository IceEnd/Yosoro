import Notes from './notes';
import Menus from './menus';
import Schedule from './schedule';
import Images from './images';
import Common from './common';

export default class Center {
  constructor(ctx) {
    this.notes = new Notes();
    this.menus = new Menus(ctx);
    this.schedule = new Schedule();
    this.images = new Images();
    this.common = new Common();
  }

  setListeners() {
    this.notes.setListeners();
    this.menus.setListeners();
    this.schedule.setListeners();
    this.images.setListeners();
    this.common.setListeners();
  }

  clearListeners() {
    this.notes.clear();
    this.menus.clear();
    this.schedule.clear();
    this.images.clear();
    this.common.clear();
  }
}
