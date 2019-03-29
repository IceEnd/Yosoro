import path from 'path';
import { src, dest, series } from 'gulp';
import jeditor from 'gulp-json-editor';
import del from 'del';
import webpack from 'webpack';
import webpackWeb from './webpack.config.renderer.prod.babel';
import webpackElectron from './webpack.config.electron.babel';

// clear renderer process files
function cleanRenderer() {
  del.sync([
    path.join(__dirname, '../lib/css/**'),
    path.join(__dirname, '../lib/vendor*'),
    path.join(__dirname, '../lib/*.html'),
    path.join(__dirname, '../lib/index*'),
    path.join(__dirname, '../lib/images/**'),
    path.join(__dirname, '../lib/webview/**'),
    path.join(__dirname, '../lib/fonts/**'),
  ]);
}

// after renderer process builded
function afterBuildRenderer() {
  del.sync([
    path.join(__dirname, '../lib/webview/webview.js'),
  ]);
}

// build renderer process
function buildRenderer(cb) {
  cleanRenderer();
  webpack(webpackWeb, (err) => {
    if (err) {
      throw err;
    }
    afterBuildRenderer();
    cb();
  });
}

// clear main process files
function cleanMain() {
  del.sync([
    path.join(__dirname, '../lib/main.js'),
    path.join(__dirname, '../lib/main.js.map'),
    path.join(__dirname, '../lib/resource'),
    path.join(__dirname, '../lib/assets'),
  ]);
}

// Copy Main process resource
function copyMainResource() {
  src(path.join(__dirname, '../app/main/resource/**'))
    .pipe(dest(path.join(__dirname, '../lib/resource')));
  src(path.join(__dirname, '../package.json'))
    .pipe(jeditor({
      main: './main.js',
    }))
    .pipe(dest(path.join(__dirname, '../lib')));
  src(path.join(__dirname, '../LICENSE'))
    .pipe(dest(path.join(__dirname, '../lib')));
  src(path.join(__dirname, ('../assets/**')))
    .pipe(dest(path.join(__dirname, '../lib/assets')));
}

// builld main process
function buildMain(cb) {
  cleanMain();
  webpack(webpackElectron, (err) => {
    if (err) {
      throw err;
    }
    copyMainResource();
    cb();
  });
}


const index = process.argv.findIndex(value => value === '--mode');

let build = series(buildRenderer, buildMain);

if (index !== -1) {
  const mode = process.argv[index + 1];
  switch (mode) {
    case 'renderer':
      build = buildRenderer;
      break;
    case 'main':
      build = buildMain;
      break;
    default:
      build = series(buildRenderer, buildMain);
      break;
  }
}

exports.default = build;
