import Datastore from 'nedb';

export default class Database {
  constructor(options) {
    this.db = new Datastore(options);
  }

  insert(doc) {
    return new Promise((resolve, reject) => {
      this.db.insert(doc, (err, newDoc) => {
        if (err) {
          reject(err);
        } else {
          resolve(newDoc);
        }
      });
    });
  }

  findAll(param = {}, sort = {}) {
    return new Promise((resolve, reject) => {
      this.db.find(param).sort(sort).exec((err, docs) => {
        if (err) {
          reject(err);
        } else {
          resolve(docs);
        }
      });
    });
  }
}
