import path from 'path';
import createDMG from 'electron-installer-dmg';
import { productName, version } from '../package.json';

createDMG({
  appPath: path.resolve(__dirname, '../out', `${productName}-darwin-x64/${productName}.app`),
  name: `${productName}-${version}`,
  icon: path.resolve(__dirname, '../assets/icons/osx/app.icns'),
  out: path.resolve(__dirname, '../out'),
  overwrite: true,
}, (err) => {
  if (err) {
    console.warn(err);
  }
});
