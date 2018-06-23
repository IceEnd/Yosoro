import path from 'path';
import installer from 'electron-installer-debian';
import { productName, version } from '../package.json';

const options = {
  bin: 'Yosoro',
  // name: 'Yosoro',
  productName,
  genericName: productName,
  categories: ['Utility'],
  src: path.resolve(__dirname, '../out', `${productName}-linux-x64`),
  dest: path.resolve(__dirname, '../out', `${productName}-linux-x64-deb-${version}`),
  arch: 'amd64',
  icon: path.resolve(__dirname, '../app/main/resource/app.png'),
  homepage: 'https://yosoro.coolecho.net',
};

installer(options)
  .then(() => console.info(`Successfully created package at ${options.dest}`))
  .catch((err) => {
    console.error(err, err.stack);
    process.exit(1);
  });
