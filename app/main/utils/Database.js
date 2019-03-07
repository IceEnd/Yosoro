import Datastore from 'nedb';

// function mixPromise(target, name, descriptor) {
//   return args =>
//     new Promise((resolve, reject) => {
//       descriptor(...args, (err, result) => {
//         if (err) {
//           reject(err);
//         } else {
//           resolve(result);
//         }
//       });
//     });
// }

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

  // find(param) {
  //   return new Promise((resolve, reject) => {
  //     this.db.find(param, (err))
  //   })
  // }
}
