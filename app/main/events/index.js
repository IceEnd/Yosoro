import Notes from './notes';
import Menus from './menus';
import Schedule from './schedule';
import Images from './images';

export default class Center {
  constructor(ctx) {
    this.notes = new Notes();
    this.menus = new Menus(ctx);
    this.schedule = new Schedule();
    this.images = new Images();
  }

  setListeners() {
    this.notes.setListeners();
    this.menus.setListeners();
    this.schedule.setListeners();
    this.images.setListeners();
  }

  clearListeners() {
    this.notes.clearListeners();
    this.menus.clearListeners();
    this.schedule.clearListeners();
    this.images.clearListeners();
  }
}
