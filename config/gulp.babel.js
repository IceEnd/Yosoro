import path from 'path';
import { src, dest, series } from 'gulp';
import jeditor from 'gulp-json-editor';
import del from 'del';
import webpack from 'webpack';
import merge from 'merge-stream';
import webpackWeb from './webpack.config.renderer.prod.babel';
import webpackElectron from './webpack.config.electron.babel';

// clear renderer process files
const cleanRenderer = (cb) => {
  del.sync([
    path.join(__dirname, '../lib/index.html'),
    path.join(__dirname, '../lib/deps/**'),
    path.join(__dirname, '../lib/*.html'),
    path.join(__dirname, '../lib/images/**'),
    path.join(__dirname, '../lib/webview.js'),
    path.join(__dirname, '../lib/webview-pre.js'),
    path.join(__dirname, '../lib/index.js'),
    path.join(__dirname, '../lib/fonts/**'),
    path.join(__dirname, '../lib/css/**'),
  ]);
  cb();
};
cleanRenderer.displayName = 'clean:renderer';


// after renderer process builded
const afterBuildRenderer = (cb) => {
  del.sync([
    path.join(__dirname, '../lib/webview.js'),
  ]);
  cb();
};
afterBuildRenderer.displayName = 'after:buildRenderer';

// build renderer process
const buildRenderer = (cb) => {
  webpack(webpackWeb, (err) => {
    if (err) {
      throw err;
    }
    cb();
  });
};
buildRenderer.displayName = 'build:renderer';

// clear main process files
const cleanMain = (cb) => {
  del.sync([
    path.join(__dirname, '../lib/main.js'),
    path.join(__dirname, '../lib/main.js.map'),
    path.join(__dirname, '../lib/resource'),
    path.join(__dirname, '../lib/assets'),
    path.join(__dirname, '../lib/LICENSE'),
    path.join(__dirname, '../lib/package.json'),
  ]);
  cb();
};
cleanMain.displayName = 'clean:main';

// Copy Main process resource
const copyMainResource = () => {
  const resource = src(path.join(__dirname, '../app/main/resource/**'))
    .pipe(dest(path.join(__dirname, '../lib/resource')));
  const pkg = src(path.join(__dirname, '../package.json'))
    .pipe(jeditor({
      main: './main.js',
    }))
    .pipe(dest(path.join(__dirname, '../lib')));
  const license = src(path.join(__dirname, '../LICENSE'))
    .pipe(dest(path.join(__dirname, '../lib')));
  const assets = src(path.join(__dirname, ('../assets/**')))
    .pipe(dest(path.join(__dirname, '../lib/assets')));
  return merge(
    resource,
    pkg,
    license,
    assets,
  );
};
copyMainResource.displayName = 'after:buildMain';

// builld main process
const buildMain = (cb) => {
  webpack(webpackElectron, (err) => {
    if (err) {
      throw err;
    }
    cb();
  });
};
buildMain.displayName = 'build:main';


exports.main = series(cleanMain, buildMain, copyMainResource);
exports.renderer = series(cleanRenderer, buildRenderer, afterBuildRenderer);
