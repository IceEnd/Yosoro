import path from 'path';
import fs from 'fs';
import { productName, version } from '../package.json';

const electronInstaller = require('electron-winstaller');

const packageQueue = [];

function getOptions(appPath, arch) {
  return {
    appDirectory: appPath,
    outputDirectory: path.resolve(__dirname, '../out', `${productName}-win32-${arch}-setup-${version}`),
    authors: 'Alchemy',
    description: 'Beautiful Cloud Drive Markdown NoteBook Desktop App, based on React, Redux, Webpack, React Hot Loader for rapid application development',
    exe: `${productName}.exe`,
    iconUrl: path.resolve(__dirname, '../assets/icons/win/app.ico'),
    setupIcon: path.resolve(__dirname, '../assets/icons/win/app.ico'),
    setupExe: `${productName}-win32-${arch}-setup.exe`,
    noMsi: true,
  };
}

const apps = [{
  arch: 'ia32',
  path: path.resolve(__dirname, '../out/Yosoro-win32-ia32'),
}, {
  arch: 'x64',
  path: path.resolve(__dirname, '../out/Yosoro-win32-x64'),
}];

for (const app of apps) {
  if (fs.existsSync(app.path)) {
    const options = getOptions(app.path, app.arch);
    packageQueue.push(electronInstaller.createWindowsInstaller(options)
      .then(() => console.info(`${app.arch} build success.`), e => console.error(`${app.arch} build failed.\r\n ${e.message}`))
    );
  }
}

Promise.all(packageQueue)
  .then(() => {
    console.info('Build over.');
  });
